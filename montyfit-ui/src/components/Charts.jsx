import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { Chart } from "react-google-charts";
import { getDashboardData } from "../services/chartService"; // Import the service file

export default function Charts({ userEmail }) {
  const [responseData, setResponseData] = useState([]);

  const chartDataMonthly = [
    ["Months", "Steps"],
    ["Jan", 10000],
    ["Feb", 12000],
    ["Mar", 9500],
    ["Apr", 8500],
    ["May", 10000],
    ["Jun", 4000],
    ["Jul", 15000],
    ["Aug", 20000],
    ["Sep", 13000],
    ["Oct", 15000],
    ["Nov", 11000],
    ["Dec", 17000],
  ];

  const chartOptionsMonths = {
    title: "Monthly Chart",
    legend: { position: "none" },
    chartArea: { width: "80%", height: "70%" },
    hAxis: {
      title: "Date",
      textStyle: { color: "#000" },
      titleTextStyle: { color: "#000" },
    },
    vAxis: {
      title: "Steps",
      minValue: 0,
      textStyle: { color: "#000" },
      titleTextStyle: { color: "#000" },
      slantedText: true,
      slantedTextAngle: 45,
    },
    backgroundColor: "#fff",
  };

  const chartDataWeekly = [["Date", "Steps"]];
  responseData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((day) => {
      chartDataWeekly.push([day.date, parseInt(day.steps)]);
    });

  const chartOptionsWeekly = {
    title: "Weekly Chart",
    legend: { position: "none" },
    chartArea: { width: "80%", height: "70%" },
    hAxis: {
      title: "Date",
      textStyle: { color: "#000" },
      titleTextStyle: { color: "#000" },
    },
    vAxis: {
      title: "Steps",
      minValue: 0,
      textStyle: { color: "#000" },
      titleTextStyle: { color: "#000" },
      slantedText: true,
      slantedTextAngle: 45,
    },
    backgroundColor: "#fff",
  };

  const fetchData = async () => {
    try {
      const data = await getDashboardData();
      const userData = data.find((user) => user.email === userEmail);
      if (userData && userData.last_7_days) {
        setResponseData(userData.last_7_days);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  return (
    <>
      <div className={styles.charts}>
        <div className={styles.chart}>
          <Chart
            width={"100%"}
            height={"100%"}
            chartType="ColumnChart"
            loader={<div>Loading Chart</div>}
            data={chartDataWeekly}
            options={chartOptionsWeekly}
          />
        </div>
        <div className={styles.chart}>
          <Chart
            width={"100%"}
            height={"100%"}
            chartType="ColumnChart"
            loader={<div>Loading Chart</div>}
            data={chartDataMonthly}
            options={chartOptionsMonths}
          />
        </div>
      </div>
    </>
  );
}
