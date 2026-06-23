"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
function DonutChart({ id, series, labels, colors, width = 200, height = 200 }) {
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
        height={height}
        width={width}
      />
    </>
  );
}

export default DonutChart;

// {chartData.length && (
//   <ApexCharts
//     type="donut"
//     options={{
//       chart: {
//         type: "donut",
//       },
//       responsive: [
//         {
//           breakpoint: 480,
//           options: {
//             chart: {
//               width: 200,
//             },
//             legend: {
//               position: "bottom",
//             },
//           },
//         },
//       ],
//     }}
//     series={[44, 55, 41, 17, 15]}
//   />
// )}
