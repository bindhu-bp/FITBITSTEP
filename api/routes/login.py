from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db_connection
import pymysql.cursors

router = APIRouter()

class LoginRequest(BaseModel):
    loginEmail: str
    loginPassword: str

@router.post("/login")
async def login(request: LoginRequest):
    connection = get_db_connection()
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM users WHERE email_id = %s", (request.loginEmail,))
            user = cursor.fetchone()

            if user:
                db_password = user['password']  # Accessing password from dictionary

                if request.loginPassword == db_password:
                    # Return user_id instead of email
                    return {"message": "valid", "user_id": user['user_id']}  # Return user_id for use in Fitbit connection
                else:
                    raise HTTPException(status_code=400, detail="Invalid Password")  # Password does not match
            else:
                raise HTTPException(status_code=404, detail="User not found")  # User not found
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  # Handle any other exceptions
    finally:
        connection.close()  # Ensure the connection is closed
