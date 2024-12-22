from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection  # Ensure this function returns a valid database connection

router = APIRouter()

class UpdateStepCountRequest(BaseModel):
    userEmail: str
    stepCount: int
    date: str  # Ensure the date is in 'YYYY-MM-DD' format


@router.post("/updateStepCount")
async def update_step_count(request: UpdateStepCountRequest):
    """
    Updates or inserts step count for a user on a given date.
    If the record exists, it updates the step count and sets the source to 'manual'.
    If the record doesn't exist, it inserts a new record.
    """
    connection = get_db_connection()  # Get a database connection
    try:
        cursor = connection.cursor()
        
        # Insert a new record or update the existing one
        cursor.execute("""
            INSERT INTO stepcount (user_id, stepcount, date, source) 
            SELECT u.user_id, %s, %s, 'manual' FROM users u WHERE u.email_id = %s
            ON DUPLICATE KEY UPDATE 
                stepcount = VALUES(stepcount),
                source = 'manual'""",
            (request.stepCount, request.date, request.userEmail))
        
        connection.commit()  # Commit the transaction
        return {"message": "Step count recorded or updated successfully!"}
    
    except Exception as e:
        # Log the error and raise an HTTPException
        connection.rollback()  # Ensure the transaction is rolled back on error
        raise HTTPException(status_code=500, detail=f"Failed to update step count: {str(e)}")
    
    finally:
        cursor.close()  # Close the cursor
        connection.close()  # Close the connection
