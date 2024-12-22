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
import datetime

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
    """ Initiates the Fitbit OAuth connection process using user_id. """
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

@router.get("/fitbit/callback")
async def fitbit_callback(code: str, state: str):
    """
    Callback endpoint for Fitbit OAuth.
    Exchanges the authorization code for an access token, stores it in the database,
    and fetches Fitbit steps.
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

        # Store tokens in the database
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

        print(f"Fitbit connected successfully for user {user_id}")
        logger.info(f"Fitbit connected successfully for user {user_id}")

        # Fetch and store Fitbit steps
        fetch_response = await fetch_fitbit_steps(user_id)

        print(f"Fetched steps for user {user_id}: {fetch_response}")
        logger.info(f"Fetched steps for user {user_id}: {fetch_response}")

        cursor.close()
        connection.close()

        return {"message": "Fitbit connected and steps fetched successfully.", "steps": fetch_response}

    except Exception as e:
        logger.error(f"Error in Fitbit callback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error storing Fitbit token: {str(e)}")

# Route to fetch Fitbit steps and store in the database
@router.get("/fitbit/fetchSteps")
async def fetch_fitbit_steps(user_id: int):
    """
    Fetches Fitbit step data for the given user_id and stores it in the stepcount table.
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required.")

    try:
        # Database interaction to get tokens
        connection = get_db_connection()
        cursor = connection.cursor(pymysql.cursors.DictCursor)

        cursor.execute("SELECT fitbit_token FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user or not user["fitbit_token"]:
            raise HTTPException(status_code=404, detail="Fitbit is not connected for this user.")

        access_token = user["fitbit_token"]

        # Fitbit API request to fetch step data
        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        # Endpoint for Fitbit steps data (example for daily activity steps)
        fitbit_url = "https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json"
        response = requests.get(fitbit_url, headers=headers)

        if response.status_code != 200:
            logger.error(f"Error fetching steps data: {response.text}")
            raise HTTPException(status_code=400, detail="Error fetching Fitbit steps data")

        steps_data = response.json()

        # Extracting step count from response
        steps = steps_data.get("activities-steps", [{}])[-1].get("value")
        if not steps:
            raise HTTPException(status_code=404, detail="No steps data available.")

        # Inserting or updating the step count in the database
        today_date = datetime.date.today()
        cursor.execute(
            """
            INSERT INTO stepcount (user_id, stepcount, date, source) 
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE stepcount = VALUES(stepcount), source = VALUES(source)
            """,
            (user_id, steps, today_date, 'fitbit')
        )

        connection.commit()
        cursor.close()
        connection.close()

        logger.info(f"Steps data successfully stored for user {user_id}")
        return {"message": "Steps data successfully fetched and stored.", "steps": steps}

    except Exception as e:
        logger.error(f"Error fetching or storing Fitbit steps: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching or storing Fitbit steps: {str(e)}")