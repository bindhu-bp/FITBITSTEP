// src/services/stepcountService.js
import axios from "axios";
import { API_BASE_URL } from "../config";

export const updateStepCount = async ({ userEmail, stepCount, date }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/updateStepCount`, {
      userEmail,
      stepCount,
      date,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating step count:", error);
    throw error;
  }
};

export const fetchAverageSteps = async (userEmail) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/buttonAverage`, {
      userEmail,
    });
    return Math.round(response.data.average_stepcount);
  } catch (error) {
    console.error("Error fetching average steps:", error);
    throw error;
  }
};

export const fetchTotalSteps = async (userEmail) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/buttonTotal`, {
      userEmail,
    });
    return response.data.total_stepcount;
  } catch (error) {
    console.error("Error fetching total steps:", error);
    throw error;
  }
};
