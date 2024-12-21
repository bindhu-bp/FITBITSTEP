// src/services/leaderboardService.js
import axios from "axios";
import { API_BASE_URL } from "../config";

export const getDailyLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leaderboardDaily`);
    return response.data;
  } catch (error) {
    console.error("Error fetching daily leaderboard data:", error);
    throw error;
  }
};

export const getWeeklyLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leaderboardWeekly`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly leaderboard data:", error);
    throw error;
  }
};
