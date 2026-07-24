"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Drawer,
  Table,
  message,
  Dropdown,
  Menu,
  Input,
  Space,
  Tooltip,
  Popconfirm,
} from "antd";
import styles from "./notice.module.scss";
import NoticeForm from "./(components)/form";
import NoticePreviewCard from "./(components)/previewCard";
import { VscFolderActive } from "react-icons/vsc";
import { FcExpired } from "react-icons/fc";
import { CiSaveDown2 } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteNotice,
  ExpireNotice,
  GetNoticeByStatus,
  PublishNotice,
} from "@/redux/slices/tpo/noticewboardSlice";
import { getAllDepartments } from "@/redux/slices/tpo/departmentSlice";
import { targetGroupOptions } from "./(components)/formschema";
import PageHeader from "@/modules/tpo/components/PageHeader";

const Page = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [currentTab, setCurrentTab] = useState("active");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");

  const noticeTabs = [
    { name: "Active Notices", key: "active", icon: <VscFolderActive /> },
    { name: "Expired Notices", key: "expired", icon: <FcExpired /> },
    { name: "Saved Drafts", key: "pending", icon: <CiSaveDown2 /> },
  ];

  // selectors----------------------------------
  const {
    value,
    status: loading,
    erroe,
  } = useSelector((state) => state.notice.AllNotices);
  const NoticeBoard = value?.notices || [];

  const departmentStatus = useSelector(
    (state) => state.department.getAllDepartments.status
  );

  const showDrawer = (record = null) => {
    setEditingNotice(record);
    if (record?._id) {
      setSelectedNoticeId(record._id);
    }
    setOpen(true);
  };

  const onFinish = () => {
    setOpen(false);
    setEditingNotice(null);
  };

  const getSelectedNotice = () => {
    return NoticeBoard?.find((item) => item._id === selectedNoticeId) || null;
  };

  const handleTabChange = (key) => {
    setCurrentTab(key);
    setSearchText("");
    setFilterType("");
    setOpen(false);
  };

  const handleEdit = (record) => {
    setSelectedNoticeId(record?._id);
    showDrawer(record);
  };

  useEffect(() => {
    if (departmentStatus !== "sucess" && departmentStatus !== "loading") {
      dispatch(getAllDepartments());
    }
  }, [dispatch, departmentStatus]);

  useEffect(() => {
    dispatch(GetNoticeByStatus({ status: currentTab, limit: 7, page: 1 }));
  }, [currentTab, dispatch]);

  useEffect(() => {
    if (NoticeBoard && NoticeBoard.length > 0) {
      setSelectedNoticeId(NoticeBoard[0]._id);
    } else {
      setSelectedNoticeId(null);
    }
  }, [NoticeBoard]);

  const handleDynamicAction = (record, status) => {
    if (status === "active") {
      dispatch(ExpireNotice({ NoticeId: record?._id, dispatch }));
    } else if (status === "expired") {
      dispatch(
        PublishNotice({ NoticeId: record?._id, dispatch, status: "expired" })
      );
    } else if (status === "pending") {
      dispatch(PublishNotice({ NoticeId: record?._id, dispatch }));
    }
  };

  const handleDelete = (noticeId) => {
    dispatch(DeleteNotice({ NoticeId: noticeId, currentTab, dispatch }));
  };

  const getActionLabel = (status) => {
    if (status === "active") return "Stop";
    if (status === "expired") return "Re Publish";
    if (status === "pending") return "Publish";
    return "";
  };

  const getColumns = (status) => [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            autoFocus
            placeholder="Search title"
            value={selectedKeys[0]}
            onChange={(e) => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              confirm({ closeDropdown: false });
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => {
              clearFilters();
              confirm({ closeDropdown: false });
            }}
            size="small"
            style={{ width: "100%" }}
          >
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <span style={{ color: filtered ? "#1677ff" : undefined }}>🔍</span>
      ),
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Target Group",
      dataIndex: "targetGroup",
      key: "targetGroup",
      render: (targetGroup) =>
        targetGroupOptions?.find((e) => e?.value === targetGroup?.code)?.label,
    },
    {
      title: "Publish On",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDynamicAction(record, currentTab);
            }}
            danger={status === "active"}
          >
            {getActionLabel(status)}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.noticePageContainer}>
      <div className={styles.stickyHeader}>
        <PageHeader
          title="Notice Board"
          subtitle="Create and manage system announcements"
          actionText="+ Create Notice"
          onActionClick={() => showDrawer(null)}
        />
        <div className={styles.tabsWrapper}>
          <div className={styles.tabsRow}>
            {noticeTabs.map((tab) => {
              const isActive = currentTab === tab.key;
              return (
                <div
                  key={tab.key}
                  className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                  {isActive && <div className={styles.activeIndicator} />}
                </div>
              );
            })}
          </div>
          <Button type="primary" onClick={() => showDrawer(null)}>
            + Create Notice
          </Button>
        </div>
      </div>
      <div className={styles.noticemainCont}>
        <div className={styles.bottomCont}>
          <div className={styles.contentCont}>

            {loading === "loading" ? (
              <div style={{ textAlign: "center", padding: "40px" }}>Loading notices...</div>
            ) : NoticeBoard && NoticeBoard.length > 0 ? (
              <div className={styles.noticesList}>
                {NoticeBoard.map((record) => {
                  const isActive = selectedNoticeId === record._id;
                  const targetGroupLabel = targetGroupOptions?.find((e) => e?.value === record.targetGroup?.code)?.label || "All";
                  const publishDate = record.startDate || "—";
                  
                  let badgeCls = styles.statusActive;
                  let cardTypeCls = styles.activeNoticeCard;
                  let statusLabel = "Active";
                  if (currentTab === "expired") {
                    badgeCls = styles.statusInactive;
                    cardTypeCls = styles.expiredNoticeCard;
                    statusLabel = "Expired";
                  } else if (currentTab === "pending") {
                    badgeCls = styles.statusPending;
                    cardTypeCls = styles.draftNoticeCard;
                    statusLabel = "Draft";
                  }

                  return (
                    <div
                      key={record._id}
                      className={`${styles.noticeCard} ${cardTypeCls} ${isActive ? styles.selectedRow : ""}`}
                      onClick={() => {
                        setSelectedNoticeId(record._id);
                        setOpen(false);
                      }}
                    >
                      {/* Left Info Section */}
                      <div className={styles.noticeInfo}>
                        <span className={styles.noticeTitle}>{record.title}</span>
                      </div>

                      {/* Middle Metrics Section */}
                      <div className={styles.noticeMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Type</span>
                          <span className={styles.metaValue}>{record.type || "—"}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Target Group</span>
                          <span className={styles.metaValue}>{targetGroupLabel}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Publish On</span>
                          <span className={styles.metaValue}>{publishDate}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Status</span>
                          <span className={`${styles.statusBadge} ${badgeCls}`}>
                            <span className={styles.statusDot} />
                            {statusLabel}
                          </span>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                          onClick={() => {
                            setSelectedNoticeId(record._id);
                            handleDynamicAction(record, currentTab);
                          }}
                        >
                          {getActionLabel(currentTab)}
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>
                        <Popconfirm
                          title="Delete Notice"
                          description="Are you sure you want to delete this notice?"
                          onConfirm={() => handleDelete(record._id)}
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{ danger: true }}
                        >
                          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>
                            Delete
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>No notices found 📪.</p>
                <p style={{ color: "#888" }}>
                  📩 Click the "Create Notice" button to create your first notice.
                </p>
              </div>
            )}
          </div>

          {selectedNoticeId && !open && (
            <NoticePreviewCard
              data={getSelectedNotice()}
              onEdit={() => handleEdit(getSelectedNotice())}
            />
          )}

          <Drawer
            title={
              <div className={styles.drawerHeader}>
                <h3>{editingNotice ? "Edit Notice" : "Create Notice"}</h3>
                <Button type="text" onClick={() => onFinish()}>
                  ❌
                </Button>
              </div>
            }
            placement="right"
            closable={false}
            onClose={() => onFinish()}
            open={open}
            getContainer={false}
            // mask={false}
            size="large"
            rootStyle={{ position: "absolute" }}
          >
            <NoticeForm
              initialValues={editingNotice}
              onFinish={() => onFinish()}
              currentTab={currentTab}
            />
          </Drawer>
        </div>
      </div>
    </div>
  );
};

export default Page;
