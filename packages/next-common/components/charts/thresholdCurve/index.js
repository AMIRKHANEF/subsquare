import React from "react";
import { Line } from "react-chartjs-2";
import styled from "styled-components";
import "../globalConfig";
import light from "../../styled/theme/light";
import dark from "../../styled/theme/dark";

const Wrapper = styled.div``;

export default function ThresholdCurvesChart({
  width,
  height,
  scalesX = true,
  scalesY = true,
  layoutPadding,
  labels = [],
  supportData = [],
  approvalData = [],
}) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Support",
        data: supportData,
        tension: 0.1,
        borderColor: dark.primaryDarkBlue,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
        pointHoverRadius: 5,
      },
      {
        label: "Approval",
        data: approvalData,
        tension: 0.1,
        borderColor: light.secondaryGreen500,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    clip: false,
    layout: {
      padding: layoutPadding,
    },
    scales: {
      x: {
        type: "linear",
        display: scalesX,
        ticks: {
          max: labels.length,
          stepSize: Math.round(labels.length / 4),
          callback(val) {
            return val + "hs";
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: scalesY,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          callback(val) {
            return val + "%";
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        position: "nearest",
        displayColors: false,
        callbacks: {
          title() {
            return ``;
          },
          label(tooltipItem) {
            const { dataIndex, parsed, dataset } = tooltipItem;

            // only display one item
            if (dataset.label === "Approval") {
              return ``;
            }

            const hs = parsed.x;
            const supportValue = Number(
              chartData.datasets[0].data[dataIndex]
            ).toFixed(2);
            const approvalValue = Number(
              chartData.datasets[1].data[dataIndex]
            ).toFixed(2);

            const result = `Time: ${hs}hs Support: ${supportValue}% Approval: ${approvalValue}%`;

            return result;
          },
        },
      },
    },
  };

  return (
    <Wrapper>
      <Line data={chartData} options={options} height={height} width={width} />
    </Wrapper>
  );
}