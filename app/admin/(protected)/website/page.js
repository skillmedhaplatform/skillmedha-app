"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Switch,
  Button,
  Table,
  Tag,
  App,
  Spin,
  Typography,
  Tabs,
  Badge,
  Popconfirm,
  Row,
  Col
} from "antd";
import {
  DatabaseOutlined,
  CloudSyncOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  ReadOutlined,
  CarryOutOutlined,
  BankOutlined,
  RightOutlined,
  NotificationOutlined
} from "@ant-design/icons";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import { fetchMarqueeNotices } from "@/redux/slices/admin/cms/marqueeSlice";
import NewsFlashManagement from "./components/NewsFlashManagement";

const { Paragraph } = Typography;

export default function AdminWebsitePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const sectionParam = searchParams.get("section");
  const selectedSection =
    sectionParam === "practice"
      ? "practice"
      : sectionParam === "newsflash"
      ? "newsflash"
      : sectionParam === "company-tests"
      ? "company-tests"
      : sectionParam === "courses"
      ? "courses"
      : sectionParam === "internships"
      ? "internships"
      : null;

  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [updatingCompanyMode, setUpdatingCompanyMode] = useState(false);
  const [seedingCompany, setSeedingCompany] = useState(false);

  const [updatingCoursesMode, setUpdatingCoursesMode] = useState(false);
  const [seedingCourses, setSeedingCourses] = useState(false);

  const [updatingInternshipsMode, setUpdatingInternshipsMode] = useState(false);
  const [seedingInternships, setSeedingInternships] = useState(false);

  // Practice Config State
  const [config, setConfig] = useState({
    mode: "static",
    staticCount: 0,
    dynamicCount: 0,
    publishedSetsCount: 0,
    publishedBundlesCount: 0,
    lastUpdated: null,
    updatedBy: null
  });

  // Table Data
  const [staticSets, setStaticSets] = useState([]);
  const [dynamicSets, setDynamicSets] = useState([]);
  const [loadingDynamic, setLoadingDynamic] = useState(false);

  // Company Mock Tests State
  const [companyConfig, setCompanyConfig] = useState({
    mode: "static",
    staticCount: 0,
    dynamicCount: 0,
    publishedSetsCount: 0,
    lastUpdated: null,
    updatedBy: null
  });
  const [staticCompanyTests, setStaticCompanyTests] = useState([]);
  const [dynamicCompanyTests, setDynamicCompanyTests] = useState([]);
  const [loadingDynamicCompany, setLoadingDynamicCompany] = useState(false);

  // Courses Library State
  const [coursesConfig, setCoursesConfig] = useState({
    mode: "static",
    staticCount: 0,
    dynamicCount: 0,
    publishedSetsCount: 0,
    lastUpdated: null,
    updatedBy: null
  });
  const [staticCourses, setStaticCourses] = useState([]);
  const [dynamicCourses, setDynamicCourses] = useState([]);
  const [loadingDynamicCourses, setLoadingDynamicCourses] = useState(false);

  // Internship Opportunities State
  const [internshipsConfig, setInternshipsConfig] = useState({
    mode: "static",
    staticCount: 0,
    dynamicCount: 0,
    publishedSetsCount: 0,
    lastUpdated: null,
    updatedBy: null
  });
  const [staticInternships, setStaticInternships] = useState([]);
  const [dynamicInternships, setDynamicInternships] = useState([]);
  const [loadingDynamicInternships, setLoadingDynamicInternships] = useState(false);

  // Marquee state for NewsFlash overview card
  const marqueeState = useSelector((state) => state.marquee) || {};
  const { notices = [], globalEnabled = false, loading: marqueeLoading = false } = marqueeState;
  const newsflashRef = useRef(null);

  const getHeaders = useCallback(() => {
    const token = getLstorage("jwtToken") || localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }, []);

  // Fetch Practice Config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/practice-config`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error("Error fetching website config:", err);
    }
  }, [getHeaders]);

  // Fetch Static Sets
  const fetchStaticSets = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/static-practice-sets`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStaticSets(data.data);
      }
    } catch (err) {
      console.error("Error fetching static practice sets:", err);
    }
  }, [getHeaders]);

  // Fetch Dynamic Sets (Loads directly for the dynamic preview tab)
  const fetchDynamicPreview = useCallback(async () => {
    setLoadingDynamic(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/dynamic-practice-preview`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDynamicSets(data.data);
      } else {
        const fallbackRes = await fetch(`${restUrl}/api/public/website/practice?mode=dynamic`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && Array.isArray(fallbackData.data)) {
          setDynamicSets(fallbackData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching dynamic preview:", err);
      try {
        const fallbackRes = await fetch(`${restUrl}/api/public/website/practice?mode=dynamic`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && Array.isArray(fallbackData.data)) {
          setDynamicSets(fallbackData.data);
        }
      } catch (e) {
        console.error("Fallback error:", e);
      }
    } finally {
      setLoadingDynamic(false);
    }
  }, [getHeaders]);

  // Fetch Company Config
  const fetchCompanyConfig = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/company-config`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCompanyConfig(data.data);
      }
    } catch (err) {
      console.error("Error fetching company website config:", err);
    }
  }, [getHeaders]);

  // Fetch Static Company Tests
  const fetchStaticCompanyTests = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/static-company-tests`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStaticCompanyTests(data.data);
      }
    } catch (err) {
      console.error("Error fetching static company tests:", err);
    }
  }, [getHeaders]);

  // Fetch Dynamic Company Preview
  const fetchDynamicCompanyPreview = useCallback(async () => {
    setLoadingDynamicCompany(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/dynamic-company-preview`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDynamicCompanyTests(data.data);
        setCompanyConfig((prev) => ({
          ...prev,
          dynamicCount: data.data.length
        }));
      } else {
        const fallbackRes = await fetch(`${restUrl}/public/website/company-exams?mode=dynamic`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && Array.isArray(fallbackData.data)) {
          setDynamicCompanyTests(fallbackData.data);
          setCompanyConfig((prev) => ({
            ...prev,
            dynamicCount: fallbackData.data.length
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching dynamic company preview:", err);
    } finally {
      setLoadingDynamicCompany(false);
    }
  }, [getHeaders]);

  // Fetch Courses Config
  const fetchCoursesConfig = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/courses-config`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCoursesConfig(data.data);
      }
    } catch (err) {
      console.error("Error fetching courses website config:", err);
    }
  }, [getHeaders]);

  // Fetch Static Courses
  const fetchStaticCourses = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/static-courses`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStaticCourses(data.data);
      }
    } catch (err) {
      console.error("Error fetching static courses:", err);
    }
  }, [getHeaders]);

  // Fetch Dynamic Courses Preview
  const fetchDynamicCoursesPreview = useCallback(async () => {
    setLoadingDynamicCourses(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/dynamic-courses-preview`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDynamicCourses(data.data);
        setCoursesConfig((prev) => ({
          ...prev,
          dynamicCount: data.data.length
        }));
      } else {
        const fallbackRes = await fetch(`${restUrl}/public/website/courses?mode=dynamic`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && Array.isArray(fallbackData.data)) {
          setDynamicCourses(fallbackData.data);
          setCoursesConfig((prev) => ({
            ...prev,
            dynamicCount: fallbackData.data.length
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching dynamic courses preview:", err);
    } finally {
      setLoadingDynamicCourses(false);
    }
  }, [getHeaders]);

  // Fetch Internships Config
  const fetchInternshipsConfig = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/internships-config`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setInternshipsConfig(data.data);
      }
    } catch (err) {
      console.error("Error fetching internships website config:", err);
    }
  }, [getHeaders]);

  // Fetch Static Internships
  const fetchStaticInternships = useCallback(async () => {
    try {
      const res = await fetch(`${restUrl}/admin/website/static-internships`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStaticInternships(data.data);
      }
    } catch (err) {
      console.error("Error fetching static internships:", err);
    }
  }, [getHeaders]);

  // Fetch Dynamic Internships Preview
  const fetchDynamicInternshipsPreview = useCallback(async () => {
    setLoadingDynamicInternships(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/dynamic-internships-preview`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDynamicInternships(data.data);
        setInternshipsConfig((prev) => ({
          ...prev,
          dynamicCount: data.data.length
        }));
      } else {
        const fallbackRes = await fetch(`${restUrl}/public/website/internships?mode=dynamic`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && Array.isArray(fallbackData.data)) {
          setDynamicInternships(fallbackData.data);
          setInternshipsConfig((prev) => ({
            ...prev,
            dynamicCount: fallbackData.data.length
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching dynamic internships preview:", err);
    } finally {
      setLoadingDynamicInternships(false);
    }
  }, [getHeaders]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchConfig(),
      fetchStaticSets(),
      fetchDynamicPreview(),
      fetchCompanyConfig(),
      fetchStaticCompanyTests(),
      fetchDynamicCompanyPreview(),
      fetchCoursesConfig(),
      fetchStaticCourses(),
      fetchDynamicCoursesPreview(),
      fetchInternshipsConfig(),
      fetchStaticInternships(),
      fetchDynamicInternshipsPreview()
    ]);
    setLoading(false);
  }, [
    fetchConfig,
    fetchStaticSets,
    fetchDynamicPreview,
    fetchCompanyConfig,
    fetchStaticCompanyTests,
    fetchDynamicCompanyPreview,
    fetchCoursesConfig,
    fetchStaticCourses,
    fetchDynamicCoursesPreview,
    fetchInternshipsConfig,
    fetchStaticInternships,
    fetchDynamicInternshipsPreview
  ]);

  useEffect(() => {
    loadAll();
    dispatch(fetchMarqueeNotices());
  }, [loadAll, dispatch]);

  const handleRefreshOverview = async () => {
    await Promise.all([loadAll(), dispatch(fetchMarqueeNotices())]);
  };

  const handleRefreshNewsflash = () => {
    if (newsflashRef.current?.refresh) {
      newsflashRef.current.refresh();
    } else {
      dispatch(fetchMarqueeNotices());
    }
  };

  // Toggle Mode Handler (Practice)
  const handleToggleMode = async (checked) => {
    const newMode = checked ? "dynamic" : "static";
    setUpdatingMode(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/practice-mode`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || `Practice sets mode updated to ${newMode.toUpperCase()}`);
        setConfig((prev) => ({ ...prev, mode: newMode, lastUpdated: new Date().toISOString() }));
      } else {
        message.error(data.err || "Failed to update practice mode");
      }
    } catch (err) {
      message.error(err.message || "Network error updating practice mode");
    } finally {
      setUpdatingMode(false);
    }
  };

  // Toggle Mode Handler (Company)
  const handleToggleCompanyMode = async (checked) => {
    const newMode = checked ? "dynamic" : "static";
    setUpdatingCompanyMode(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/company-mode`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || `Company mock tests mode updated to ${newMode.toUpperCase()}`);
        setCompanyConfig((prev) => ({
          ...prev,
          mode: newMode,
          lastUpdated: new Date().toISOString()
        }));
      } else {
        message.error(data.err || "Failed to update company mode");
      }
    } catch (err) {
      message.error(err.message || "Network error updating company mode");
    } finally {
      setUpdatingCompanyMode(false);
    }
  };

  // Re-seed Default Static Data (Practice)
  const handleSeedStaticData = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/seed-static-practice`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || "Default static practice sets seeded successfully!");
        await loadAll();
      } else {
        message.error(data.err || "Failed to seed default static practice sets");
      }
    } catch (err) {
      message.error(err.message || "Network error seeding static practice sets");
    } finally {
      setSeeding(false);
    }
  };

  // Re-seed Default Static Data (Company)
  const handleSeedCompanyData = async () => {
    setSeedingCompany(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/seed-static-company`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || "Default static company mock tests seeded successfully!");
        await Promise.all([fetchCompanyConfig(), fetchStaticCompanyTests()]);
      } else {
        message.error(data.err || "Failed to seed default company mock tests");
      }
    } catch (err) {
      message.error(err.message || "Network error seeding company mock tests");
    } finally {
      setSeedingCompany(false);
    }
  };

  // Toggle Mode Handler (Courses)
  const handleToggleCoursesMode = async (checked) => {
    const newMode = checked ? "dynamic" : "static";
    setUpdatingCoursesMode(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/courses-mode`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || `Courses library mode updated to ${newMode.toUpperCase()}`);
        setCoursesConfig((prev) => ({
          ...prev,
          mode: newMode,
          lastUpdated: new Date().toISOString()
        }));
      } else {
        message.error(data.err || "Failed to update courses mode");
      }
    } catch (err) {
      message.error(err.message || "Network error updating courses mode");
    } finally {
      setUpdatingCoursesMode(false);
    }
  };

  // Re-seed Default Static Data (Courses)
  const handleSeedCoursesData = async () => {
    setSeedingCourses(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/seed-static-courses`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || "Default static courses seeded successfully!");
        await Promise.all([fetchCoursesConfig(), fetchStaticCourses()]);
      } else {
        message.error(data.err || "Failed to seed default static courses");
      }
    } catch (err) {
      message.error(err.message || "Network error seeding static courses");
    } finally {
      setSeedingCourses(false);
    }
  };

  // Toggle Mode Handler (Internships)
  const handleToggleInternshipsMode = async (checked) => {
    const newMode = checked ? "dynamic" : "static";
    setUpdatingInternshipsMode(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/internships-mode`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || `Internship opportunities mode updated to ${newMode.toUpperCase()}`);
        setInternshipsConfig((prev) => ({
          ...prev,
          mode: newMode,
          lastUpdated: new Date().toISOString()
        }));
      } else {
        message.error(data.err || "Failed to update internships mode");
      }
    } catch (err) {
      message.error(err.message || "Network error updating internships mode");
    } finally {
      setUpdatingInternshipsMode(false);
    }
  };

  // Re-seed Default Static Data (Internships)
  const handleSeedInternshipsData = async () => {
    setSeedingInternships(true);
    try {
      const res = await fetch(`${restUrl}/admin/website/seed-static-internships`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.msg || "Default static internships seeded successfully!");
        await Promise.all([fetchInternshipsConfig(), fetchStaticInternships()]);
      } else {
        message.error(data.err || "Failed to seed default static internships");
      }
    } catch (err) {
      message.error(err.message || "Network error seeding static internships");
    } finally {
      setSeedingInternships(false);
    }
  };

  const isDynamic = config.mode === "dynamic";
  const isCompanyDynamic = companyConfig.mode === "dynamic";
  const isCoursesDynamic = coursesConfig.mode === "dynamic";
  const isInternshipsDynamic = internshipsConfig.mode === "dynamic";

  // Table Columns for Practice Sets (Static & Dynamic)
  const columns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 75,
      align: "center",
      render: (v, _, index) => (
        <span className="font-bold text-slate-400">#{v !== undefined ? v : index + 1}</span>
      )
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-bold text-slate-800">{text}</div>
          <div className="text-xs text-slate-400">ID: {record.id || record._id}</div>
        </div>
      )
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (cat) => {
        const color =
          cat === "Technical" ? "green" : cat === "Coding" ? "purple" : "blue";
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 130,
      render: (lvl, record) => {
        if (record.isBundle || lvl === "Bundle") {
          return <Tag color="gold">BUNDLE</Tag>;
        }
        return <Tag color="default">{lvl}</Tag>;
      }
    },
    {
      title: "Questions",
      dataIndex: "questionsCount",
      key: "questionsCount",
      width: 110,
      align: "center",
      render: (count, record) => (
        <span className="font-semibold text-slate-700">
          {count || record.questionCount || 0} Qs
        </span>
      )
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (dur) => <span className="text-slate-600">{dur || "45 mins"}</span>
    },
    {
      title: "Price",
      key: "price",
      width: 120,
      render: (_, record) => {
        if (record.isFree || Number(record.price) === 0) {
          return <span className="font-bold text-emerald-600">FREE</span>;
        }
        return (
          <div>
            <span className="font-bold text-blue-600">₹{record.price}</span>
            {record.originalPrice > record.price && (
              <span className="ml-1 text-xs text-slate-400 line-through">
                ₹{record.originalPrice}
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (status) => (
        <Tag color={status === "published" || status === "active" ? "success" : "default"}>
          {(status || "active").toUpperCase()}
        </Tag>
      )
    }
  ];

  // Table Columns for Company Mock Tests (Static & Dynamic)
  const companyColumns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 75,
      align: "center",
      render: (v, _, index) => (
        <span className="font-bold text-slate-400">#{v !== undefined ? v : index + 1}</span>
      )
    },
    {
      title: "Test Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-bold text-slate-800">{text}</div>
          <div className="text-xs text-slate-400">ID: {record.id || record._id}</div>
        </div>
      )
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      width: 130,
      render: (comp, record) => {
        const name = comp || (record.title ? record.title.split(" ")[0] : "Company");
        return <Tag color="purple">{name}</Tag>;
      }
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 120,
      render: (lvl, record) => {
        if (record.isBundle || lvl === "Bundle") {
          return <Tag color="gold">BUNDLE</Tag>;
        }
        return <Tag color="default">{lvl || "Intermediate"}</Tag>;
      }
    },
    {
      title: "Questions",
      dataIndex: "questionsCount",
      key: "questionsCount",
      width: 110,
      align: "center",
      render: (count, record) => (
        <span className="font-semibold text-slate-700">
          {count || record.questionCount || 0} Qs
        </span>
      )
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (dur, record) => (
        <span className="text-slate-600">
          {dur || (record.timeMinutes ? `${record.timeMinutes} mins` : "45 mins")}
        </span>
      )
    },
    {
      title: "Price",
      key: "price",
      width: 120,
      render: (_, record) => {
        if (record.isFree || Number(record.price) === 0) {
          return <span className="font-bold text-emerald-600">FREE</span>;
        }
        return (
          <div>
            <span className="font-bold text-blue-600">₹{record.price}</span>
            {record.originalPrice > record.price && (
              <span className="ml-1 text-xs text-slate-400 line-through">
                ₹{record.originalPrice}
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (status) => (
        <Tag color={status === "published" || status === "active" ? "success" : "default"}>
          {(status || "active").toUpperCase()}
        </Tag>
      )
    }
  ];

  // Table Columns for Courses (Static & Dynamic)
  const courseColumns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 75,
      align: "center",
      render: (v, _, index) => (
        <span className="font-bold text-slate-400">#{v !== undefined ? v : index + 1}</span>
      )
    },
    {
      title: "Course Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-bold text-slate-800">{text}</div>
          <div className="text-xs text-slate-400">
            ID: {record.id || record._id} {record.instructor ? `• ${record.instructor}` : ""}
          </div>
        </div>
      )
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (cat) => {
        const color =
          cat === "Development"
            ? "cyan"
            : cat === "Data Science" || cat === "Data Science & AI"
            ? "purple"
            : cat === "Design"
            ? "emerald"
            : cat === "Cloud"
            ? "blue"
            : "orange";
        return <Tag color={color}>{cat || "General"}</Tag>;
      }
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 130,
      render: (lvl) => <Tag color="default">{lvl || "All Levels"}</Tag>
    },
    {
      title: "Rating",
      key: "rating",
      width: 120,
      align: "center",
      render: (_, record) => (
        <span className="font-semibold text-amber-600">
          ★ {record.rating || 4.8} <span className="text-xs text-slate-400 font-normal">({record.reviews || 0})</span>
        </span>
      )
    },
    {
      title: "Duration",
      key: "duration",
      width: 120,
      render: (_, record) => (
        <span className="text-slate-600">
          {record.totalDuration || (record.weeks ? `${record.weeks} weeks` : "8 weeks")}
        </span>
      )
    },
    {
      title: "Price",
      key: "price",
      width: 120,
      render: (_, record) => {
        if (record.isFree || Number(record.price) === 0) {
          return <span className="font-bold text-emerald-600">FREE</span>;
        }
        return (
          <div>
            <span className="font-bold text-blue-600">₹{record.price}</span>
            {record.originalPrice > record.price && (
              <span className="ml-1 text-xs text-slate-400 line-through">
                ₹{record.originalPrice}
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (status) => (
        <Tag color={status === "published" || status === "active" ? "success" : "default"}>
          {(status || "active").toUpperCase()}
        </Tag>
      )
    }
  ];

  // Table Columns for Internships (Static & Dynamic)
  const internshipColumns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 75,
      align: "center",
      render: (v, _, index) => (
        <span className="font-bold text-slate-400">#{v !== undefined ? v : index + 1}</span>
      )
    },
    {
      title: "Internship Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-bold text-slate-800">{text}</div>
          <div className="text-xs text-slate-400">ID: {record.id || record._id}</div>
        </div>
      )
    },
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
      width: 130,
      render: (domain) => {
        const color =
          domain === "Tech"
            ? "blue"
            : domain === "Management"
            ? "orange"
            : domain === "Design"
            ? "magenta"
            : "purple";
        return <Tag color={color}>{domain || "Tech"}</Tag>;
      }
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 110,
      render: (dur) => <span className="text-slate-600">{dur || "3 Months"}</span>
    },
    {
      title: "Schedule & Timing",
      key: "timing",
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-700">{record.schedule || "Evening"}</div>
          <div className="text-xs text-slate-400">{record.timing || "Mon - Fri | 06:00 PM - 08:00 PM"}</div>
        </div>
      )
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 130,
      render: (date) => <span className="font-medium text-slate-700">{date || "Upcoming"}</span>
    },
    {
      title: "Price",
      key: "price",
      width: 120,
      render: (_, record) => (
        <div>
          <span className="font-bold text-blue-600">₹{record.price}</span>
          {record.originalPrice > record.price && (
            <span className="ml-1 text-xs text-slate-400 line-through">
              ₹{record.originalPrice}
            </span>
          )}
        </div>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (status) => (
        <Tag color={status === "published" || status === "active" ? "success" : "default"}>
          {(status || "active").toUpperCase()}
        </Tag>
      )
    }
  ];

  // List of configurable website sections
  const websiteSections = [
    {
      key: "practice",
      title: "Practice Sets & Bundles",
      icon: <BookOutlined className="text-2xl text-blue-600" />,
      activeMode: isDynamic ? "dynamic" : "static",
      description:
        "Manage whether the website displays static practice sets from the website.practice collection or live dynamic tenant catalog sets.",
      staticCount: config.staticCount,
      dynamicCount: config.dynamicCount,
      status: "Active",
      isReady: true,
      badgeText: isDynamic ? "Dynamic Mode" : "Static Mode",
      badgeColor: isDynamic ? "purple" : "blue",
      subInfo: `${config.staticCount} Static • ${config.dynamicCount} Dynamic`,
      accentColor: "border-blue-200 hover:border-blue-400 bg-white"
    },
    {
      key: "newsflash",
      title: "Website NewsFlash",
      icon: <NotificationOutlined className="text-2xl text-blue-600" />,
      activeMode: globalEnabled ? "live" : "disabled",
      description:
        "Manage top marquee announcement bar notices, links, forms, and global visibility on the public website.",
      status: "Active",
      isReady: true,
      badgeText: globalEnabled ? "Global Live" : "Inactive",
      badgeColor: globalEnabled ? "green" : "default",
      subInfo: `${notices?.length || 0} Notices • ${notices?.filter((n) => n.active)?.length || 0} Active`,
      accentColor: "border-blue-200 hover:border-blue-400 bg-white"
    },
    {
      key: "courses",
      title: "Courses Library",
      icon: <ReadOutlined className="text-2xl text-emerald-600" />,
      activeMode: isCoursesDynamic ? "dynamic" : "static",
      description:
        "Configure curated static course listings versus live platform courses catalog displayed on the website.",
      staticCount: coursesConfig.staticCount,
      dynamicCount: dynamicCourses.length > 0 ? dynamicCourses.length : (coursesConfig.dynamicCount || 0),
      status: "Active",
      isReady: true,
      badgeText: isCoursesDynamic ? "Dynamic Mode" : "Static Mode",
      badgeColor: isCoursesDynamic ? "purple" : "blue",
      subInfo: `${coursesConfig.staticCount} Static • ${dynamicCourses.length > 0 ? dynamicCourses.length : (coursesConfig.dynamicCount || 0)} Dynamic`,
      accentColor: "border-emerald-200 hover:border-emerald-400 bg-white"
    },
    {
      key: "internships",
      title: "Internship Opportunities",
      icon: <CarryOutOutlined className="text-2xl text-amber-600" />,
      activeMode: isInternshipsDynamic ? "dynamic" : "static",
      description:
        "Switch between static featured internships and live platform internship opportunities.",
      staticCount: internshipsConfig.staticCount,
      dynamicCount: dynamicInternships.length > 0 ? dynamicInternships.length : (internshipsConfig.dynamicCount || 0),
      status: "Active",
      isReady: true,
      badgeText: isInternshipsDynamic ? "Dynamic Mode" : "Static Mode",
      badgeColor: isInternshipsDynamic ? "purple" : "blue",
      subInfo: `${internshipsConfig.staticCount} Static • ${dynamicInternships.length > 0 ? dynamicInternships.length : (internshipsConfig.dynamicCount || 0)} Dynamic`,
      accentColor: "border-amber-200 hover:border-amber-400 bg-white"
    },
    {
      key: "company-tests",
      title: "Company Mock Tests",
      icon: <BankOutlined className="text-2xl text-purple-600" />,
      activeMode: isCompanyDynamic ? "dynamic" : "static",
      description:
        "Manage whether the website displays static company tests from the website.companyExams collection or live dynamic company practice sets.",
      staticCount: companyConfig.staticCount,
      dynamicCount: dynamicCompanyTests.length > 0 ? dynamicCompanyTests.length : (companyConfig.dynamicCount || 0),
      status: "Active",
      isReady: true,
      badgeText: isCompanyDynamic ? "Dynamic Mode" : "Static Mode",
      badgeColor: isCompanyDynamic ? "purple" : "blue",
      subInfo: `${companyConfig.staticCount} Static • ${dynamicCompanyTests.length > 0 ? dynamicCompanyTests.length : (companyConfig.dynamicCount || 0)} Dynamic`,
      accentColor: "border-purple-200 hover:border-purple-400 bg-white"
    }
  ];

  const handleOpenSection = (sectionKey) => {
    router.push(`/admin/website?section=${sectionKey}`);
  };

  const handleBackToOverview = () => {
    router.push("/admin/website");
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      {/* ── NEW WHITE SECTION (DIRECTLY BELOW BANNER) ── */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {selectedSection === "practice" ? (
            /* Practice View Header */
            <>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* 1. ← Back to Sections */}
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToOverview}
                  className="rounded-lg shadow-sm font-semibold text-slate-700 hover:text-blue-600 border-slate-300 flex items-center gap-1.5"
                >
                  Back to Sections
                </Button>

                {/* 2. The text */}
                <span className="text-sm font-medium text-slate-600">
                  Configure whether the website displays static database sets or live dynamic tenant catalog sets.
                </span>
              </div>

              {/* 3. A Refresh button */}
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAll}
                loading={loading}
                className="rounded-lg shadow-sm font-medium border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 shrink-0 self-start md:self-auto flex items-center gap-1.5"
              >
                Refresh
              </Button>
            </>
          ) : selectedSection === "company-tests" ? (
            /* Company Mock Tests View Header */
            <>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* 1. ← Back to Sections */}
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToOverview}
                  className="rounded-lg shadow-sm font-semibold text-slate-700 hover:text-blue-600 border-slate-300 flex items-center gap-1.5"
                >
                  Back to Sections
                </Button>

                {/* 2. The text */}
                <span className="text-sm font-medium text-slate-600">
                  Configure whether the website displays static database company tests or live dynamic company practice sets.
                </span>
              </div>

              {/* 3. A Refresh button */}
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAll}
                loading={loading}
                className="rounded-lg shadow-sm font-medium border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 shrink-0 self-start md:self-auto flex items-center gap-1.5"
              >
                Refresh
              </Button>
            </>
          ) : selectedSection === "courses" ? (
            /* Courses Library View Header */
            <>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* 1. ← Back to Sections */}
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToOverview}
                  className="rounded-lg shadow-sm font-semibold text-slate-700 hover:text-blue-600 border-slate-300 flex items-center gap-1.5"
                >
                  Back to Sections
                </Button>

                {/* 2. The text */}
                <span className="text-sm font-medium text-slate-600">
                  Configure whether the website displays static courses or live platform courses.
                </span>
              </div>

              {/* 3. A Refresh button */}
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAll}
                loading={loading}
                className="rounded-lg shadow-sm font-medium border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 shrink-0 self-start md:self-auto flex items-center gap-1.5"
              >
                Refresh
              </Button>
            </>
          ) : selectedSection === "internships" ? (
            /* Internship Opportunities View Header */
            <>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* 1. ← Back to Sections */}
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToOverview}
                  className="rounded-lg shadow-sm font-semibold text-slate-700 hover:text-blue-600 border-slate-300 flex items-center gap-1.5"
                >
                  Back to Sections
                </Button>

                {/* 2. The text */}
                <span className="text-sm font-medium text-slate-600">
                  Configure whether the website displays static internships or live platform internships.
                </span>
              </div>

              {/* 3. A Refresh button */}
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAll}
                loading={loading}
                className="rounded-lg shadow-sm font-medium border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 shrink-0 self-start md:self-auto flex items-center gap-1.5"
              >
                Refresh
              </Button>
            </>
          ) : selectedSection === "newsflash" ? (
            /* NewsFlash View Header */
            <>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* 1. ← Back to Sections */}
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToOverview}
                  className="rounded-lg shadow-sm font-semibold text-slate-700 hover:text-blue-600 border-slate-300 flex items-center gap-1.5"
                >
                  Back to Sections
                </Button>

                {/* 2. The text */}
                <span className="text-sm font-medium text-slate-600">
                  Manage top marquee announcements, broadcast notices, expiration dates, and website news ticker visibility.
                </span>
              </div>

              {/* 3. A Refresh button */}
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefreshNewsflash}
                loading={marqueeLoading}
                className="rounded-lg shadow-sm font-medium border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 shrink-0 self-start md:self-auto flex items-center gap-1.5"
              >
                Refresh
              </Button>
            </>
          ) : (
            /* Overview / Website Content & Data Management View Header */
            <>
              <span className="text-sm font-medium text-slate-600">
                Select a section below to configure its static and dynamic data sources, view database collections, and manage live displays.
              </span>

              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefreshOverview}
                loading={loading || marqueeLoading}
                className="rounded-lg shadow-sm font-medium border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 shrink-0 self-start md:self-auto flex items-center gap-1.5"
              >
                Refresh
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {loading && (selectedSection === "practice" || selectedSection === "company-tests" || selectedSection === "courses" || selectedSection === "internships") ? (
          <div className="flex justify-center items-center py-24">
            <Spin size="large" tip="Loading website configuration..." />
          </div>
        ) : selectedSection === "practice" ? (
          /* ════════════════════════════════════════════════════════════════
             PRACTICE SECTION MANAGEMENT VIEW (Detail View)
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Main Control Card */}
            <Card
              className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
              styles={{ body: { padding: "28px" } }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-800">
                      Practice Sets Data Source:
                    </span>
                    <Badge
                      status={isDynamic ? "processing" : "default"}
                      color={isDynamic ? "#6366F1" : "#0284C7"}
                      text={
                        <span className="font-bold text-sm tracking-wide">
                          {isDynamic ? "DYNAMIC MODE ACTIVE" : "STATIC MODE ACTIVE"}
                        </span>
                      }
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full"
                    />
                  </div>

                  <p className="text-slate-600 leading-relaxed text-sm">
                    {isDynamic ? (
                      <span>
                        The website is currently displaying <strong>live dynamic Practice Sets & Bundles</strong>{" "}
                        published across tenant databases. Cards automatically render using the authentic{" "}
                        <strong>Student Portal card design</strong>.
                      </span>
                    ) : (
                      <span>
                        The website is currently displaying <strong>curated static Practice Sets</strong>{" "}
                        retrieved dynamically from the <code>website.practice</code> database collection.
                      </span>
                    )}
                  </p>

                  {config.lastUpdated && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                      <InfoCircleOutlined /> Last mode change:{" "}
                      <strong>{new Date(config.lastUpdated).toLocaleString()}</strong>
                    </div>
                  )}
                </div>

                {/* Interactive Toggle Control */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center sm:items-end justify-center gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold transition-colors ${
                        !isDynamic ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      Static Mode
                    </span>
                    <Switch
                      checked={isDynamic}
                      onChange={handleToggleMode}
                      loading={updatingMode}
                      className={isDynamic ? "!bg-indigo-600" : "!bg-sky-600"}
                    />
                    <span
                      className={`text-sm font-bold transition-colors ${
                        isDynamic ? "text-indigo-600" : "text-slate-400"
                      }`}
                    >
                      Dynamic Mode
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 text-center sm:text-right">
                    Toggle switch to change data source instantly
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                    Static Database Sets
                  </div>
                  <div className="text-2xl font-black text-sky-900 mt-1">
                    {config.staticCount}{" "}
                    <span className="text-xs font-medium text-sky-600">in website.practice</span>
                  </div>
                </div>

                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Dynamic Published Sets
                  </div>
                  <div className="text-2xl font-black text-indigo-900 mt-1">
                    {config.dynamicCount}{" "}
                    <span className="text-xs font-medium text-indigo-600">published items</span>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Database Status
                  </div>
                  <div className="text-2xl font-black text-emerald-900 mt-1 flex items-center gap-2">
                    <CheckCircleOutlined className="text-emerald-500 text-xl" /> Connected
                  </div>
                </div>
              </div>
            </Card>

            {/* Database Content Tabs */}
            <Card className="shadow-sm border-slate-200 rounded-2xl">
              <Tabs
                defaultActiveKey="static"
                items={[
                  {
                    key: "static",
                    label: (
                      <span className="flex items-center gap-2">
                        <DatabaseOutlined /> Static Practice Collection (<code>website.practice</code>)
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            These are the practice items currently stored in MongoDB under{" "}
                            <code>website.practice</code>. Served to website visitors when Static Mode is active.
                          </Paragraph>

                          <Popconfirm
                            title="Re-seed Default Static Data?"
                            description="This will reset the website.practice collection to the default 8 curated practice sets."
                            onConfirm={handleSeedStaticData}
                            okText="Yes, Re-seed"
                            cancelText="Cancel"
                            okButtonProps={{ loading: seeding }}
                          >
                            <Button
                              icon={<CloudSyncOutlined />}
                              loading={seeding}
                              className="shrink-0 border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              Sync / Re-seed Default Static Data
                            </Button>
                          </Popconfirm>
                        </div>

                        <Table
                          dataSource={staticSets}
                          columns={columns}
                          rowKey="id"
                          pagination={false}
                          bordered
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  },
                  {
                    key: "dynamic",
                    label: (
                      <span className="flex items-center gap-2">
                        <ThunderboltOutlined /> Dynamic Catalog Preview ({dynamicSets.length})
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            Live published practice sets and bundles aggregated from all tenant databases. Displayed on the website when Dynamic Mode is active.
                          </Paragraph>
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={fetchDynamicPreview}
                            loading={loadingDynamic}
                          >
                            Refresh Preview
                          </Button>
                        </div>

                        <Table
                          dataSource={dynamicSets}
                          columns={columns}
                          rowKey={(record) => record.id || record._id}
                          pagination={{ pageSize: 8 }}
                          bordered
                          loading={loadingDynamic}
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        ) : selectedSection === "company-tests" ? (
          /* ════════════════════════════════════════════════════════════════
             COMPANY MOCK TESTS SECTION MANAGEMENT VIEW (Detail View)
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Main Control Card */}
            <Card
              className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
              styles={{ body: { padding: "28px" } }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-800">
                      Company Mock Tests Data Source:
                    </span>
                    <Badge
                      status={isCompanyDynamic ? "processing" : "default"}
                      color={isCompanyDynamic ? "#7C3AED" : "#0284C7"}
                      text={
                        <span className="font-bold text-sm tracking-wide">
                          {isCompanyDynamic ? "DYNAMIC MODE ACTIVE" : "STATIC MODE ACTIVE"}
                        </span>
                      }
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full"
                    />
                  </div>

                  <p className="text-slate-600 leading-relaxed text-sm">
                    {isCompanyDynamic ? (
                      <span>
                        The website is currently displaying <strong>live dynamic Company Mock Tests & Exam Bundles</strong>{" "}
                        created in the Admin Portal across tenant databases. Cards automatically render in the{" "}
                        <strong>Real-Time Company-wise Exam Pattern</strong> section and redirect to the Student Portal.
                      </span>
                    ) : (
                      <span>
                        The website is currently displaying <strong>curated static Company Exam Patterns</strong>{" "}
                        retrieved dynamically from the <code>website.companyExams</code> database collection.
                      </span>
                    )}
                  </p>

                  {companyConfig.lastUpdated && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                      <InfoCircleOutlined /> Last mode change:{" "}
                      <strong>{new Date(companyConfig.lastUpdated).toLocaleString()}</strong>
                    </div>
                  )}
                </div>

                {/* Interactive Toggle Control */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center sm:items-end justify-center gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold transition-colors ${
                        !isCompanyDynamic ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      Static Mode
                    </span>
                    <Switch
                      checked={isCompanyDynamic}
                      onChange={handleToggleCompanyMode}
                      loading={updatingCompanyMode}
                      className={isCompanyDynamic ? "!bg-purple-600" : "!bg-sky-600"}
                    />
                    <span
                      className={`text-sm font-bold transition-colors ${
                        isCompanyDynamic ? "text-purple-600" : "text-slate-400"
                      }`}
                    >
                      Dynamic Mode
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 text-center sm:text-right">
                    Toggle switch to change data source instantly
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                    Static Database Tests
                  </div>
                  <div className="text-2xl font-black text-sky-900 mt-1">
                    {companyConfig.staticCount}{" "}
                    <span className="text-xs font-medium text-sky-600">in website.companyExams</span>
                  </div>
                </div>

                <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                    Dynamic Published Tests
                  </div>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    {dynamicCompanyTests.length > 0 ? dynamicCompanyTests.length : (companyConfig.dynamicCount || 0)}{" "}
                    <span className="text-xs font-medium text-purple-600">published items</span>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Database Status
                  </div>
                  <div className="text-2xl font-black text-emerald-900 mt-1 flex items-center gap-2">
                    <CheckCircleOutlined className="text-emerald-500 text-xl" /> Connected
                  </div>
                </div>
              </div>
            </Card>

            {/* Database Content Tabs */}
            <Card className="shadow-sm border-slate-200 rounded-2xl">
              <Tabs
                defaultActiveKey="static"
                items={[
                  {
                    key: "static",
                    label: (
                      <span className="flex items-center gap-2">
                        <DatabaseOutlined /> Static Company Tests Collection (<code>website.companyExams</code>)
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            These are the company exam tests currently stored in MongoDB under{" "}
                            <code>website.companyExams</code>. Served to website visitors when Static Mode is active.
                          </Paragraph>

                          <Popconfirm
                            title="Re-seed Default Static Data?"
                            description="This will reset the website.companyExams collection to the default 5 curated company exam tests."
                            onConfirm={handleSeedCompanyData}
                            okText="Yes, Re-seed"
                            cancelText="Cancel"
                            okButtonProps={{ loading: seedingCompany }}
                          >
                            <Button
                              icon={<CloudSyncOutlined />}
                              loading={seedingCompany}
                              className="shrink-0 border-purple-500 text-purple-600 hover:bg-purple-50"
                            >
                              Sync / Re-seed Default Static Data
                            </Button>
                          </Popconfirm>
                        </div>

                        <Table
                          dataSource={staticCompanyTests}
                          columns={companyColumns}
                          rowKey={(record) => record.id || record._id}
                          pagination={false}
                          bordered
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  },
                  {
                    key: "dynamic",
                    label: (
                      <span className="flex items-center gap-2">
                        <ThunderboltOutlined /> Dynamic Catalog Preview ({dynamicCompanyTests.length})
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            Live published company practice sets and exam bundles created in the Admin Portal across tenant databases. Displayed on the website when Dynamic Mode is active.
                          </Paragraph>
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={fetchDynamicCompanyPreview}
                            loading={loadingDynamicCompany}
                          >
                            Refresh Preview
                          </Button>
                        </div>

                        <Table
                          dataSource={dynamicCompanyTests}
                          columns={companyColumns}
                          rowKey={(record) => record.id || record._id}
                          pagination={{ pageSize: 8 }}
                          bordered
                          loading={loadingDynamicCompany}
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        ) : selectedSection === "courses" ? (
          /* ════════════════════════════════════════════════════════════════
             COURSES LIBRARY MANAGEMENT VIEW (Detail View)
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Main Control Card */}
            <Card
              className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
              styles={{ body: { padding: "28px" } }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                      <ReadOutlined /> Courses Library Data Source
                    </span>

                    <Tag
                      color={isCoursesDynamic ? "purple" : "blue"}
                      className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase"
                    >
                      {isCoursesDynamic ? "Live Dynamic Mode" : "Static Database Mode"}
                    </Tag>
                  </div>

                  <h3 className="text-xl font-black text-slate-800">
                    Switch Between Static & Dynamic Courses
                  </h3>

                  <Paragraph className="!mb-0 text-slate-500 text-sm leading-relaxed">
                    Choose whether the public website courses page displays curated static courses or dynamic courses from the live platform catalog.
                  </Paragraph>

                  {coursesConfig.lastUpdated && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                      <InfoCircleOutlined /> Last mode update:{" "}
                      <span className="font-semibold text-slate-600">
                        {new Date(coursesConfig.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Big Interactive Toggle Switch */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shrink-0 sm:min-w-[280px]">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Website Source
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold transition-colors ${
                        !isCoursesDynamic ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      STATIC
                    </span>

                    <Switch
                      checked={isCoursesDynamic}
                      onChange={handleToggleCoursesMode}
                      loading={updatingCoursesMode}
                      checkedChildren="Dynamic"
                      unCheckedChildren="Static"
                      className="bg-slate-300"
                    />

                    <span
                      className={`text-sm font-bold transition-colors ${
                        isCoursesDynamic ? "text-purple-600" : "text-slate-400"
                      }`}
                    >
                      DYNAMIC
                    </span>
                  </div>

                  <div className="text-[11px] text-center text-slate-400 max-w-[210px] leading-tight mt-1">
                    {isCoursesDynamic
                      ? "Website visitors see live courses catalog from database."
                      : "Website visitors see curated static courses."}
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                    Static Database Courses
                  </div>
                  <div className="text-2xl font-black text-sky-900 mt-1">
                    {coursesConfig.staticCount}{" "}
                    <span className="text-xs font-medium text-sky-600">curated items</span>
                  </div>
                </div>

                <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                    Dynamic Published Courses
                  </div>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    {dynamicCourses.length > 0 ? dynamicCourses.length : (coursesConfig.dynamicCount || 0)}{" "}
                    <span className="text-xs font-medium text-purple-600">published items</span>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Database Status
                  </div>
                  <div className="text-2xl font-black text-emerald-900 mt-1 flex items-center gap-2">
                    <CheckCircleOutlined className="text-emerald-500 text-xl" /> Connected
                  </div>
                </div>
              </div>
            </Card>

            {/* Database Content Tabs */}
            <Card className="shadow-sm border-slate-200 rounded-2xl">
              <Tabs
                defaultActiveKey="static"
                items={[
                  {
                    key: "static",
                    label: (
                      <span className="flex items-center gap-2">
                        <DatabaseOutlined /> Static Courses Collection (<code>website.courses</code>)
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            These are the courses currently stored in MongoDB under{" "}
                            <code>website.courses</code>. Served to website visitors when Static Mode is active.
                          </Paragraph>

                          <Popconfirm
                            title="Re-seed Default Static Data?"
                            description="This will reset the website.courses collection to the default 9 curated courses."
                            onConfirm={handleSeedCoursesData}
                            okText="Yes, Re-seed"
                            cancelText="Cancel"
                            okButtonProps={{ loading: seedingCourses }}
                          >
                            <Button
                              icon={<CloudSyncOutlined />}
                              loading={seedingCourses}
                              className="shrink-0 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            >
                              Sync / Re-seed Default Static Data
                            </Button>
                          </Popconfirm>
                        </div>

                        <Table
                          dataSource={staticCourses}
                          columns={courseColumns}
                          rowKey={(record) => record.id || record._id}
                          pagination={false}
                          bordered
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  },
                  {
                    key: "dynamic",
                    label: (
                      <span className="flex items-center gap-2">
                        <ThunderboltOutlined /> Dynamic Catalog Preview ({dynamicCourses.length})
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            Live platform courses created in the Admin Portal across database collections. Displayed on the website when Dynamic Mode is active.
                          </Paragraph>
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={fetchDynamicCoursesPreview}
                            loading={loadingDynamicCourses}
                          >
                            Refresh Preview
                          </Button>
                        </div>

                        <Table
                          dataSource={dynamicCourses}
                          columns={courseColumns}
                          rowKey={(record) => record.id || record._id}
                          pagination={{ pageSize: 8 }}
                          bordered
                          loading={loadingDynamicCourses}
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        ) : selectedSection === "internships" ? (
          /* ════════════════════════════════════════════════════════════════
             INTERNSHIP OPPORTUNITIES MANAGEMENT VIEW (Detail View)
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Main Control Card */}
            <Card
              className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
              styles={{ body: { padding: "28px" } }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1.5">
                      <CarryOutOutlined /> Internship Opportunities Data Source
                    </span>

                    <Tag
                      color={isInternshipsDynamic ? "purple" : "blue"}
                      className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase"
                    >
                      {isInternshipsDynamic ? "Live Dynamic Mode" : "Static Database Mode"}
                    </Tag>
                  </div>

                  <h3 className="text-xl font-black text-slate-800">
                    Switch Between Static & Dynamic Internships
                  </h3>

                  <Paragraph className="!mb-0 text-slate-500 text-sm leading-relaxed">
                    Choose whether the public website internships page displays curated static internships or dynamic opportunities from the live platform.
                  </Paragraph>

                  {internshipsConfig.lastUpdated && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                      <InfoCircleOutlined /> Last mode update:{" "}
                      <span className="font-semibold text-slate-600">
                        {new Date(internshipsConfig.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Big Interactive Toggle Switch */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shrink-0 sm:min-w-[280px]">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Website Source
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold transition-colors ${
                        !isInternshipsDynamic ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      STATIC
                    </span>

                    <Switch
                      checked={isInternshipsDynamic}
                      onChange={handleToggleInternshipsMode}
                      loading={updatingInternshipsMode}
                      checkedChildren="Dynamic"
                      unCheckedChildren="Static"
                      className="bg-slate-300"
                    />

                    <span
                      className={`text-sm font-bold transition-colors ${
                        isInternshipsDynamic ? "text-purple-600" : "text-slate-400"
                      }`}
                    >
                      DYNAMIC
                    </span>
                  </div>

                  <div className="text-[11px] text-center text-slate-400 max-w-[210px] leading-tight mt-1">
                    {isInternshipsDynamic
                      ? "Website visitors see live internship opportunities from platform."
                      : "Website visitors see curated static internships."}
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                    Static Database Internships
                  </div>
                  <div className="text-2xl font-black text-sky-900 mt-1">
                    {internshipsConfig.staticCount}{" "}
                    <span className="text-xs font-medium text-sky-600">curated items</span>
                  </div>
                </div>

                <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                    Dynamic Published Internships
                  </div>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    {dynamicInternships.length > 0 ? dynamicInternships.length : (internshipsConfig.dynamicCount || 0)}{" "}
                    <span className="text-xs font-medium text-purple-600">published items</span>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Database Status
                  </div>
                  <div className="text-2xl font-black text-emerald-900 mt-1 flex items-center gap-2">
                    <CheckCircleOutlined className="text-emerald-500 text-xl" /> Connected
                  </div>
                </div>
              </div>
            </Card>

            {/* Database Content Tabs */}
            <Card className="shadow-sm border-slate-200 rounded-2xl">
              <Tabs
                defaultActiveKey="static"
                items={[
                  {
                    key: "static",
                    label: (
                      <span className="flex items-center gap-2">
                        <DatabaseOutlined /> Static Internships Collection (<code>website.internships</code>)
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            These are the internships currently stored in MongoDB under{" "}
                            <code>website.internships</code>. Served to website visitors when Static Mode is active.
                          </Paragraph>

                          <Popconfirm
                            title="Re-seed Default Static Data?"
                            description="This will reset the website.internships collection to the default 4 curated internships."
                            onConfirm={handleSeedInternshipsData}
                            okText="Yes, Re-seed"
                            cancelText="Cancel"
                            okButtonProps={{ loading: seedingInternships }}
                          >
                            <Button
                              icon={<CloudSyncOutlined />}
                              loading={seedingInternships}
                              className="shrink-0 border-amber-500 text-amber-600 hover:bg-amber-50"
                            >
                              Sync / Re-seed Default Static Data
                            </Button>
                          </Popconfirm>
                        </div>

                        <Table
                          dataSource={staticInternships}
                          columns={internshipColumns}
                          rowKey={(record) => record.id || record._id}
                          pagination={false}
                          bordered
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  },
                  {
                    key: "dynamic",
                    label: (
                      <span className="flex items-center gap-2">
                        <ThunderboltOutlined /> Dynamic Catalog Preview ({dynamicInternships.length})
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <Paragraph className="!mb-0 text-slate-500 text-sm">
                            Live platform internships created in the Admin Portal across database collections. Displayed on the website when Dynamic Mode is active.
                          </Paragraph>
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={fetchDynamicInternshipsPreview}
                            loading={loadingDynamicInternships}
                          >
                            Refresh Preview
                          </Button>
                        </div>

                        <Table
                          dataSource={dynamicInternships}
                          columns={internshipColumns}
                          rowKey={(record) => record.id || record._id}
                          pagination={{ pageSize: 8 }}
                          bordered
                          loading={loadingDynamicInternships}
                          className="rounded-lg overflow-hidden border border-slate-200"
                        />
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        ) : selectedSection === "newsflash" ? (
          /* ════════════════════════════════════════════════════════════════
             WEBSITE NEWSFLASH MANAGEMENT VIEW (Integrated Section)
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            <NewsFlashManagement ref={newsflashRef} />
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             OVERVIEW / SECTIONS HUB VIEW (Separate Cards Grid)
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            <Row gutter={[20, 20]}>
              {websiteSections.map((sec) => (
                <Col xs={24} sm={12} lg={12} xl={8} key={sec.key}>
                  <Card
                    hoverable={sec.isReady}
                    onClick={() => {
                      if (sec.isReady) {
                        handleOpenSection(sec.key);
                      } else {
                        message.info(
                          `${sec.title} static & dynamic data management will be available soon!`
                        );
                      }
                    }}
                    className={`h-full rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between ${
                      sec.accentColor
                    } ${sec.isReady ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer" : "opacity-90"}`}
                    styles={{ body: { padding: "24px", height: "100%", display: "flex", flexDirection: "column" } }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          {sec.icon}
                        </div>

                        {sec.isReady ? (
                          <Tag
                            color={sec.badgeColor}
                            className="font-bold text-xs px-2.5 py-0.5 rounded-full uppercase"
                          >
                            {sec.badgeText}
                          </Tag>
                        ) : (
                          <Tag color="default" className="text-xs px-2 py-0.5 rounded-full font-semibold">
                            {sec.status}
                          </Tag>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-slate-800 mb-2">
                        {sec.title}
                      </h4>

                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
                        {sec.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      {sec.isReady ? (
                        <>
                          <span className="text-xs font-semibold text-slate-600">
                            {sec.subInfo}
                          </span>
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                            Manage <RightOutlined />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-slate-400">Future Extension</span>
                          <span className="text-xs font-semibold text-slate-400">Coming Soon</span>
                        </>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}
