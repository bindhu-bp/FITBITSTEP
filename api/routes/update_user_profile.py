from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter()

class UpdateUserProfileRequest(BaseModel):
    email: str
    name: str
    phone: str
    role: str
    address: str
    profileImage: str

@router.post("/updateUserProfile")
async def update_user_profile(request: UpdateUserProfileRequest):
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE users SET name = %s, phone_no = %s, role = %s, address = %s, profile_photo = %s 
            WHERE email_id = %s""", 
            (request.name, request.phone, request.role, request.address, request.profileImage, request.email))
        connection.commit()
        return {'success': 'User profile updated successfully'}
    
    finally:
        cursor.close()
        connection.close()
