// src/components/dashboard/AIUsageChart.js
"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Brain, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import styles from "./AIUsageChart.module.scss";

export default function AIUsageChart({ data, loading, onPeriodChange }) {
  const [period, setPeriod] = useState("6months");
  const [chartType, setChartType] = useState("area"); // area, line, bar

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.loadingState}>
          <Brain className={styles.spinIcon} size={48} />
          <p>Loading AI usage data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.dataPoints || data.dataPoints.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.emptyState}>
          <Brain size={48} />
          <p>No AI usage data available</p>
        </div>
      </div>
    );
  }

  const { changeRates } = data;
  const isIncreasing = changeRates?.overall?.trend === "increasing";

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const renderChart = () => {
    const commonProps = {
      data: data.dataPoints,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value) => formatNumber(value)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalTokens"
              name="Total Tokens"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6" }}
            />
            <Line
              type="monotone"
              dataKey="totalRequests"
              name="Total Requests"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value) => formatNumber(value)}
            />
            <Legend />
            <Bar dataKey="totalTokens" name="Total Tokens" fill="#8b5cf6" />
            <Bar dataKey="totalRequests" name="Total Requests" fill="#3b82f6" />
          </BarChart>
        );

      default: // area
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value) => formatNumber(value)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalTokens"
              name="Total Tokens"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTokens)"
            />
            <Area
              type="monotone"
              dataKey="totalRequests"
              name="Total Requests"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRequests)"
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className={styles.chartContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Brain className={styles.icon} size={28} />
          <div>
            <h2 className={styles.title}>AI Usage Analytics</h2>
            <p className={styles.subtitle}>
              Track token usage and request trends
            </p>
          </div>
        </div>

        <div className={styles.controls}>
          {/* Chart Type Selector */}
          <div className={styles.chartTypeSelector}>
            <button
              className={chartType === "area" ? styles.active : ""}
              onClick={() => setChartType("area")}
            >
              Area
            </button>
            <button
              className={chartType === "line" ? styles.active : ""}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              className={chartType === "bar" ? styles.active : ""}
              onClick={() => setChartType("bar")}
            >
              Bar
            </button>
          </div>

          {/* Period Selector */}
          <div className={styles.periodSelector}>
            <Calendar size={16} />
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Change Rate Stats */}
      {changeRates && (
        <div className={styles.statsRow}>
          <div
            className={`${styles.statCard} ${
              isIncreasing ? styles.positive : styles.negative
            }`}
          >
            <div className={styles.statIcon}>
              {isIncreasing ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            <div>
              <p className={styles.statLabel}>Overall Trend</p>
              <p className={styles.statValue}>
                {changeRates.overall.tokenChangeRate}
                <span className={styles.statChange}>
                  {isIncreasing ? "↑" : "↓"}{" "}
                  {Math.abs(changeRates.overall.tokenChange).toLocaleString()}{" "}
                  tokens
                </span>
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Brain size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Month over Month</p>
              <p className={styles.statValue}>
                {changeRates.monthOverMonth.tokenChangeRate}
                <span className={styles.statChange}>
                  {changeRates.monthOverMonth.requestChange > 0 ? "↑" : "↓"}{" "}
                  {Math.abs(changeRates.monthOverMonth.requestChange)} requests
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
