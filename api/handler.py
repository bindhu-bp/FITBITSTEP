from fastapi import FastAPI
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    login,
    signup,
    update_step_count,
    get_user_profile,
    update_user_profile,
    leaderboard_daily,
    leaderboard_weekly,
    dashboard,
    button_average,
    button_total,
    fitbit
)


app = FastAPI()

handler = Mangum(app)

origin =[]

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Include routers for different endpoints
app.include_router(login.router)
app.include_router(signup.router)
app.include_router(update_step_count.router)
app.include_router(get_user_profile.router)
app.include_router(update_user_profile.router)
app.include_router(leaderboard_daily.router)
app.include_router(leaderboard_weekly.router)
app.include_router(dashboard.router)
app.include_router(button_average.router)
app.include_router(button_total.router)
app.include_router(fitbit.router)

