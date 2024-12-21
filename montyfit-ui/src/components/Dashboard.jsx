import React from "react";
import styles from "./Dashboard.module.css";
import Profile from "./Profile.jsx";
import Charts from "./Charts.jsx";
import Leaderboard from "./Leaderboard.jsx";
import Stepcount from "./Stepcount.jsx";
import Title from "./Title.jsx";

const Dashboard = ({ email, userId, onLogout }) => {
  // Accept userId as a prop
  return (
    <div className={styles.dashboard}>
      <Title />
      <Profile userEmail={email} userId={userId} onLogout={onLogout} />{" "}
      {/* Pass userId to Profile */}
      <div className={styles.mainContent}>
        <Stepcount userEmail={email} />
        <Charts userEmail={email} />
        <Leaderboard />
      </div>
    </div>
  );
};

export default Dashboard;
