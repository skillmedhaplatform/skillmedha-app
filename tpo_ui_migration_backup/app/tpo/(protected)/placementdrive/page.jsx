"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@bprogress/next/app";
import {
  Button,
  Table,
  Select,
  Modal,
  Upload,
  Dropdown,
  message,
} from "antd";
import Search from "antd/es/input/Search";
import styles from "./allstudents.module.scss";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "@/modules/tpo/components/PageHeader";
import {
  CreateOnePlacement,
  deleteJobProfile,
  GetAllPlacements,
} from "@/redux/slices/tpo/placementsSlice";
import ImgCrop from "antd-img-crop";
import { handleS3Upload as uploadToS3 } from "@/utils/universalUtils/s3uploads";
import { restUrl } from "@/utils/universalUtils/urls";
import { BsThreeDotsVertical } from "react-icons/bs";

// ─── Helpers ────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#24a058", "#1d70b8", "#593cc1", "#c5782b",
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

const PAGE_SIZES = [10, 20, 50];

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
  const inputRef = useRef(null);

  const { value: ALLPLACEMENTS } = useSelector(
    (state) => state.placement.AllPlacements
  );

  const { value: userDetailsVal } = useSelector(
    (state) => state.user.UserDetails
  );
  const USER_DETAILS = userDetailsVal?.data;

  // ─── State ────────────────────────────────────────────────
  const [isModal, setIsModal] = useState(false);
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
    dispatch(GetAllPlacements());
  }, []);

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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Handlers (preserved) ─────────────────────────────────
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

  const handleSave = async () => {
    if (!formData.companyName) {
      alert("Please fill required fields");
      return;
    }
    await dispatch(CreateOnePlacement({ payload: formData, dispatch }));
    setFormData({
      companyName: "",
      companyLogo: "",
      startDate: "",
      endDate: "",
      createdBy: "",
      phoneNumber: "",
    });
    setFileList([]);
    setIsModal(false);
  };

  const handleDelete = (record) => {
    dispatch(deleteJobProfile({ profileId: record?._id }));
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
              { key: "delete", label: "Delete", danger: true },
            ],
            onClick: (e) => {
              if (e.domEvent) {
                e.domEvent.preventDefault();
                e.domEvent.stopPropagation();
              }
              if (e.key === "delete") handleDelete(record);
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

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      <PageHeader
        breadcrumb="Placement drive"
        title="All companies"
        subtitle="Manage recruiting companies, contacts and placement drives"
        actionText="+ Create Company"
        onActionClick={() => setIsModal(true)}
      />

      <div className={styles.container}>
        {/* ── Summary Stats ── */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.companiesCard}`}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(36, 160, 88, 0.1)", color: "#24a058" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17 17V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12l3.5-2 3.5 2 3.5-2L17 17z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.statValue}>{stats.companiesCount}</span>
            <div className={styles.statTextCont}>
              <span className={styles.statLabel}>Companies</span>
              <span className={styles.statSub}>Total registered</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.activeDrivesCard}`}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(29, 112, 184, 0.1)", color: "#1d70b8" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className={styles.statValue}>{stats.activeDrives}</span>
            <div className={styles.statTextCont}>
              <span className={styles.statLabel}>Active Drives</span>
              <span className={styles.statSub}>Currently hiring</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.studentsPlacedCard}`}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(197, 120, 43, 0.1)", color: "#c5782b" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14 16.5V15C14 13.3431 12.6569 12 11 12H7C5.34315 12 4 13.3431 4 15V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16 12.5V8.5M14 10.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={styles.statValue}>{stats.studentsPlaced}</span>
            <div className={styles.statTextCont}>
              <span className={styles.statLabel}>Students Placed</span>
              <span className={styles.statSub}>Across all drives</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.latestAddedCard}`}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(89, 60, 193, 0.1)", color: "#593cc1" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L3 7L10 11L17 7L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M3 13L10 17L17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10L10 14L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.statValue} title={stats.latestName}>
              {stats.latestName.length > 12
                ? stats.latestName.slice(0, 12) + "…"
                : stats.latestName}
            </span>
            <div className={styles.statTextCont}>
              <span className={styles.statLabel}>Latest Added</span>
              <span className={styles.statSub}>Most recent company</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabBar}>
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
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Created By</span>
                          <span className={styles.metaValue}>
                            {company.createdBy || "—"}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
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
                              if (e.key === "edit") handleClick(company);
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

        {/* ── Pagination ── */}
        {filteredData.length > 0 && (
          <div className={styles.paginationBar}>
            <span className={styles.paginationInfo}>
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} companies
            </span>

            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ‹
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className={styles.pageBtn}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ›
              </button>

              <Select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(val) => {
                  setPageSize(val);
                  setCurrentPage(1);
                }}
                options={PAGE_SIZES.map((s) => ({
                  value: s,
                  label: `${s} / page`,
                }))}
                size="small"
                style={{ width: 100 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Create Company Modal (preserved) ── */}
      <Modal
        title={<h2>Create Company</h2>}
        centered
        open={isModal}
        onCancel={() => setIsModal(false)}
        width={"60%"}
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
              value={formData.phoneNumber}
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace(/(?!^\+)\D/g, "");
                if (value.length > 13) {
                  value = value.slice(0, 13);
                }
                const phoneRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;
                const isValid = phoneRegex.test(value) || value.length === 0;
                handleChange("phoneNumber", value);
                if (value.length > 0 && !isValid && value.length >= 10) {
                  message.error("Invalid phone format");
                }
              }}
            />
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
