from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from db import get_db_connection
import pymysql.cursors
import base64
import os
import requests
import logging
from dotenv import load_dotenv
from urllib.parse import urlencode

router = APIRouter()

# Load environment variables
load_dotenv()

# Fitbit OAuth configuration
CLIENT_ID = os.getenv("FITBIT_CLIENT_ID")
CLIENT_SECRET = os.getenv("FITBIT_CLIENT_SECRET")
REDIRECT_URI = os.getenv("FITBIT_REDIRECT_URI")
TOKEN_URL = os.getenv("FITBIT_TOKEN_URL")

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# @router.get("/fitbit/connect")
# async def connect_to_fitbit(user_id: int):
#     """
#     Initiates the Fitbit OAuth connection process using user_id.
#     """
#     if not user_id:
#         raise HTTPException(status_code=400, detail="user_id query parameter is required.")
    
#     authorization_url = f"https://www.fitbit.com/oauth2/authorize?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=activity&user_id={user_id}"
#     logger.debug(f"Redirecting user {user_id} to Fitbit OAuth page: {authorization_url}")
#     return RedirectResponse(url=authorization_url)
@router.get("/fitbit/connect")
async def connect_to_fitbit(user_id: int):
    """
    Initiates the Fitbit OAuth connection process using user_id.
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required.")

    # Parameters to be included in the authorization URL
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'scope': 'activity',
        'state': str(user_id)  # Pass user_id via the state parameter
    }

    # Encode parameters correctly
    authorization_url = f"https://www.fitbit.com/oauth2/authorize?{urlencode(params)}"

    print(authorization_url)
    logger.debug(f"Redirecting user {user_id} to Fitbit OAuth page: {authorization_url}")
    return RedirectResponse(url=authorization_url)

@router.get("/fitbit/callback")
async def fitbit_callback(code: str, state: str):
    """
    Callback endpoint for Fitbit OAuth.
    Exchanges the authorization code for an access token and stores it in the database.
    """
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code is required.")
    if not state:
        raise HTTPException(status_code=400, detail="State parameter is missing.")

    # Log the state and code received
    logger.debug(f"Received code: {code}, state: {state}")

    try:
        # Extract user_id from the 'state' parameter
        user_id = int(state)
        logger.debug(f"Parsed user_id: {user_id}")

        client_credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(client_credentials.encode()).decode("utf-8")

        payload = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'redirect_uri': REDIRECT_URI,
            'grant_type': 'authorization_code',
        }

        headers = {
            'Authorization': f'Basic {encoded_credentials}'
        }

        # Logging the request to Fitbit
        logger.debug(f"Requesting Fitbit token with code {code} for user {user_id}")

        response = requests.post(TOKEN_URL, data=payload, headers=headers)
        logger.debug(f"Fitbit response status code: {response.status_code}")
        logger.debug(f"Fitbit response body: {response.text}")

        if response.status_code != 200:
            logger.error(f"Error fetching access token: {response.text}")
            raise HTTPException(status_code=400, detail="Error fetching access token")

        access_token = response.json().get("access_token")
        if not access_token:
            logger.error("Failed to retrieve access token.")
            raise HTTPException(status_code=400, detail="Failed to retrieve access token")

        # Database interaction
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            logger.error(f"User not found for user_id {user_id}")
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute(""" 
            UPDATE users SET fitbit_token = %s, is_fitbit_connected = TRUE WHERE user_id = %s
        """, (access_token, user_id))

        connection.commit()
        cursor.close()
        connection.close()

        logger.info(f"Fitbit connected successfully for user {user_id}")
        return {"message": f"Fitbit connected successfully for user {user_id}"}

    except Exception as e:
        logger.error(f"Error in Fitbit callback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error storing Fitbit token: {str(e)}")
