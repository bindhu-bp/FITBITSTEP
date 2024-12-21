from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection

router = APIRouter()

class SignupRequest(BaseModel):
    signUpName: str
    signUpEmail: str
    signUpDesignation: str
    signUpPhone: str
    signUpPassword: str

@router.post("/signup")
async def signup(request: SignupRequest):
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email_id = %s", (request.signUpEmail,))
        user = cursor.fetchone()

        if user:
            raise HTTPException(status_code=400, detail="User Account already exists, Click login.")  # User already exists
        else:
            cursor.execute(
                "INSERT INTO users (name, email_id, phone_no, role, password) VALUES (%s, %s, %s, %s, %s)",
                (request.signUpName, request.signUpEmail, request.signUpPhone, request.signUpDesignation, request.signUpPassword)
            )
            connection.commit()
            return {"message": "valid"}  # User created successfully
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error in creating user")  # Error in creating user
    finally:
        cursor.close()

