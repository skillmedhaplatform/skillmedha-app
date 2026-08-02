"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
function DonutChart({ id, series, labels, colors, width = 140, height = 140 }) {
  const option = {
    chart: {
      id,
    },
    series: series || [],
    labels: labels || [],
    colors: colors || [],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "72%",
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
    },
  };

  return (
    <Chart
      type="donut"
      options={option}
      series={option.series}
      height={height}
      width={width}
    />
  );
}

export default DonutChart;
