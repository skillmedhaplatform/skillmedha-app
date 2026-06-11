// src/components/dashboard/GrowthCharts.js
"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Briefcase, BookOpen, Calendar } from "lucide-react";
import styles from "./GrowthCharts.module.scss";

export default function GrowthCharts({ data, loading, onPeriodChange }) {
  const [period, setPeriod] = useState("6months");
  const [activeChart, setActiveChart] = useState("all");

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading growth data...</p>
        </div>
      </div>
    );
  }

  const chartTypes = [
    { id: "all", label: "All Metrics", icon: TrendingUp },
    { id: "students", label: "Students", icon: Users },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "courses", label: "Courses", icon: BookOpen },
  ];

  return (
    <div className={styles.chartsSection}>
      {/* Header */}
      <div className={styles.chartHeader}>
        <div className={styles.titleSection}>
          <TrendingUp size={24} className={styles.icon} />
          <div>
            <h2>Growth Analytics</h2>
            <p>Track your platform's growth over time</p>
          </div>
        </div>

        <div className={styles.controls}>
          {/* Period Selector */}
          <div className={styles.periodSelector}>
            <Calendar size={18} />
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className={styles.chartTypeSelector}>
            {chartTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  className={`${styles.typeButton} ${
                    activeChart === type.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveChart(type.id)}
                >
                  <Icon size={16} />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Line Chart - All Metrics */}
        {activeChart === "all" && (
          <div className={styles.chartCard}>
            <h3>All Metrics Growth</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.dataPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#24A058"
                  strokeWidth={2}
                  name="Students"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke="#ec4899"
                  strokeWidth={2}
                  name="Jobs"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="courses"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  name="Courses"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="internships"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  name="Internships"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area Chart - Students */}
        {activeChart === "students" && (
          <div className={styles.chartCard}>
            <h3>Student Growth</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data.dataPoints}>
                <defs>
                  <linearGradient
                    id="colorStudents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#24A058" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#24A058" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#24A058"
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                  name="Students"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area Chart - Jobs */}
        {activeChart === "jobs" && (
          <div className={styles.chartCard}>
            <h3>Job Postings Growth</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data.dataPoints}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="#ec4899"
                  fillOpacity={1}
                  fill="url(#colorJobs)"
                  name="Jobs"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area Chart - Courses */}
        {activeChart === "courses" && (
          <div className={styles.chartCard}>
            <h3>Course Assignments Growth</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data.dataPoints}>
                <defs>
                  <linearGradient id="colorCourses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="courses"
                  stroke="#14b8a6"
                  fillOpacity={1}
                  fill="url(#colorCourses)"
                  name="Courses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
