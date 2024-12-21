import axios from "axios";
import { API_BASE_URL } from "../config.js";

export const getUserProfile = async (userEmail) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getUserProfile`, {
      userEmail,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/updateUserProfile`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
