"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
function DonutChart({ id, series, labels, colors, width = 180, height = 180 }) {
  const option = {
    chart: {
      id,
    },
    series,
    labels,
    colors,
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
      },
    },
    legend: {
      show: false,
    },
  };

  return (
    <>
      <Chart
        type="donut"
        options={option}
        series={option.series}
        height={height}
        width={width}
      />
    </>
  );
}

export default DonutChart;
