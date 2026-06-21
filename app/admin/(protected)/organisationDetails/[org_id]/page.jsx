"use client";
import {
  getOrganisationStats,
  updateOrganisationAILimit,
  updateOrganisationFeatures,
} from "@/redux/slices/admin/adminOrgSlice";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  App,
  Button,
  InputNumber,
  Progress,
  Skeleton,
  Switch,
  Tag,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  TrophyOutlined,
  RiseOutlined,
  ApartmentOutlined,
  MailOutlined,
  PhoneOutlined,
  TrophyFilled,
  IdcardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import styles from "./page.module.scss";
import { encrypt, setLstorage } from "@/utils/windowMW";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// ==================== SKELETON COMPONENTS ====================
const DashboardSkeleton = () => {
  return (
    <div className={styles.dashboardContainer}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Skeleton.Input active style={{ width: 300, height: 32 }} />
          <Skeleton.Input
            active
            style={{ width: 200, height: 20, marginTop: 8 }}
          />
        </div>
      </div>

      <div className={styles.divider} />

      {/* Stats Cards Skeleton */}
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={styles.statsCard}
            style={{ borderLeftColor: "#d9d9d9" }}
          >
            <div className={styles.cardHeader}>
              <Skeleton.Avatar active size={48} shape="circle" />
              <Skeleton.Button active size="small" style={{ width: 60 }} />
            </div>
            <div className={styles.cardBody}>
              <Skeleton.Input active style={{ width: 100, height: 14 }} />
              <Skeleton.Input
                active
                style={{ width: 80, height: 28, marginTop: 8 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Details Grid Skeleton */}
      <div className={styles.detailsGrid}>
        {[1, 2].map((item) => (
          <div key={item} className={styles.detailCard}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== HEADER COMPONENT ====================
const DashboardHeader = ({ orgName, orgType }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <h2>{orgName || "Dashboard"}</h2>
        <span className={styles.subtitle}>
          {orgType === "college" ? "Educational Institution" : "Company"}{" "}
          Dashboard
        </span>
      </div>
      <div className={styles.headerRight}></div>
    </div>
  );
};

// ==================== STATS CARD COMPONENT ====================
const StatsCard = ({ stat }) => {
  return (
    <div className={styles.statsCard} style={{ borderLeftColor: stat.color }}>
      <div className={styles.cardHeader}>
        <div className={styles.avatar} style={{ backgroundColor: stat.color }}>
          {stat.icon}
        </div>
        <div
          className={styles.trend}
          style={{
            backgroundColor: `${stat.color}15`,
            color: stat.color,
          }}
        >
          <RiseOutlined />
          {stat.trend}
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{stat.title}</div>
        <div className={styles.cardValue} style={{ color: stat.color }}>
          {stat.value.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const AITokenLimitCard = ({
  aiUsage,
  aiTokenLimit,
  orgId,
  dispatch,
  message,
}) => {
  const [tokenLimit, setTokenLimit] = React.useState(aiTokenLimit || 0);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Sync with props
  React.useEffect(() => {
    setTokenLimit(aiTokenLimit || 0);
  }, [aiTokenLimit]);

  const handleUpdateLimit = async () => {
    if (tokenLimit < 0) {
      message.error("Token limit must be a positive number");
      return;
    }

    setIsUpdating(true);
    const hide = message.loading("Updating AI token limit...", 0);

    try {
      // Add this action to your Redux slice
      await dispatch(
        updateOrganisationAILimit({
          orgId: orgId,
          aiTokenLimit: tokenLimit,
        })
      ).unwrap();

      hide();
      message.success("AI token limit updated successfully!");

      // Refresh organization stats
      dispatch(getOrganisationStats(orgId));
    } catch (error) {
      hide();
      message.error("Failed to update AI token limit. Please try again.");
      console.error("AI limit update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const usagePercentage =
    tokenLimit > 0
      ? Math.min(((aiUsage?.totalTokens || 0) / tokenLimit) * 100, 100)
      : 0;

  const isNearLimit = usagePercentage >= 80;
  const isOverLimit =
    (aiUsage?.totalTokens || 0) > tokenLimit && tokenLimit > 0;

  return (
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>
        <h3>
          <ThunderboltOutlined className={styles.icon} />
          AI Token Limit Management
        </h3>
      </div>
      <div className={styles.cardContent}>
        {/* Current Usage */}
        <div className={styles.infoRow}>
          <span className={styles.label}>Current Usage:</span>
          <span className={styles.value}>
            {(aiUsage?.totalTokens || 0).toLocaleString()} tokens
          </span>
        </div>

        {/* Token Limit Input */}
        <div className={styles.tokenLimitSection}>
          <label className={styles.label}>Set Token Limit:</label>
          <div className={styles.inputGroup}>
            <InputNumber
              min={0}
              step={10000}
              value={tokenLimit}
              onChange={(value) => setTokenLimit(value)}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Enter token limit"
              size="large"
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleUpdateLimit}
              loading={isUpdating}
              disabled={tokenLimit === aiTokenLimit}
              style={{ marginTop: 8, width: "100%" }}
            >
              Update Limit
            </Button>
          </div>
        </div>

        {/* Usage Progress Bar */}
        {tokenLimit > 0 && (
          <div className={styles.progressSection} style={{ marginTop: 20 }}>
            <span className={styles.progressLabel}>
              Usage: {(aiUsage?.totalTokens || 0).toLocaleString()} /{" "}
              {tokenLimit.toLocaleString()} tokens
            </span>
            <Progress
              percent={parseFloat(usagePercentage.toFixed(2))}
              status={
                isOverLimit ? "exception" : isNearLimit ? "normal" : "active"
              }
              strokeColor={
                isOverLimit ? "#ff4d4f" : isNearLimit ? "#faad14" : "#52c41a"
              }
            />
            {isOverLimit && (
              <span className={styles.warningText} style={{ color: "#ff4d4f" }}>
                ⚠️ Token limit exceeded!
              </span>
            )}
            {isNearLimit && !isOverLimit && (
              <span className={styles.warningText} style={{ color: "#faad14" }}>
                ⚠️ Approaching token limit
              </span>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className={styles.quickActions} style={{ marginTop: 20 }}>
          <span className={styles.label}>Quick Set:</span>
          <div className={styles.buttonGroup}>
            {[50000, 100000, 500000, 1000000].map((preset) => (
              <Button
                key={preset}
                size="small"
                onClick={() => setTokenLimit(preset)}
                style={{ marginRight: 8, marginTop: 8 }}
              >
                {preset >= 1000000
                  ? `${preset / 1000000}M`
                  : `${preset / 1000}K`}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
// ==================== FEATURE MANAGEMENT COMPONENT ====================
const FeatureManagement = ({
  features = {},
  onFeatureToggle,
  orgId,
  dispatch,
  message,
  orgType, // Add orgType prop
}) => {
  // Initialize feature states based on organization type
  const [featureStates, setFeatureStates] = React.useState(
    orgType === "company"
      ? {
          jobassessments: false,
          // Add more company-specific features here
        }
      : {
          resumebuilder: false,
          talktoai: false,
          internshiplibrary: false,
          courseslibrary: false,
          practice: false,
          jobopenings: false,
          myassessments: false,
        }
  );

  // Sync featureStates with props on mount and when features change
  React.useEffect(() => {
    if (features && Object.keys(features).length > 0) {
      if (orgType === "company") {
        setFeatureStates({
          jobassessments: features.jobassessments || false,
          // Add more company features sync here
        });
      } else {
        setFeatureStates({
          resumebuilder: features.resumebuilder || false,
          talktoai: features.talktoai || false,
          internshiplibrary: features.internshiplibrary || false,
          courseslibrary: features.courseslibrary || false,
          practice: features.practice || false,
          myassessments: features.myassessments || false,
          jobopenings: features.jobopenings || false,
        });
      }
    }
  }, [features, orgType]);

  // Define feature configs for different organization types
  const collegeFeatureConfig = [
    {
      key: "resumebuilder",
      label: "Resume Builder",
      icon: <IdcardOutlined />,
      color: "#1890ff",
      description: "AI-powered resume creation",
    },
    {
      key: "talktoai",
      label: "Talk to AI",
      icon: <TeamOutlined />,
      color: "#722ed1",
      description: "AI assistant chat support",
    },
    {
      key: "internshiplibrary",
      label: "Internships",
      icon: <TrophyOutlined />,
      color: "#52c41a",
      description: "Internship opportunities",
    },
    {
      key: "courseslibrary",
      label: "Courses",
      icon: <BankOutlined />,
      color: "#faad14",
      description: "Online learning courses",
    },
    {
      key: "practice",
      label: "Practice",
      icon: <RiseOutlined />,
      color: "#eb2f96",
      description: "Coding practice platform",
    },
    {
      key: "jobopenings",
      label: "Job Openings",
      icon: <RiseOutlined />,
      color: "#eb2f96",
      description: "Job Openings platform",
    },
    {
      key: "myassessments",
      label: "My Assessments",
      icon: <RiseOutlined />,
      color: "#eb2f96",
      description: "My Assessments platform",
    },
  ];

  const companyFeatureConfig = [
    {
      key: "jobassessments",
      label: "Job Assessment",
      icon: <FileTextOutlined />,
      color: "#1890ff",
      description: "Enable assessment for job applicants",
    },
    // Add more company-specific features here as needed
    // {
    //   key: "anotherFeature",
    //   label: "Another Feature",
    //   icon: <SomeIcon />,
    //   color: "#52c41a",
    //   description: "Description here",
    // },
  ];

  const featureConfig =
    orgType === "company" ? companyFeatureConfig : collegeFeatureConfig;

  const handleToggle = async (key, checked) => {
    const featureName = featureConfig.find((f) => f.key === key)?.label || key;

    const hide = message.loading(`Updating ${featureName}...`, 0);

    try {
      const updatedFeatures = {
        ...featureStates,
        [key]: checked,
      };

      setFeatureStates(updatedFeatures);

      await dispatch(
        updateOrganisationFeatures({
          orgId: orgId,
          features: updatedFeatures,
        })
      ).unwrap();

      hide();
      message.success({
        content: `${featureName} ${
          checked ? "enabled" : "disabled"
        } successfully!`,
        duration: 3,
      });

      // Optional callback
      onFeatureToggle?.({ features: updatedFeatures });
    } catch (error) {
      // Hide loading and show error
      hide();
      message.error({
        content: `Failed to update ${featureName}. Please try again.`,
        duration: 4,
      });

      // Revert local state on error
      setFeatureStates((prev) => ({
        ...prev,
        [key]: !checked,
      }));

      console.error("Feature update error:", error);
    }
  };

  return (
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>
        <h3>
          <ApartmentOutlined className={styles.icon} />
          Feature Management
        </h3>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.featuresList}>
          {featureConfig.map((feature) => (
            <div key={feature.key} className={styles.featureItem}>
              <div className={styles.featureInfo}>
                <div
                  className={styles.featureIcon}
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <span style={{ color: feature.color }}>{feature.icon}</span>
                </div>
                <div className={styles.featureText}>
                  <span className={styles.featureLabel}>{feature.label}</span>
                  <span className={styles.featureDescription}>
                    {feature.description}
                  </span>
                </div>
              </div>
              <Switch
                checked={featureStates[feature.key]}
                onChange={(checked) => handleToggle(feature.key, checked)}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== ORGANIZATION DETAILS FOR COLLEGE ====================
const OrganizationDetails = ({ institutionDetails, accreditationDetails }) => {
  return (
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>
        <h3>
          <BankOutlined className={styles.icon} />
          Organization Details
        </h3>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Institution:</span>
          <span className={styles.value}>
            {institutionDetails?.institutionName || "N/A"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Established:</span>
          <span className={styles.value}>
            {institutionDetails?.establishedYear || "N/A"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Type:</span>
          <span
            className={styles.tag}
            style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }}
          >
            {institutionDetails?.institutionType || "N/A"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Affiliation:</span>
          <span className={styles.value}>
            {institutionDetails?.affiliation || "N/A"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>NAAC Grade:</span>
          <span className={styles.badge}>
            {accreditationDetails?.naacGradeCycle || "N/A"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>NBA Status:</span>
          <span className={styles.value}>
            {accreditationDetails?.nbaStatus || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPANY DETAILS ====================

const CompanyDetails = ({ organization }) => {
  return (
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>
        <h3>
          <BankOutlined className={styles.icon} />
          Company Information
        </h3>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Company Name:</span>
          <span className={styles.value}>{organization?.orgName || "N/A"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Company ID:</span>
          <span className={styles.value}>{organization?.orgId || "N/A"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{organization?.email || "N/A"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Tax Info:</span>
          <span className={styles.value}>{organization?.taxInfo || "N/A"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Type:</span>
          <span
            className={styles.tag}
            style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }}
          >
            {organization?.type || "N/A"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Created:</span>
          <span className={styles.value}>
            {organization?.createdAt
              ? new Date(organization.createdAt).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};
const AIUsageDetails = ({ aiUsage }) => {
  return (
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>
        <h3>
          <RobotOutlined className={styles.icon} />
          AI Usage Statistics
        </h3>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Total Requests:</span>
          <span className={styles.value}>
            {(aiUsage?.totalRequests || 0).toLocaleString()}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Completion Tokens:</span>
          <span className={styles.value}>
            {(aiUsage?.totalCompletionTokens || 0).toLocaleString()}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Prompt Tokens:</span>
          <span className={styles.value}>
            {(aiUsage?.totalPromptTokens || 0).toLocaleString()}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Total Tokens:</span>
          <span className={styles.badge}>
            {(aiUsage?.totalTokens || 0).toLocaleString()}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Avg Tokens/Request:</span>
          <span className={styles.value}>
            {aiUsage?.totalRequests > 0
              ? Math.round(aiUsage.totalTokens / aiUsage.totalRequests)
              : 0}
          </span>
        </div>
      </div>
    </div>
  );
};
const AIUsageChart = ({ aiUsage, monthlyChangeRate }) => {
  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: true },
      animations: { enabled: true, speed: 800 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 8,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Completion Tokens", "Prompt Tokens"],
    },
    yaxis: {
      title: { text: "Token Count" },
    },
    colors: ["#722ed1", "#13c2c2"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        opacityFrom: 0.85,
        opacityTo: 0.85,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => val.toLocaleString(),
      },
    },
  };

  const chartSeries = [
    {
      name: "Tokens",
      data: [
        aiUsage?.totalCompletionTokens || 0,
        aiUsage?.totalPromptTokens || 0,
      ],
    },
  ];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        AI Token Usage Breakdown
        <span className={styles.chartSubtitle}>
          Total: {(aiUsage?.totalTokens || 0).toLocaleString()} tokens
        </span>
      </div>
      <div className={styles.chartWrapper}>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
};

// ==================== KEY METRICS FOR COLLEGE ====================
const KeyMetrics = ({
  placementRate,
  activeStudents,
  totalStudents,
  companies,
}) => {
  const activeStudentRate = Math.round(
    (activeStudents / (totalStudents || 1)) * 100
  );

  return (
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>
        <h3>Key Metrics</h3>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.progressSection}>
          <span className={styles.progressLabel}>Placement Rate</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${parseFloat(placementRate?.replace("%", "") || 0)}%`,
                backgroundColor: "#52c41a",
              }}
            />
          </div>
          <span className={styles.progressPercent}>
            {placementRate || "0%"}
          </span>
        </div>

        <div className={styles.progressSection}>
          <span className={styles.progressLabel}>Active Students Rate</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${activeStudentRate}%`,
                backgroundColor: "#1890ff",
              }}
            />
          </div>
          <span className={styles.progressPercent}>{activeStudentRate}%</span>
        </div>

        <div className={styles.statistic}>
          <span className={styles.statisticLabel}>Companies Engaged</span>
          <div className={styles.statisticValue}>
            {companies || 0}
            <span className={styles.suffix}>/ Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPANY KEY METRICS ====================
const CompanyKeyMetrics = ({ statistics, counts }) => {
  const activeJobRate = parseFloat(statistics?.activeJobRate || 0);
  const assessmentCompletionRate = parseFloat(
    statistics?.assessmentCompletionRate || 0
  );

  return (
    <div className={styles.detailCard}>
      <div className={styles.cardTitle}>
        <h3>
          <BarChartOutlined className={styles.icon} />
          Key Metrics
        </h3>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.progressSection}>
          <span className={styles.progressLabel}>Active Jobs</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${activeJobRate}`,
                backgroundColor: "#52c41a",
              }}
            />
          </div>
          <span className={styles.progressPercent}>
            {statistics?.activeJobRate || "0"}
          </span>
        </div>

        <div className={styles.progressSection}>
          <span className={styles.progressLabel}>Assessment Completion</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${assessmentCompletionRate}`,
                backgroundColor: "#1890ff",
              }}
            />
          </div>
          <span className={styles.progressPercent}>
            {statistics?.assessmentCompletionRate || "0"}
          </span>
        </div>

        <div className={styles.statistic}>
          <span className={styles.statisticLabel}>Avg Applications/Job</span>
          <div className={styles.statisticValue}>
            {statistics?.avgApplicationsPerJob || "0"}
            <span className={styles.suffix}>/ Job</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== TPO PROFILE CARD ====================
const TPOProfileCard = ({ tpoInfo, index, onNavigate }) => {
  const gradientColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ];

  return (
    <div
      className={styles.tpoProfileCard}
      onClick={() => onNavigate(tpoInfo._id)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onNavigate(tpoInfo._id);
        }
      }}
    >
      {/* Cover Image/Gradient */}
      <div className={styles.tpoCover}>
        <div
          className={styles.coverGradient}
          style={{
            background: gradientColors[index % gradientColors.length],
          }}
        ></div>
      </div>

      {/* Profile Content */}
      <div className={styles.tpoContent}>
        {/* Avatar Section */}
        <div className={styles.tpoAvatarSection}>
          <div className={styles.tpoAvatar}>
            {tpoInfo.tpoLogo ? (
              <img src={tpoInfo.tpoLogo} alt="TPO" />
            ) : (
              <UserOutlined />
            )}
          </div>
          <div className={styles.tpoBasicInfo}>
            <h3 className={styles.tpoName}>
              {tpoInfo.firstName} {tpoInfo.middleName} {tpoInfo.lastName}
            </h3>
            <p className={styles.tpoDesignation}>
              {tpoInfo.designation || "Training & Placement Officer"}
            </p>
            <span className={styles.tpoQualification}>
              <TrophyFilled /> {tpoInfo.qualification || "N/A"}
            </span>
          </div>
        </div>

        {/* TPO Details Grid */}
        <div className={styles.tpoDetailsGrid}>
          <div className={styles.tpoDetailItem}>
            <div className={styles.detailIcon}>
              <MailOutlined />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{tpoInfo.email}</span>
            </div>
          </div>

          <div className={styles.tpoDetailItem}>
            <div className={styles.detailIcon}>
              <PhoneOutlined />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>{tpoInfo.phone}</span>
            </div>
          </div>

          <div className={styles.tpoDetailItem}>
            <div className={styles.detailIcon}>
              <UserOutlined />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Gender</span>
              <span className={styles.detailValue}>
                {tpoInfo?.gender || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Awards Section */}
        {tpoInfo.awards && (
          <div className={styles.tpoAwards}>
            <h4>
              <TrophyFilled /> Awards & Achievements
            </h4>
            <p>{tpoInfo.awards}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== HR PROFILE CARD FOR COMPANY ====================
const HRProfileCard = ({ hrInfo, index, onNavigate }) => {
  const gradientColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ];

  return (
    <div
      className={styles.tpoProfileCard}
      onClick={() => onNavigate?.(hrInfo._id)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.tpoCover}>
        <div
          className={styles.coverGradient}
          style={{
            background: gradientColors[index % gradientColors.length],
          }}
        ></div>
      </div>

      <div className={styles.tpoContent}>
        <div className={styles.tpoAvatarSection}>
          <div className={styles.tpoAvatar}>
            {hrInfo.profilePhoto ? (
              <img src={hrInfo.profilePhoto} alt="HR" />
            ) : (
              <UserOutlined />
            )}
          </div>
          <div className={styles.tpoBasicInfo}>
            <h3 className={styles.tpoName}>
              {hrInfo.firstName} {hrInfo.lastName}
            </h3>
            <p className={styles.tpoDesignation}>
              {hrInfo.designation || "HR Manager"}
            </p>
          </div>
        </div>

        <div className={styles.tpoDetailsGrid}>
          <div className={styles.tpoDetailItem}>
            <div className={styles.detailIcon}>
              <MailOutlined />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{hrInfo.email}</span>
            </div>
          </div>

          <div className={styles.tpoDetailItem}>
            <div className={styles.detailIcon}>
              <PhoneOutlined />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>{hrInfo.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== JOB CARD FOR COMPANY ====================
const JobCard = ({ job, onJobClick }) => {
  const { push } = useRouter();
  const params = useParams();
  const ORG_ID = params?.org_id;
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "expired":
        return "default";
      case "closed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "pending":
        return <ClockCircleOutlined />;
      case "expired":
        return <CloseCircleOutlined />;
      case "closed":
        return <CloseCircleOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  return (
    <div
      className={styles.jobCard}
      onClick={() => {
        setLstorage("jobDetails", JSON.stringify(job));
        setTimeout(() => {}, 10);
        push(`/admin/organisationDetails/${ORG_ID}/${job?._id}?type=company`);
      }}
      role="button"
      tabIndex={0}
    >
      <div className={styles.jobCardHeader}>
        <h4 className={styles.jobTitle}>{job.jobTitle}</h4>
        <Tag
          color={getStatusColor(job.status)}
          icon={getStatusIcon(job.status)}
        >
          {job.status?.toUpperCase()}
        </Tag>
      </div>

      <div className={styles.jobCardContent}>
        <div className={styles.jobInfo}>
          <span className={styles.jobLabel}>Company:</span>
          <span className={styles.jobValue}>{job.companyName || "N/A"}</span>
        </div>

        {job.ctc && (
          <div className={styles.jobInfo}>
            <span className={styles.jobLabel}>CTC:</span>
            <span className={styles.jobValue}>₹{job.ctc} LPA</span>
          </div>
        )}

        {job.city && (
          <div className={styles.jobInfo}>
            <span className={styles.jobLabel}>Location:</span>
            <span className={styles.jobValue}>{job.city}</span>
          </div>
        )}

        <div className={styles.jobInfo}>
          <span className={styles.jobLabel}>Applications:</span>
          <span className={styles.jobValue}>{job.applicants?.length || 0}</span>
        </div>

        <div className={styles.jobInfo}>
          <span className={styles.jobLabel}>Duration:</span>
          <span className={styles.jobValue}>
            {job.startDate
              ? new Date(job.startDate).toLocaleDateString()
              : "N/A"}{" "}
            - {job.endDate ? new Date(job.endDate).toLocaleDateString() : "N/A"}
          </span>
        </div>

        {job.coordinatorName && (
          <div className={styles.jobInfo}>
            <span className={styles.jobLabel}>Coordinator:</span>
            <span className={styles.jobValue}>{job.coordinatorName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== CHART COMPONENTS ====================
const ColumnChart = ({ departmentData, onDepartmentClick }) => {
  const topDepartments = [...departmentData]
    .sort((a, b) => b.students - a.students)
    .slice(0, 5);

  const columnChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: true },
      animations: { enabled: true, easing: "easeinout", speed: 800 },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const departmentName =
            topDepartments[config.dataPointIndex].department;
          const department = departmentData.find(
            (d) => d.department === departmentName
          );
          if (department && department.departmentId) {
            onDepartmentClick(department.departmentId, departmentName);
          }
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        dataLabels: { position: "top" },
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { fontSize: "12px", colors: ["#1890ff"] },
    },
    xaxis: {
      categories: topDepartments.map((dept) => dept.department),
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: { fontSize: "12px" },
      },
    },
    yaxis: { title: { text: "Number of Students" } },
    colors: ["#1890ff"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.85,
      },
    },
    tooltip: {
      y: { formatter: (val) => `${val} students` },
      custom: ({ dataPointIndex }) => {
        return `<div style="padding: 8px;">
          <strong>${topDepartments[dataPointIndex].department}</strong><br/>
          Students: ${topDepartments[dataPointIndex].students}<br/>
          <span style="font-size: 11px; color: #888;">Click to view details</span>
        </div>`;
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.85,
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.75,
        },
      },
    },
  };

  const columnChartSeries = [
    {
      name: "Students",
      data: topDepartments.map((dept) => dept.students),
    },
  ];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        Top 5 Departments by Student Count
        <span className={styles.chartSubtitle}>
          Click on bars to view details
        </span>
      </div>
      <div className={styles.chartWrapper}>
        <ReactApexChart
          options={columnChartOptions}
          series={columnChartSeries}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
};

const PieChart = ({ departmentData, totalStudents, onDepartmentClick }) => {
  const pieChartOptions = {
    chart: {
      type: "donut",
      animations: { enabled: true, speed: 800 },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const department = departmentData[config.dataPointIndex];
          if (department && department.departmentId) {
            onDepartmentClick(department.departmentId, department.department);
          }
        },
      },
    },
    labels: departmentData.map((dept) => dept.department),
    colors: [
      "#5B8FF9",
      "#61DDAA",
      "#F6BD16",
      "#E8684A",
      "#6DC8EC",
      "#9270CA",
      "#FF9D4D",
      "#269A99",
      "#FF99C3",
      "#5AD8A6",
    ],
    legend: { position: "bottom", fontSize: "12px" },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Students",
              fontSize: "16px",
              fontWeight: 600,
              color: "#373d3f",
              formatter: () => totalStudents || 0,
            },
          },
        },
      },
    },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
    tooltip: {
      custom: ({ seriesIndex }) => {
        const dept = departmentData[seriesIndex];
        return `<div style="padding: 8px;">
          <strong>${dept.department}</strong><br/>
          Students: ${dept.students}<br/>
          <span style="font-size: 11px; color: #888;">Click to view details</span>
        </div>`;
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.85,
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.75,
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: { chart: { width: 300 }, legend: { position: "bottom" } },
      },
    ],
  };

  const pieChartSeries = departmentData.map((dept) => dept.students);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        Student Distribution by Department
        <span className={styles.chartSubtitle}>
          Click on slices to view details
        </span>
      </div>
      <div className={styles.chartWrapper}>
        <ReactApexChart
          options={pieChartOptions}
          series={pieChartSeries}
          type="donut"
          height={300}
        />
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ departmentData, onDepartmentClick }) => {
  const barChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: true },
      animations: { enabled: true, speed: 800 },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const department = departmentData[config.dataPointIndex];
          if (department && department.departmentId) {
            onDepartmentClick(department.departmentId, department.department);
          }
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        dataLabels: { position: "top" },
        barHeight: "70%",
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 30,
      style: { fontSize: "12px", colors: ["#fff"] },
    },
    xaxis: {
      categories: departmentData.map((dept) => dept.department),
      title: { text: "Number of Students" },
    },
    yaxis: { title: { text: "Departments" } },
    colors: [
      "#5B8FF9",
      "#61DDAA",
      "#F6BD16",
      "#E8684A",
      "#6DC8EC",
      "#9270CA",
      "#FF9D4D",
      "#269A99",
      "#FF99C3",
    ],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.85,
      },
    },
    tooltip: {
      y: { formatter: (val) => `${val} students` },
      custom: ({ dataPointIndex }) => {
        return `<div style="padding: 8px;">
          <strong>${departmentData[dataPointIndex].department}</strong><br/>
          Students: ${departmentData[dataPointIndex].students}<br/>
          <span style="font-size: 11px; color: #888;">Click to view details</span>
        </div>`;
      },
    },
    legend: { show: false },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.85,
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.75,
        },
      },
    },
  };

  const barChartSeries = [
    {
      name: "Students",
      data: departmentData.map((dept) => dept.students),
    },
  ];

  return (
    <div className={`${styles.chartsGrid} ${styles.fullWidth}`}>
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>
          Department-wise Student Comparison
          <span className={styles.chartSubtitle}>
            Click on bars to view details
          </span>
        </div>
        <div className={styles.chartWrapper}>
          <ReactApexChart
            options={barChartOptions}
            series={barChartSeries}
            type="bar"
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

// ==================== COMPANY CHARTS ====================
const JobStatusChart = ({ jobsByStatus }) => {
  const chartOptions = {
    chart: {
      type: "donut",
      animations: { enabled: true, speed: 800 },
    },
    labels: jobsByStatus.map((item) => item._id || "Unknown"),
    colors: ["#faad14", "#52c41a", "#ff4d4f", "#1890ff"],
    legend: { position: "bottom", fontSize: "12px" },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Jobs",
              fontSize: "16px",
              fontWeight: 600,
              color: "#373d3f",
              formatter: (w) => {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
  };

  const chartSeries = jobsByStatus.map((item) => item.count);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>Jobs by Status</div>
      <div className={styles.chartWrapper}>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="donut"
          height={300}
        />
      </div>
    </div>
  );
};

const ApplicationsTrendChart = ({ recentApplications }) => {
  // Group applications by date
  const applicationsByDate = recentApplications.reduce((acc, app) => {
    const date = new Date(app.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const dates = Object.keys(applicationsByDate).slice(-7); // Last 7 days
  const counts = dates.map((date) => applicationsByDate[date]);

  const chartOptions = {
    chart: {
      type: "area",
      toolbar: { show: true },
      animations: { enabled: true, speed: 800 },
    },
    xaxis: {
      categories: dates,
      title: { text: "Date" },
    },
    yaxis: {
      title: { text: "Applications" },
    },
    colors: ["#1890ff"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
  };

  const chartSeries = [
    {
      name: "Applications",
      data: counts,
    },
  ];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>Recent Applications Trend</div>
      <div className={styles.chartWrapper}>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="area"
          height={300}
        />
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
function DashboardPage() {
  const params = useParams();
  const orgId = params?.org_id;
  const dispatch = useDispatch();
  const router = useRouter();
  const searchparams = useSearchParams();
  const type = searchparams.get("type");
  const { message } = App.useApp();
  const { value: stats, loading } = useSelector((state) => state.adminOrg.orgStats);

  useEffect(() => {
    dispatch(getOrganisationStats(orgId));
  }, [dispatch, orgId]);

  // Determine organization type
  const orgType = stats?.organization?.type || type;
  const isCompany = orgType === "company";

  // Navigation Handlers
  const handleTPONavigation = (tpoId) => {
    router.push(
      `/admin/colleges/tpo?orgId=${encrypt(orgId)}&orgName=${encrypt(
        stats?.organization?.orgName
      )}`
    );
  };

  const handleHRNavigation = (hrId) => {
    router.push(`/admin/companies/hr?orgId=${encrypt(orgId)}&hrId=${encrypt(hrId)}`);
  };

  const handleDepartmentNavigation = (departmentId, departmentName) => {
    router.push(
      `/admin/colleges/departments/students?orgId=${encrypt(orgId)}&orgName=${encrypt(
        stats?.organization?.orgName
      )}&deptId=${encrypt(departmentId)}&deptName=${encrypt(departmentName)}`
    );
  };

  const handleJobNavigation = (jobId) => {
    router.push(`/admin/companies/jobs/${jobId}?orgId=${encrypt(orgId)}`);
  };

  // Show skeleton while loading
  if (loading) {
    return <DashboardSkeleton />;
  }
  
  // Prepare stats cards based on organization type
  const statsCards = isCompany
    ? [
        {
          title: "Total Jobs",
          value: stats?.counts?.jobs || 0,
          icon: <FileTextOutlined />,
          color: "#1890ff",
          trend: `${stats?.monthlyChangeRate?.jobs?.changeValue || 0} %`,
        },
        {
          title: "Total Applications",
          value: stats?.counts?.applications || 0,
          icon: <TeamOutlined />,
          color: "#52c41a",
          trend: `${
            stats?.monthlyChangeRate?.applications?.changeValue || 0
          } %`,
        },
        {
          title: "Active Jobs",
          value: stats?.counts?.activeJobs || 0,
          icon: <CheckCircleOutlined />,
          color: "#faad14",
          trend: `${stats?.monthlyChangeRate?.activeJobs?.changeValue || 0} %`,
        },
        {
          title: "Assessments",
          value: stats?.counts?.assessments || 0,
          icon: <AppstoreOutlined />,
          color: "#eb2f96",
          trend: `${stats?.monthlyChangeRate?.users?.changeValue || 0} %`,
        },
        {
          title: "AI Requests",
          value: stats?.aiUsage?.totalRequests || 0,
          icon: <RobotOutlined />,
          color: "#722ed1",
          trend: `${stats?.monthlyChangeRate?.aiRequests?.changeValue || 0} %`,
        },
        {
          title: "AI Tokens Used",
          value: (stats?.aiUsage?.totalTokens || 0).toLocaleString(),
          icon: <ThunderboltOutlined />,
          color: "#13c2c2",
          trend: `${stats?.monthlyChangeRate?.aiTokens?.changeValue || 0} %`,
        },
      ]
    : [
        {
          title: "Total Students",
          value: stats?.counts?.students || 0,
          icon: <UserOutlined />,
          color: "#1890ff",
          trend: (stats?.monthlyChangeRate?.students?.changeValue || 0) + "%",
        },
        {
          title: "Departments",
          value: stats?.counts?.departments || 0,
          icon: <ApartmentOutlined />,
          color: "#52c41a",
          trend:
            (stats?.monthlyChangeRate?.departments?.changeValue || 0) + "%",
        },
        {
          title: "Active Students",
          value: stats?.counts?.activeStudents || 0,
          icon: <TeamOutlined />,
          color: "#faad14",
          trend:
            (stats?.monthlyChangeRate?.activeStudents?.changeValue || 0) + "%",
        },
        {
          title: "Placed Students",
          value: stats?.counts?.placedStudents || 0,
          icon: <TrophyOutlined />,
          color: "#eb2f96",
          trend:
            (stats?.monthlyChangeRate?.placedStudents?.changeValue || 0) + "%",
        },
        {
          title: "AI Requests",
          value: stats?.aiUsage?.totalRequests || 0,
          icon: <RobotOutlined />, // Add this import
          color: "#722ed1",
          trend: `${stats?.monthlyChangeRate?.aiRequests?.changeValue || 0} %`,
        },
        {
          title: "AI Tokens Used",
          value: (stats?.aiUsage?.totalTokens || 0).toLocaleString(),
          icon: <ThunderboltOutlined />, // Add this import
          color: "#13c2c2",
          trend: `${stats?.monthlyChangeRate?.aiTokens?.changeValue || 0} %`,
        },
      ];

  // Transform data for charts
  const departmentData =
    stats?.departmentDetails?.map((dept) => ({
      department: dept.title,
      departmentId: dept._id || dept.id,
      students: dept.studentCount,
      hod: dept.hodName || "Not Assigned",
    })) || [];

  const tpoList = stats?.tpoDetails || [];
  const hrList = stats?.hrDetails || [];
  const jobList = stats?.jobDetails || [];

  return (
    <div className={styles.dashboardContainer}>
      {/* Header Section */}
      <DashboardHeader
        orgName={stats?.organization?.orgName}
        orgType={orgType}
      />

      <div className={styles.divider} />

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Details Grid - Conditional based on type */}
      <div className={styles.detailsGrid}>
        {isCompany ? (
          <>
            <CompanyDetails organization={stats?.organization} />
            <FeatureManagement
              features={stats?.organization?.features}
              onFeatureToggle={(feature, enabled) => {
                console.log(
                  `${feature} is now ${enabled ? "enabled" : "disabled"}`
                );
              }}
              orgId={orgId}
              dispatch={dispatch}
              message={message}
              orgType="company" // Pass orgType
            />
            <AIUsageDetails aiUsage={stats?.aiUsage} />
            <AITokenLimitCard
              aiUsage={stats?.aiUsage}
              aiTokenLimit={stats?.organization?.aiTokenLimit}
              orgId={orgId}
              dispatch={dispatch}
              message={message}
            />
            {/* <CompanyKeyMetrics
              statistics={stats?.statistics}
              counts={stats?.counts}
            /> */}
          </>
        ) : (
          <>
            <OrganizationDetails
              institutionDetails={tpoList[0]?.institutionDetails}
              accreditationDetails={tpoList[0]?.accreditationDetails}
            />
            <FeatureManagement
              features={stats?.organization?.features} // Pass the features object
              onFeatureToggle={(feature, enabled) => {
                console.log(
                  `${feature} is now ${enabled ? "enabled" : "disabled"}`
                );
              }}
              orgId={orgId}
              dispatch={dispatch}
              message={message}
            />
            <AIUsageDetails aiUsage={stats?.aiUsage} />
            <AITokenLimitCard
              aiUsage={stats?.aiUsage}
              aiTokenLimit={stats?.organization?.aiTokenLimit}
              orgId={orgId}
              dispatch={dispatch}
              message={message}
            />
            {/* <KeyMetrics
              placementRate={stats?.statistics?.placementRate}
              activeStudents={stats?.counts?.activeStudents || 0}
              totalStudents={stats?.counts?.students || 0}
              companies={stats?.counts?.companies || 0}
            /> */}
          </>
        )}
      </div>

      {/* TPO/HR Profile Cards Grid */}
      {isCompany ? (
        <>
          {hrList.length > 0 && (
            <>
              <div className={styles.sectionTitle}>
                <h3>
                  <UserOutlined /> HR Team
                </h3>
              </div>

              <div className={styles.tpoProfileGrid}>
                {hrList.map((hrInfo, index) => (
                  <HRProfileCard
                    key={hrInfo._id}
                    hrInfo={hrInfo}
                    index={index}
                    onNavigate={handleHRNavigation}
                  />
                ))}
              </div>

              <div className={styles.divider} />
            </>
          )}

          {/* Jobs Section */}
          {jobList.length > 0 && (
            <>
              <div className={styles.sectionTitle}>
                <h3>
                  <FileTextOutlined /> Job Postings
                </h3>
              </div>

              <div className={styles.jobsGrid}>
                {jobList.slice(0, 6).map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onJobClick={handleJobNavigation}
                  />
                ))}
              </div>

              <div className={styles.divider} />
            </>
          )}
        </>
      ) : (
        tpoList.length > 0 && (
          <>
            <div className={styles.sectionTitle}>
              <h3>
                <IdcardOutlined /> Training & Placement Team
              </h3>
            </div>

            <div className={styles.tpoProfileGrid}>
              {tpoList.map((tpoInfo, index) => (
                <TPOProfileCard
                  key={tpoInfo._id}
                  tpoInfo={tpoInfo}
                  index={index}
                  onNavigate={handleTPONavigation}
                />
              ))}
            </div>

            <div className={styles.divider} />
          </>
        )
      )}

      {/* Charts Section - Conditional based on type */}
      {isCompany ? (
        <>
          {stats?.statistics?.jobsByStatus && (
            <div className={styles.chartsSection}>
              <div className={styles.sectionTitle}>
                <h3>Job Analytics</h3>
              </div>

              <div className={styles.chartsGrid}>
                <JobStatusChart jobsByStatus={stats.statistics.jobsByStatus} />
                {stats?.recentApplications?.length > 0 && (
                  <ApplicationsTrendChart
                    recentApplications={stats.recentApplications}
                  />
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        departmentData.length > 0 && (
          <div className={styles.chartsSection}>
            <div className={styles.sectionTitle}>
              <h3>Department Analytics</h3>
            </div>

            <div className={styles.chartsGrid}>
              <ColumnChart
                departmentData={departmentData}
                onDepartmentClick={handleDepartmentNavigation}
              />
              <PieChart
                departmentData={departmentData}
                totalStudents={stats?.counts?.students}
                onDepartmentClick={handleDepartmentNavigation}
              />
            </div>

            <HorizontalBarChart
              departmentData={departmentData}
              onDepartmentClick={handleDepartmentNavigation}
            />
          </div>
        )
      )}
      {stats?.aiUsage && (
        <div className={styles.chartsSection}>
          <div className={styles.sectionTitle}>
            <h3>AI Usage Analytics</h3>
          </div>
          <div className={styles.chartsGrid}>
            <AIUsageChart
              aiUsage={stats.aiUsage}
              monthlyChangeRate={stats.monthlyChangeRate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
