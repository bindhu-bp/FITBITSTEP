import React from "react";
import styles from "./Dashboard.module.css";

export default function Title() {
  return (
    <>
      <div className={styles.titleBox}>
        <div className={styles.title}>Monty Fit Step Count</div>
      </div>
    </>
  );
}
