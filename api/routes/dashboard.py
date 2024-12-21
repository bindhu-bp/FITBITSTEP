from fastapi import APIRouter
from db import get_db_connection
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
async def dashboard():
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=6)
    
    connection = get_db_connection()
    try:
        cursor = connection.cursor()

        # Total steps query for last 7 days.
        cursor.execute("""
            SELECT u.user_id, u.email_id, SUM(sc.stepcount) AS total_steps 
            FROM users u JOIN stepcount sc ON u.user_id = sc.user_id 
            WHERE sc.date BETWEEN %s AND %s GROUP BY u.user_id""", (start_date, end_date))
        
        total_steps_rows = cursor.fetchall()

        # Average steps query for last 7 days.
        cursor.execute("""
            SELECT u.user_id, AVG(sc.stepcount) AS average_steps 
            FROM users u JOIN stepcount sc ON u.user_id = sc.user_id 
            WHERE sc.date BETWEEN %s AND %s GROUP BY u.user_id""", (start_date, end_date))
        
        average_steps_rows = cursor.fetchall()

        # Last 7 days data query.
        last_7_days_data = {}
        
        cursor.execute("""
            SELECT u.user_id, sc.date, SUM(sc.stepcount) AS steps 
            FROM users u JOIN stepcount sc ON u.user_id = sc.user_id 
            WHERE sc.date BETWEEN %s AND %s GROUP BY u.user_id, sc.date""", (start_date, end_date))
        
        last_7_days_rows = cursor.fetchall()

        for row in last_7_days_rows:
            user_id = row['user_id']
            date = row['date'].strftime("%Y-%m-%d")  # Formatting date to YYYY-MM-DD.
            steps = row['steps']
            
            if user_id not in last_7_days_data:
                last_7_days_data[user_id] = []
                
            last_7_days_data[user_id].append({"date": date, "steps": steps})

        # Restructure data with total_steps and average_steps for each user.
        user_data = {}
        
        for total_row in total_steps_rows:
            user_data[total_row['user_id']] = {
                "user_id": total_row['user_id'],
                "email": total_row['email_id'],
                "last_7_days": last_7_days_data.get(total_row['user_id'], [])
            }

        return [user_data[user_id] for user_id in user_data]
    
    finally:
        cursor.close()
        connection.close()
