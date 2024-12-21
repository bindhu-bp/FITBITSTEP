import React from "react";
import styles from "./Dashboard.module.css"; // You can customize your styles here

const ConnectFitbit = ({ userId }) => {
  const handleFitbitConnect = () => {
    console.log("Connecting Fitbit account...", userId);
    console.log(
      `https://jrl72ep0hb.execute-api.us-east-1.amazonaws.com/dev/fitbit/connect?user_id=${userId}`
    );

    // Redirect to Fitbit OAuth page, passing the user_id as a query parameter
    window.location.href = `https://jrl72ep0hb.execute-api.us-east-1.amazonaws.com/dev/fitbit/connect?user_id=${userId}`;
  };

  return (
    <div className={styles.container}>
      <h2>Connect Your Fitbit Account</h2>
      <button
        className={styles.connectFitbitButton}
        onClick={handleFitbitConnect}
      >
        Connect Fitbit
      </button>
    </div>
  );
};

export default ConnectFitbit;
