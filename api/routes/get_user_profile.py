from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter()

class UserProfileRequest(BaseModel):
    userEmail: str

@router.post("/getUserProfile")
async def get_user_profile(request: UserProfileRequest):
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT name, phone_no, role, address, profile_photo FROM users WHERE email_id = %s", (request.userEmail,))
        result = cursor.fetchone()

        if result:
            return {
                'name': result['name'],
                'phone': result['phone_no'],
                'role': result['role'],
                'address': result['address'],
                'profilePhoto': result['profile_photo'],
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    
    finally:
        cursor.close()
        connection.close()
