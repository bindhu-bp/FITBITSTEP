import React from "react";
import styles from "./Title.module.css";

export default function Title() {
  return (
    <>
      <div className={styles.titleBox}>
        <div>
          <img src="/mclogo.jpg" alt="Monty Fit Logo" className={styles.logo} />
        </div>
        <div>
          <div className={styles.title}>Monty Fit Step Count</div>
        </div>
      </div>
    </>
  );
}
