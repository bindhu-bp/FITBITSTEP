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

# Route for connecting to Fitbit
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

    logger.debug(f"Redirecting user {user_id} to Fitbit OAuth page: {authorization_url}")
    return RedirectResponse(url=authorization_url)

# Route for Fitbit callback and token exchange
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

    try:
        # Extract user_id from the 'state' parameter
        user_id = int(state)

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

        response = requests.post(TOKEN_URL, data=payload, headers=headers)

        if response.status_code != 200:
            logger.error(f"Error fetching access token: {response.text}")
            raise HTTPException(status_code=400, detail="Error fetching access token")

        # Extract tokens from the response
        access_token = response.json().get("access_token")
        refresh_token = response.json().get("refresh_token")

        if not access_token or not refresh_token:
            raise HTTPException(status_code=400, detail="Failed to retrieve tokens")

        # Database interaction
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute(""" 
            UPDATE users SET fitbit_token = %s, fitbit_refresh_token = %s, is_fitbit_connected = TRUE 
            WHERE user_id = %s
        """, (access_token, refresh_token, user_id))

        connection.commit()
        cursor.close()
        connection.close()

        logger.info(f"Fitbit connected successfully for user {user_id}")
        return RedirectResponse(url=f"/fitbit/fetchSteps?user_id={user_id}")

    except Exception as e:
        logger.error(f"Error in Fitbit callback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error storing Fitbit token: {str(e)}")

# Route for fetching steps data
@router.get("/fitbit/fetchSteps")
async def get_steps(user_id: int):
    """
    Fetches the step count from Fitbit for the given user.
    """
    try:
        # Fetch the access token from the database
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT fitbit_token, fitbit_refresh_token FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()

            if not user or not user[0]:
                raise HTTPException(status_code=400, detail="Fitbit token not found")

            access_token = user[0]
            refresh_token = user[1]

            # Check if the access token is expired
            if not is_token_valid(access_token):
                access_token = await refresh_access_token(refresh_token)

                # Update the new access token in the database
                cursor.execute("UPDATE users SET fitbit_token = %s WHERE user_id = %s", (access_token, user_id))
                connection.commit()

            # Make a request to Fitbit API to fetch the steps data
            headers = {
                'Authorization': f'Bearer {access_token}'
            }
            fitbit_url = f'https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json'
            fitbit_response = requests.get(fitbit_url, headers=headers)

            if fitbit_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Error fetching steps data from Fitbit")

            steps_data = fitbit_response.json()
            steps = steps_data['activities-steps'][0]['value']  # Get steps value for today

            # Store or update the steps data in the database
            cursor.execute("SELECT * FROM stepcount WHERE user_id = %s AND date = CURDATE()", (user_id,))
            existing_record = cursor.fetchone()

            if existing_record:
                # Update the existing record with the new step count for today
                cursor.execute(""" 
                    UPDATE stepcount 
                    SET steps = %s, source = 'Fitbit'
                    WHERE user_id = %s AND date = CURDATE()
                """, (steps, user_id))
            else:
                # Insert a new record for today's step count if no data exists
                cursor.execute(""" 
                    INSERT INTO stepcount (user_id, steps, date, source) 
                    VALUES (%s, %s, CURDATE(), 'Fitbit')
                """, (user_id, steps))

            # Commit changes to the database
            connection.commit()

        return {"message": "Steps data stored or updated", "steps": steps, "user_id": user_id}

    except Exception as e:
        logger.error(f"Error in fetching or storing steps: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Function to check if the access token is valid
def is_token_valid(access_token: str) -> bool:
    """
    Check if the access token is valid by making a simple API request.
    """
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    fitbit_url = f'https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json'
    fitbit_response = requests.get(fitbit_url, headers=headers)
    return fitbit_response.status_code != 401

# Function to refresh the access token using the refresh token
async def refresh_access_token(refresh_token: str) -> str:
    """
    Refresh the access token using the refresh token.
    """
    payload = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
    }

    headers = {
        'Authorization': f'Basic {base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()}'
    }

    response = requests.post(TOKEN_URL, data=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Error refreshing access token")

    new_access_token = response.json().get("access_token")
    if not new_access_token:
        raise HTTPException(status_code=400, detail="Failed to retrieve new access token")

    return new_access_token
