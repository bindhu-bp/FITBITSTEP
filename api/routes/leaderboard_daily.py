from fastapi import APIRouter
from db import get_db_connection

router = APIRouter()

@router.get("/leaderboardDaily")
async def leaderboard_daily():
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT u.name, sc.stepcount FROM users u 
            JOIN stepcount sc ON u.user_id = sc.user_id 
            WHERE DATE(sc.date) = CURDATE() ORDER BY sc.stepcount DESC""")
        
        users = cursor.fetchall()
        return [{"name": user['name'], "stepcount": user['stepcount']} for user in users]
    
    finally:
        cursor.close()
        connection.close()
