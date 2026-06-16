"use client";
import React from "react";
import Chart from "react-apexcharts";
import styles from "./dashboard.module.scss";

const DepartmentPlacementChart = ({ data = [] }) => {
  // Early return if no valid data
  if (!data || data.length === 0) {
    return (
      <div className={styles.columnChartCont}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Department-wise Placement Statistics
        </h2>
        <div
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: "16px",
            padding: "2rem",
          }}
        >
          ❕No departments available
        </div>
      </div>
    );
  }

  // Clean and validate data - check for title or department
  const cleanData = data.filter(
    (item) => item && ((item.title !== undefined && item.title !== "") || (item.department !== undefined && item.department !== ""))
  );

  if (cleanData.length === 0) {
    return (
      <div className={styles.columnChartCont}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Department-wise Placement Statistics
        </h2>
        <div
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: "16px",
            padding: "2rem",
          }}
        >
          ❕No valid department data
        </div>
      </div>
    );
  }

  const chartOptions = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      width: "100%",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: cleanData.map((item) => String(item.title || item.department || "")),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#777",
          fontSize: "12px",
          fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif"
        }
      },
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        style: {
          colors: "#777",
          fontSize: "12px",
          fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif"
        }
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 4,
      yaxis: {
        lines: { show: true }
      },
      xaxis: {
        lines: { show: false }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontSize: "13px",
      fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
      labels: { colors: "#555" },
      markers: {
        width: 12,
        height: 12,
        radius: 0
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    fill: { opacity: 1 },
    colors: ["#5bbcda", "#6BA8ED"],
  };

  const series = [
    {
      name: "Eligible",
      data: cleanData.map((item) => item.eligible !== undefined ? item.eligible : 0),
    },
    {
      name: "Placed",
      data: cleanData.map((item) => item.placed !== undefined ? item.placed : 0),
    },
  ];

  return (
    <div className={styles.columnChartCont}>
      <h3 className={styles.chartTitle}>Department-wise placement statistics</h3>
      <div className={styles.chartWrapper}>
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height="100%"
        />
      </div>
    </div>
  );
};

export default DepartmentPlacementChart;
