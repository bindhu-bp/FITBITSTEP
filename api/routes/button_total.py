from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter()

class ButtonTotalRequest(BaseModel):
    userEmail: str

@router.post("/buttonTotal")
async def button_total(request: ButtonTotalRequest):
    connection = get_db_connection()
    
    try:
        cursor = connection.cursor()
        
        # Adjust the SQL query to sum the step count for the current week.
        cursor.execute("""
            SELECT SUM(s.stepcount) AS total_stepcount 
            FROM users u 
            JOIN stepcount s ON u.user_id = s.user_id 
            WHERE u.email_id = %s AND s.date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
            GROUP BY u.user_id""", (request.userEmail,))
        
        totalStepCount = cursor.fetchone()

    finally:
        cursor.close()
        connection.close()  # Ensure the connection is closed

    if totalStepCount:
        total_stepcount = totalStepCount['total_stepcount']
    else:
        total_stepcount = 0
    
    return {'total_stepcount': total_stepcount}
