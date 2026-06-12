"use client";
import React from "react";
import Chart from "react-apexcharts";
import styles from "./dashboard.module.scss";

const PlacementActivityChart = ({ data = [], offersThisMonth = 0, averageTimeToOffer = 0 }) => {
  const chartOptions = {
    chart: {
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#6BA8ED"],
    },
    markers: {
      size: 4,
      colors: ["#6BA8ED"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    xaxis: {
      categories: data.map((item) => item.month),
      labels: {
        style: {
          colors: "#777",
          fontSize: "12px",
          fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif"
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      tickAmount: 4,
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
    colors: ["#6BA8ED"],
  };

  const series = [
    {
      name: "Offers",
      data: data.map((item) => item.count),
    },
  ];

  return (
    <div className={styles.columnChartCont} style={{ height: "auto", minHeight: "350px" }}>
      <h3 className={styles.chartTitle}>Placement Activity - Last 6 Months</h3>
      
      {/* Stat Row */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.8rem", color: "#666", fontWeight: 500 }}>Offers This Month</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#6BA8ED" }}>{offersThisMonth}</div>
        </div>
        <div style={{ width: "1px", backgroundColor: "#eef2f5" }}></div>
        <div>
          <div style={{ fontSize: "0.8rem", color: "#666", fontWeight: 500 }}>Average Time to Offer</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1d70b8" }}>{averageTimeToOffer} Days</div>
        </div>
      </div>

      <div className={styles.chartWrapper} style={{ minHeight: "200px", flex: 1 }}>
        <Chart
          options={chartOptions}
          series={series}
          type="line"
          height="100%"
        />
      </div>
    </div>
  );
};

export default PlacementActivityChart;
