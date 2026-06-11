"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });
function DonutChart({ id, series, labels, colors }) {
  const chartRef = useRef(null);
  const option = {
    chart: {
      id,
    },
    series,
    labels,
    colors,
    dataLabels: {
      enable: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      style: {
        colors: ["#FFFFFF"],
      },
    },
  };
  var chart = new ApexCharts(chartRef.current, option);
  return (
    <>
      <Chart
        ref={chartRef}
        type="donut"
        options={option}
        series={option.series}
        height={200}
        width={200}
      />
    </>
  );
}

export default DonutChart;
