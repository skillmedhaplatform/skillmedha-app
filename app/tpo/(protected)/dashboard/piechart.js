"use client";
import React from "react";
import Chart from "react-apexcharts";
import styles from "./dashboard.module.scss";

const chartColors = [
  "#008FFB",
  "#00E396",
  "#FEB019",
  "#FF4560",
  "#775DD0",
  "#546E7A",
  "#26a69a",
  "#d10ce8",
  "#ff7f0e",
  "#2ca02c",
];

const SectorPlacementChart = ({ data = [] }) => {
  // Early return if no valid data
  if (!data || data.length === 0) {
    return (
      <div className={styles.pichartCont}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Sector-wise Placement Breakdown
        </h3>
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

  // Clean and validate data - check for title, sector or department
  const cleanData = data.filter(
    (item) => item && (item.title !== undefined || item.sector !== undefined || item.department !== undefined)
  );

  if (cleanData.length === 0) {
    return (
      <div className={styles.pichartCont}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Sector-wise Placement Breakdown
        </h3>
        <div
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: "16px",
            padding: "2rem",
          }}
        >
          ❕No valid placement breakdown data
        </div>
      </div>
    );
  }

  const hasSectorAndValue = cleanData.length > 0 && cleanData[0].sector !== undefined && cleanData[0].value !== undefined;
  const mockValue = (100 / cleanData.length).toFixed(1);
  const mockSectorData = hasSectorAndValue ? cleanData : cleanData.map((item) => ({
    sector: item.title || item.department || "Unknown",
    value: parseFloat(mockValue),
  }));

  const chartOptions = {
    chart: { type: "donut" },
    labels: mockSectorData.map((item) => String(item.sector)),
    colors: chartColors.slice(0, mockSectorData.length),
    legend: { show: false },
    stroke: { show: true, width: 2, colors: ["#fff"] },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: false,
          }
        }
      }
    },
    tooltip: {
      y: { formatter: (val) => `${val}%` },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 300 },
        },
      },
    ],
  };

  const chartSeries = mockSectorData.map((item) => Number(item.value));

  return (
    <div className={styles.pichartCont}>
      <h3 className={styles.chartTitle}>Sector-wise breakdown</h3>

      <div className={styles.chartWrapper}>
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="donut"
          width="100%"
          height="220"
        />
      </div>

      <div className={styles.pieDetails}>
        {mockSectorData.map((item, index) => (
          <div key={index} className={styles.pieItem}>
            <div className={styles.pieItemLeft}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <strong className={styles.label}>{item.sector}</strong>
            </div>
            <div className={styles.dividerLine}></div>
            <span className={styles.value}>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorPlacementChart;
