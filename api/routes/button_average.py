from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter()

class ButtonAverageRequest(BaseModel):
    userEmail: str

@router.post("/buttonAverage")
async def button_average(request: ButtonAverageRequest):
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        
        # Calculate average step count for the current week.
        cursor.execute("""
            SELECT AVG(s.stepcount) AS average_stepcount FROM users u 
            JOIN stepcount s ON u.user_id = s.user_id 
            WHERE u.email_id = %s AND s.date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
            GROUP BY u.user_id""", (request.userEmail,))
        
        averageStepCount = cursor.fetchone()

    finally:
        cursor.close()

    if averageStepCount:
         average_stepcount_value= averageStepCount['average_stepcount']
    else:
         average_stepcount_value= 0
    
    return {'average_stepcount': average_stepcount_value}
