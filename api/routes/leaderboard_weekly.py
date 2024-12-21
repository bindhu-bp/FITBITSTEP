from fastapi import APIRouter
from db import get_db_connection

router = APIRouter()

@router.get("/leaderboardWeekly")
async def leaderboard_weekly():
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT u.name, ROUND(AVG(sc.stepcount), 0) AS avg_steps 
            FROM users u 
            JOIN stepcount sc ON u.user_id = sc.user_id 
            WHERE sc.date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
              AND sc.date <= CURDATE() 
            GROUP BY u.user_id 
            ORDER BY avg_steps DESC
        """)
        
        rows = cursor.fetchall()  # Now rows will be dictionaries
        return [{"name": row['name'], "avg_steps": row['avg_steps']} for row in rows]
    
    finally:
        cursor.close()
        connection.close()