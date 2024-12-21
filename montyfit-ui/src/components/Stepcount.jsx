import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import {
  updateStepCount,
  fetchAverageSteps,
  fetchTotalSteps,
} from "../services/stepcountService";

export default function Stepcount({ userEmail }) {
  const [stepCount, setStepCount] = useState(0);
  const [date, setDate] = useState("");
  const [averageSteps, setAverageSteps] = useState("");
  const [totalSteps, setTotalSteps] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await updateStepCount({ userEmail, stepCount, date });
      if (response.message === "exists") {
        alert("Step Count record already exists");
      } else {
        alert("Steps Updates Successfully!. Refresh page");
      }
    } catch (error) {
      console.error("There was an error updating the step count!", error);
    }
  };

  const fetchAvgData = async () => {
    try {
      const roundedAverage = await fetchAverageSteps(userEmail);
      setAverageSteps(roundedAverage);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTotalData = async () => {
    try {
      const total = await fetchTotalSteps(userEmail);
      setTotalSteps(total);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAvgData();
    fetchTotalData();
  }, [userEmail]);

  return (
    <>
      <div className={styles.stepcount}>
        <div className={styles.stepUpdate}>
          <h4>Log your Step Count</h4>
          <div className={styles.dateInputContainer}>
            <input
              type="number"
              id="stepCount"
              required
              placeholder="Enter steps"
              onChange={(e) => setStepCount(e.target.value)}
            />
            <div className={styles.datePickerContainer}>
              <input
                id="date"
                type="date"
                required
                className={styles.dateInput}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button onClick={handleSubmit}>Submit</button>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statItems}>
            <div className={styles.statItem}>
              <p>Average Steps this week</p>
              <p>{averageSteps}</p>
            </div>
            <div className={styles.statItem}>
              <p>Total Steps this week</p>
              <p>{totalSteps}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
