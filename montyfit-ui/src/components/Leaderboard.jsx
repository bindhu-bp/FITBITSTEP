import styles from "./Dashboard.module.css";
import React, { useState, useEffect } from "react";
import {
  getDailyLeaderboard,
  getWeeklyLeaderboard,
} from "../services/leaderboardService"; // Import the service file

export default function Leaderboard() {
  const [view, setView] = useState("daily");
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const fetchDailyResult = async () => {
    try {
      const dailyResponse = await getDailyLeaderboard();
      setDailyData(dailyResponse);
    } catch (error) {
      console.error("Error fetching daily leaderboard data:", error);
    }
  };

  const fetchWeekResult = async () => {
    try {
      const weeklyResponse = await getWeeklyLeaderboard();
      setWeeklyData(weeklyResponse);
    } catch (error) {
      console.error("Error fetching weekly leaderboard data:", error);
    }
  };

  useEffect(() => {
    if (view === "daily") {
      fetchDailyResult();
    } else if (view === "weekly") {
      fetchWeekResult();
    }
  }, [view]);

  const renderTable = () => {
    if (view === "daily") {
      return (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Daily Steps</th>
            </tr>
          </thead>
          <tbody>
            {dailyData.length > 0 ? (
              dailyData.map((record, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{record.name}</td>
                  <td>{record.stepcount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    } else if (view === "weekly") {
      return (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Avg Steps</th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.length > 0 ? (
              weeklyData.map((record, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{record.name}</td>
                  <td>{record.avg_steps}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }
  };

  return (
    <>
      <div className={styles.rankTable}>
        <div className={styles.tablenav}>
          <p className={styles.leaderboard}>LeaderBoard</p>
          <div className={styles.leaderboardbuttons}>
            <button
              className={`${styles.daily} ${view === "daily" && "active"}`}
              onClick={() => setView("daily")}
            >
              Daily
            </button>
            <button
              className={`${styles.weekly} ${view === "weekly" && "active"}`}
              onClick={() => setView("weekly")}
            >
              Weekly
            </button>
          </div>
        </div>
        {renderTable()}
      </div>
    </>
  );
}
