from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter()

class UpdateStepCountRequest(BaseModel):
    userEmail: str
    stepCount: int
    date: str

@router.post("/updateStepCount")
async def update_step_count(request: UpdateStepCountRequest):
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT sc.stepcount FROM stepcount sc 
            JOIN users u ON sc.user_id = u.user_id 
            WHERE u.email_id = %s AND sc.date = %s""", 
            (request.userEmail, request.date))
        existing_entry = cursor.fetchone()
        
        if existing_entry:
            return {"message": "exists"}  # Entry already exists
        
        cursor.execute("""
            INSERT INTO stepcount (user_id, stepcount, date) 
            SELECT u.user_id, %s, %s FROM users u WHERE u.email_id = %s""",
            (request.stepCount, request.date, request.userEmail))
        connection.commit()
        return {"message": "Step count updated successfully!"}
    
    finally:
        cursor.close()
        connection.close()
