"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
function DonutChart({ id, series, labels, colors }) {
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
  };

  return (
    <>
      <Chart
        type="donut"
        options={option}
        series={option.series}
        height={250}
        width={250}
      />
    </>
  );
}

export default DonutChart;
