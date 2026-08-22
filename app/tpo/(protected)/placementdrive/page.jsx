"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "@bprogress/next/app";
import {
  Button,
  Table,
  Select,
  Modal,
  Upload,
  Dropdown,
  message,
  Popover,
} from "antd";
import Search from "antd/es/input/Search";
import styles from "./allstudents.module.scss";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "@/modules/tpo/components/PageHeader";
import {
  CreateOnePlacement,
  UpdateJobProfile,
  deleteJobProfile,
  GetAllPlacements,
} from "@/redux/slices/tpo/placementsSlice";
import ImgCrop from "antd-img-crop";
import { handleS3Upload as uploadToS3 } from "@/utils/universalUtils/s3uploads";
import { restUrl } from "@/utils/universalUtils/urls";
import { BsThreeDotsVertical, BsFilter } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";

// ─── Helpers ────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6BA8ED", "#1d70b8", "#593cc1", "#c5782b",
  "#e53e3e", "#0ea5e9", "#8b5cf6", "#d946ef",
];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const formatDate = (raw) => {
  if (!raw) return "—";
  const ts = typeof raw === "string" ? parseInt(raw, 10) : raw;
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getCompanyStatus = (company) => {
  const jobs = company?.companies || [];
  if (jobs.length === 0) return "pending";
  // Check if any job has recent activity (within 90 days)
  const now = Date.now();
  const hasRecent = jobs.some((job) => {
    const end = job.endDate ? new Date(job.endDate).getTime() : 0;
    const start = job.startDate ? new Date(job.startDate).getTime() : 0;
    return end > now - 90 * 24 * 60 * 60 * 1000 || start > now - 90 * 24 * 60 * 60 * 1000;
  });
  return hasRecent ? "active" : "inactive";
};

const getStudentsPlaced = (company) => {
  const jobs = company?.companies || [];
  return jobs.reduce((sum, job) => sum + (job.approvedStudents?.length || 0), 0);
};

const getOpenRoles = (company) => {
  return company?.companies?.length || 0;
};

// ─── Tabs ──────────────────────────────────────────────────
const TABS = [
  { key: "all", label: "All Companies" },
  { key: "active", label: "Active Drives" },
  { key: "pending", label: "Pending" },
  { key: "mine", label: "My Companies" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

const PAGE_SIZES = [10, 25, 50, 100];

// ─── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cls =
    status === "active"
      ? styles.statusActive
      : status === "pending"
      ? styles.statusPending
      : styles.statusInactive;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`${styles.statusBadge} ${cls}`}>
      <span className={styles.statusDot} />
      {label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════
export default function DriveDetails() {
  const router = useRouter();
  const dispatch = useDispatch();


  const { value: ALLPLACEMENTS, status: placementsStatus } = useSelector(
    (state) => state.placement.AllPlacements
  );

  const { value: userDetailsVal } = useSelector(
    (state) => state.user.UserDetails
  );
  const USER_DETAILS = userDetailsVal?.data;

  // ─── State ────────────────────────────────────────────────
  const [isModal, setIsModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileList, setFileList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    startDate: "",
    endDate: "",
    createdBy: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (placementsStatus !== "succeeded" && placementsStatus !== "loading") {
      dispatch(GetAllPlacements());
    }
  }, [dispatch, placementsStatus]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, searchQuery, sortBy]);

  // ─── Data Processing ─────────────────────────────────────
  const allData = useMemo(
    () => (Array.isArray(ALLPLACEMENTS?.data) ? ALLPLACEMENTS.data : []),
    [ALLPLACEMENTS]
  );

  // Stats
  const stats = useMemo(() => {
    const companiesCount = allData.length;
    const activeDrives = allData.filter(
      (c) => (c.companies?.length || 0) > 0
    ).length;
    const studentsPlaced = allData.reduce(
      (sum, c) => sum + getStudentsPlaced(c),
      0
    );

    // Latest added
    let latestName = "—";
    let latestTs = 0;
    allData.forEach((c) => {
      const ts = parseInt(c.createdAt, 10) || 0;
      if (ts > latestTs) {
        latestTs = ts;
        latestName = c.companyName || "—";
      }
    });

    return { companiesCount, activeDrives, studentsPlaced, latestName };
  }, [allData]);

  // Filtering + Sorting
  const filteredData = useMemo(() => {
    let result = [...allData];

    // Tab filter
    if (activeTab === "active") {
      result = result.filter((c) => getCompanyStatus(c) === "active");
    } else if (activeTab === "pending") {
      result = result.filter((c) => getCompanyStatus(c) === "pending");
    } else if (activeTab === "mine") {
      const userName = USER_DETAILS?.userName || "";
      result = result.filter(
        (c) =>
          c.createdBy &&
          c.createdBy.toLowerCase() === userName.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => getCompanyStatus(c) === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          (c.createdBy && c.createdBy.toLowerCase().includes(q)) ||
          (c.phoneNumber && c.phoneNumber.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (parseInt(b.createdAt, 10) || 0) - (parseInt(a.createdAt, 10) || 0);
        case "oldest":
          return (parseInt(a.createdAt, 10) || 0) - (parseInt(b.createdAt, 10) || 0);
        case "az":
          return (a.companyName || "").localeCompare(b.companyName || "");
        case "za":
          return (b.companyName || "").localeCompare(a.companyName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [allData, activeTab, statusFilter, searchQuery, sortBy, USER_DETAILS]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const userName = USER_DETAILS?.userName || "";
    return {
      all: allData.length,
      active: allData.filter((c) => getCompanyStatus(c) === "active").length,
      pending: allData.filter((c) => getCompanyStatus(c) === "pending").length,
      mine: allData.filter(
        (c) =>
          c.createdBy &&
          c.createdBy.toLowerCase() === userName.toLowerCase()
      ).length,
    };
  }, [allData, USER_DETAILS]);

  // Display all data on a single page
  const paginatedData = filteredData;

  // ─── Handlers ─────────────────────────────────────────────
  const onChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleS3Upload = async ({ file, onSuccess, onError }) => {
    uploadToS3({
      file,
      restUrl,
      bucketName: "skillmedha-utils",
      onUploaded: (uploadedFile) => {
        setFormData((prev) => ({ ...prev, companyLogo: uploadedFile }));
        setFileList([
          {
            uid: "-1",
            name: uploadedFile.name,
            status: "done",
            url: uploadedFile,
          },
        ]);
      },
      onSuccess,
      onError,
    });
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]:
        key === "companiesCount" ? value.map((v) => ({ name: v })) : value,
    }));
  };

  const handleClick = (record) => {
    router.push(`/tpo/placementdrive/${record._id}`);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      companyName: "",
      companyLogo: "",
      startDate: "",
      endDate: "",
      createdBy: "",
      phoneNumber: "",
    });
    setFileList([]);
    setIsModal(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingId(company._id);
    let cleanPhone = (company.phoneNumber || "").replace(/\D/g, "");
    if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

    setFormData({
      companyName: company.companyName || "",
      companyLogo: company.companyLogo || "",
      startDate: company.startDate || "",
      endDate: company.endDate || "",
      createdBy: company.createdBy || "",
      phoneNumber: cleanPhone,
    });
    if (company.companyLogo) {
      setFileList([
        {
          uid: "-1",
          name: "companyLogo",
          status: "done",
          url: company.companyLogo,
        },
      ]);
    } else {
      setFileList([]);
    }
    setIsModal(true);
  };

  const handleSave = async () => {
    if (!formData.companyName) {
      alert("Please fill required fields");
      return;
    }
    if (formData.phoneNumber && formData.phoneNumber.length > 0 && formData.phoneNumber.length !== 10) {
      message.error("Phone number must be exactly 10 digits");
      return;
    }
    if (editingId) {
      await dispatch(
        UpdateJobProfile({ profileId: editingId, payload: formData, dispatch })
      );
    } else {
      await dispatch(CreateOnePlacement({ payload: formData, dispatch }));
    }
    setFormData({
      companyName: "",
      companyLogo: "",
      startDate: "",
      endDate: "",
      createdBy: "",
      phoneNumber: "",
    });
    setFileList([]);
    setEditingId(null);
    setIsModal(false);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Company Profile",
      content: "Are you sure you want to delete this company profile? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => dispatch(deleteJobProfile({ profileId: record?._id })),
    });
  };

  // ─── Table columns (for table view toggle) ────────────────
  const columns = [
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) => formatDate(record.createdAt),
    },
    { title: "Created By", dataIndex: "createdBy", key: "createdBy" },
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Students Placed",
      key: "studentsPlaced",
      render: (_, record) => getStudentsPlaced(record),
    },
    {
      title: "Open Roles",
      key: "openRoles",
      render: (_, record) => getOpenRoles(record),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => <StatusBadge status={getCompanyStatus(record)} />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "view", label: "View Details" },
              { key: "edit", label: "Edit Details" },
              { key: "delete", label: "Delete", danger: true },
            ],
            onClick: (e) => {
              if (e.domEvent) {
                e.domEvent.preventDefault();
                e.domEvent.stopPropagation();
              }
              if (e.key === "delete") handleDelete(record);
              if (e.key === "edit") handleOpenEditModal(record);
              if (e.key === "view") handleClick(record);
            },
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <BsThreeDotsVertical />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const tabMenuItems = TABS.map((tab) => ({
    key: tab.key,
    label: (
      <span>
        {tab.label} <span style={{ color: '#805ad5', fontWeight: 600, marginLeft: 6 }}>{tabCounts[tab.key]}</span>
      </span>
    ),
    onClick: () => setActiveTab(tab.key),
  }));

  const activeTabLabel = TABS.find((t) => t.key === activeTab)?.label;

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      <div className={styles.stickyHeaderWrapper}>
        <PageHeader
          title="All companies"
          subtitle="Manage recruiting companies, contacts and placement drives"
          actionText="+ Create Company"
          onActionClick={handleOpenCreateModal}
        />

        <div className={styles.topSectionWrapper}>
          <div className={styles.leftControls}>
            <div className={styles.desktopTabBar} style={{ borderBottom: 'none', marginBottom: 0 }}>
              {TABS.map((tab) => (
                <div
                  key={tab.key}
                  className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <span className={styles.tabCount}>{tabCounts[tab.key]}</span>
                </div>
              ))}
            </div>
            <div className={styles.mobileTabBar}>
              <Dropdown menu={{ items: tabMenuItems }} trigger={['click']}>
                <Button className={styles.mobileTabBtn}>
                  {activeTabLabel} <FaCaretDown />
                </Button>
              </Dropdown>
            </div>
          </div>

          <div className={styles.rightControls}>
            <div className={styles.miniStatsContainer}>
              <div className={`${styles.miniStat} ${styles.activeDrivesStat}`}>
                <span className={styles.miniStatValue}>{stats.activeDrives}</span>
                <span className={styles.miniStatLabel}>Active Drives</span>
              </div>
              <div className={`${styles.miniStat} ${styles.studentsPlacedStat}`}>
                <span className={styles.miniStatValue}>{stats.studentsPlaced}</span>
                <span className={styles.miniStatLabel}>Students Placed</span>
              </div>
              <div className={`${styles.miniStat} ${styles.latestAddedStat}`}>
                <span className={styles.miniStatValue} title={stats.latestName}>
                  {stats.latestName.length > 12
                    ? stats.latestName.slice(0, 12) + "…"
                    : stats.latestName}
                </span>
                <span className={styles.miniStatLabel}>Latest Added</span>
              </div>
            </div>

            <Button type="primary" className={styles.createBtn} onClick={handleOpenCreateModal}>
              <span className={styles.createText}>+ Create Company</span>
              <span className={styles.createIcon}>+</span>
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.container}>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <Search
            placeholder="Search companies…"
            className={styles.searchInput}
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(value) => setSearchQuery(value)}
          />

          <div className={styles.desktopFilters}>
            <Select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              size="middle"
            />

            <Select
              className={styles.sortSelect}
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
              size="middle"
            />
          </div>

          <div className={styles.mobileFilter}>
            <Popover
              content={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Status</div>
                    <Select
                      style={{ width: '100%' }}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={STATUS_OPTIONS}
                      size="middle"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Sort By</div>
                    <Select
                      style={{ width: '100%' }}
                      value={sortBy}
                      onChange={setSortBy}
                      options={SORT_OPTIONS}
                      size="middle"
                    />
                  </div>
                </div>
              }
              trigger="click"
              placement="bottomRight"
            >
              <button className={styles.filterBtn}>
                <BsFilter />
              </button>
            </Popover>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "cards" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("cards")}
              title="Card view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === "table" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Company List ── */}
        {viewMode === "cards" ? (
          <>
            {paginatedData.length > 0 ? (
              <div className={styles.cardsList}>
                {paginatedData.map((company) => {
                  const status = getCompanyStatus(company);
                  const placed = getStudentsPlaced(company);
                  const roles = getOpenRoles(company);

                  return (
                    <div
                      key={company._id}
                      className={styles.companyCard}
                      onClick={() => handleClick(company)}
                    >
                      {/* Avatar */}
                      <div
                        className={styles.companyAvatar}
                        style={{ backgroundColor: getAvatarColor(company.companyName) }}
                      >
                        {company.companyLogo ? (
                          <img
                            src={company.companyLogo}
                            alt={company.companyName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "10px",
                            }}
                          />
                        ) : (
                          getInitials(company.companyName)
                        )}
                      </div>

                      {/* Company Info */}
                      <div className={styles.companyInfo}>
                        <span className={styles.companyName}>
                          {company.companyName || "Unnamed"}
                        </span>
                        <span className={styles.companyContact}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M11 8.46V9.96a1 1 0 01-1.09 1A9.9 9.9 0 014.56 9.1a9.74 9.74 0 01-3-3A9.9 9.9 0 01.7 1.09 1 1 0 011.68.5H3.18a1 1 0 011 .86c.064.489.183.97.355 1.43a1 1 0 01-.225 1.055L3.51 4.64a8 8 0 003 3l.8-.8a1 1 0 011.055-.225c.46.172.941.29 1.43.355a1 1 0 01.86 1.02v1.5z" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {company.phoneNumber || "No phone"}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className={styles.cardMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Date Added</span>
                          <span className={styles.metaValue}>
                            {formatDate(company.createdAt)}
                          </span>
                        </div>
                        <div className={`${styles.metaItem} ${styles.hideOnTablet}`}>
                          <span className={styles.metaLabel}>Created By</span>
                          <span className={styles.metaValue}>
                            {company.createdBy || "—"}
                          </span>
                        </div>
                        <div className={`${styles.metaItem} ${styles.hideOnTablet}`}>
                          <span className={styles.metaLabel}>Placed</span>
                          <span className={styles.metaValue}>{placed}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Open Roles</span>
                          <span className={styles.metaValue}>{roles}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Status</span>
                          <StatusBadge status={status} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className={styles.cardActions}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                          onClick={() => handleClick(company)}
                        >
                          View
                        </button>
                        <Dropdown
                          menu={{
                            items: [
                              { key: "edit", label: "Edit" },
                              {
                                key: "delete",
                                label: "Delete",
                                danger: true,
                              },
                            ],
                            onClick: (e) => {
                              if (e.domEvent) {
                                e.domEvent.preventDefault();
                                e.domEvent.stopPropagation();
                              }
                              if (e.key === "delete") handleDelete(company);
                              if (e.key === "edit") handleOpenEditModal(company);
                            },
                          }}
                          trigger={["click"]}
                        >
                          <button className={styles.moreBtn}>
                            <BsThreeDotsVertical />
                          </button>
                        </Dropdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <span className={styles.emptyText}>No companies found</span>
                <span className={styles.emptySub}>
                  Try adjusting your filters or create a new company
                </span>
              </div>
            )}
          </>
        ) : (
          /* Table View */
          <Table
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            className={styles.customTable}
            rowKey="_id"
            sticky
            scroll={{ y: 500 }}
            onRow={(record) => ({
              onClick: () => handleClick(record),
              style: { cursor: "pointer" },
            })}
          />
        )}
      </div>

      {/* ── Create / Edit Company Modal ── */}
      <Modal
        title={<h2>{editingId ? "Edit Company" : "Create Company"}</h2>}
        centered
        open={isModal}
        onCancel={() => setIsModal(false)}
        width={typeof window !== "undefined" && window.innerWidth <= 640 ? "95%" : "60%"}
        footer={null}
      >
        <div className={styles.modalForm}>
          <div className={styles.formRow}>
            <label>Company Name</label>
            <input
              type="text"
              placeholder="e.g., TechSprint 2025"
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <label>Company Logo</label>
            <div className={styles.inpuCont}>
              <ImgCrop rotationSlider>
                <Upload
                  customRequest={handleS3Upload}
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onChange}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                  }}
                >
                  {fileList.length < 1 && "+ Upload"}
                </Upload>
              </ImgCrop>
            </div>
          </div>

          <div className={styles.formRow}>
            <label>Created By</label>
            <input
              type="text"
              placeholder="e.g., Muralidhar"
              value={formData.createdBy}
              onChange={(e) => handleChange("createdBy", e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <label>Phone Number</label>
              <input
                type="text"
                placeholder="e.g., 9876543210"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleChange("phoneNumber", value);
                }}
              />
              {formData.phoneNumber && formData.phoneNumber.length !== 10 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  Must be exactly 10 digits
                </div>
              )}
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.saveBtn} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
