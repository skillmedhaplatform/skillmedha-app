"use client";
import React, { useEffect, useState } from "react";
// import Home from "../page";
import "./page.css";
import zoomStyles from "./page.module.scss";
import dynamic from "next/dynamic";

const ZoomClient = dynamic(() => import("./utils/join"), {
  ssr: false,
});
import { Input, Modal, Radio, Select, Space, ConfigProvider, Pagination } from "antd";
import { BsCameraVideo, BsJournalBookmark } from "react-icons/bs";
import { MdWorkOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCourses,
  getAllInternShips,
  getInternshipSections,
  getOneInternship,
  getTopicsFromSection,
  resetCourseVals,
  resetInternshipVals,
} from "@/redux/slices/admin/cms/internship";
import {
  createZoomMeeting,
  getAllMeetings,
  searchMeetingByTopic,
} from "@/redux/slices/admin/cms/zoomSlice";
import { useRouter } from "next/navigation";

const options = [
  { label: "Internship", value: "internship" },
  { label: "Course", value: "course" },
];

const page = () => {
  const nav = useRouter();
  const userCreds = useSelector((state) => state.user?.singleUser);

  const allMeetings = useSelector((state) => state.adminZoom.allMeetings);

  const dispatch = useDispatch();
  const allInternShips = useSelector(
    (state) => state.adminInternship.allInternShips?.data
  );
  const allCourses = useSelector((state) => state.adminInternship.allCourses?.data);
  const allSections = useSelector((s) => s.adminInternship.allSections) || [];
  const allTopics = useSelector((state) => state.adminInternship.allTopics) || [];
  const [type, setType] = useState("internship");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [joined, isJoined] = useState(false);
  const [createModal, setCreateModal] = useState(false);

  // Track selected IDs and select-values
  const [selectedInternshipId, setSelectedInternshipId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedSectionValue, setSelectedSectionValue] = useState("");
  const [selectedTopicValue, setSelectedTopicValue] = useState("");
  const [selectedInternShipValue, setSelectedInternShipValue] = useState("");

  const [selectedTopicId, setSelectedTopicId] = useState("");

  const getAllSectionsFromInternships = (id) => {
    dispatch(getOneInternship({ id, orgId: userCreds?.orgId }));
    dispatch(getInternshipSections({ id }));
  };

  const getAllTopicsFromSections = (sectionId) => {
    // use the stored internship ID when fetching topics
    dispatch(
      getTopicsFromSection({ id: selectedInternshipId, sid: sectionId })
    );
  };

  useEffect(() => {
    setSelectedInternShipValue(undefined);
    setSelectedSectionValue(undefined);
    setSelectedInternshipId(undefined);
    setSelectedTopicValue(undefined);
    if (type == "internship") {
      dispatch(resetCourseVals());
      dispatch(getAllInternShips({ limit: 100 }));
    } else {
      dispatch(resetInternshipVals());

      dispatch(
        getAllCourses({
          limit: 20,
          cursor: null,
        })
      );
    }
    dispatch(
      getAllMeetings({
        type,
        cursor: null,
        limit: 100,
      })
    );
    setCurrentPage(1);
  }, [type]);

  const createMeetingButton = () => {
    const meetingTitle = selectedTopicValue || selectedSectionValue || selectedInternShipValue || "Zoom Meeting";
    const payload = {
      hostName: userCreds?.userName,
      hostId: userCreds?._id,
      topic: meetingTitle,
      topicId: selectedTopicId,
      section: selectedSectionValue,
      internship: selectedInternShipValue,
      type: type,
    };
    dispatch(createZoomMeeting({ data: payload, dispatch }))?.then((res) => {
      if (res.payload) {
        dispatch(
          getAllMeetings({
            type,
            cursor: null,
            limit: 100,
          })
        );
      }
    });
    setCreateModal(false);
  };

  const startClass = (id) => {
    nav.push("/admin/liveLect/" + id);
  };

  const searchMeetingByTopicButton = (text) => {
    dispatch(
      searchMeetingByTopic({
        limit: 100,
        cursor: null,
        type,
        text,
      })
    );
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMeetings = allMeetings?.slice(startIndex, endIndex);

  return (
    <>
      <div className={zoomStyles.container}>
        {!joined && (
          <div className={zoomStyles.beforeJoinContainer}>
            <div className={zoomStyles.titleContainer}>
              <Input.Search
                placeholder="Search existing meetings..."
                style={{ maxWidth: "400px", minWidth: "250px" }}
                onSearch={(value) => searchMeetingByTopicButton(value)}
                allowClear
              />

              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#1E69DA',
                    },
                  }}
                >
                  <Radio.Group
                    options={options}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                  />
                </ConfigProvider>
                <button 
                  onClick={() => setCreateModal(true)}
                  style={{
                    backgroundColor: "#1E69DA",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 16px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  + Create Meeting
                </button>
              </div>
            </div>

            <div className={zoomStyles.zoomMeetingsBody}>
              <div className={zoomStyles.zoomMeetingsCardsCon}>
                {paginatedMeetings?.map((eachMeeting, eachMeetingIndex) => {
                  return (
                    <div key={eachMeetingIndex} className={zoomStyles.card_cont}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", alignItems: "flex-start" }}>
                        <div style={{ backgroundColor: "#EFF5FB", color: "#1E69DA", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                          {type === "internship" ? <MdWorkOutline /> : <BsJournalBookmark />} 
                          <span style={{ textTransform: "capitalize" }}>{type}</span>
                        </div>
                        <strong style={{ fontSize: "15px", lineHeight: "1.4", marginTop: "4px" }}>
                          Title : {eachMeeting?.topic || eachMeeting?.meetingDetails?.topic || eachMeeting?.section || eachMeeting?.internship || "Untitled Meeting"}
                        </strong>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                           {eachMeeting?.section?.title || eachMeeting?.section || "General Topic"} &bull; Zoom Session
                        </div>
                      </div>
                      <button
                        disabled={eachMeeting?.isCompleted}
                        onClick={() => startClass(eachMeeting?._id)}
                        style={{ 
                          width: "100%", 
                          marginTop: "16px",
                          backgroundColor: eachMeeting?.isCompleted ? "#d9d9d9" : "#1E69DA",
                          color: eachMeeting?.isCompleted ? "#00000040" : "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px",
                          fontWeight: "600",
                          cursor: eachMeeting?.isCompleted ? "not-allowed" : "pointer",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          transition: "background-color 0.2s"
                        }}
                      >
                        <BsCameraVideo style={{ fontSize: "16px", marginRight: "8px" }} /> 
                        {eachMeeting?.isCompleted
                          ? "Meeting Ended"
                          : "Start Class"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {allMeetings?.length > 0 && (
              <div className={zoomStyles.pagination}>
                <Pagination
                  current={currentPage}
                  total={allMeetings.length}
                  pageSize={pageSize}
                  onChange={(page, newPageSize) => {
                    setCurrentPage(page);
                    if (newPageSize !== pageSize) {
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                    }
                  }}
                  showSizeChanger={true}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[8, 16, 24, 32, 48]}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} meetings`
                  }
                />
              </div>
            )}
          </div>
        )}

        {joined && (
          <ZoomClient
            meetingNumber="89711345750"
            userName="pk"
            passWord="07Acyi"
          />
        )}
      </div>

      <Modal
        open={createModal}
        onCancel={() => setCreateModal(false)}
        footer={null}
        title={<div className={zoomStyles.modalTitle}>Create A Meeting</div>}
        width="50%"
        style={{ marginTop: "-4rem" }}
      >
        <div className={zoomStyles.ModalContainer}>
          <div className={zoomStyles.itemTitleLabel}>Select Type</div>

          <Space orientation="vertical" size="middle">
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#1E69DA',
                },
              }}
            >
              <Radio.Group
                options={options}
                value={type}
                onChange={(e) => setType(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              />
            </ConfigProvider>
          </Space>

          {/* Internship Select */}
          <div className={zoomStyles.itemTitleLabel}>
            {type == "internship" ? "Select Internship" : "Select Course"}
          </div>
          <Select
            showSearch
            style={{ width: "100%" }}
            value={selectedInternShipValue}
            placeholder={
              type == "internship" ? "Select Internship" : "Select Course"
            }
            optionFilterProp="label"
            filterSort={(a, b) =>
              (a.label ?? "")
                .toLowerCase()
                .localeCompare((b.label ?? "").toLowerCase())
            }
            options={
              type == "internship"
                ? allInternShips?.map((e, i) => ({
                    value: i,
                    label: e.title,
                    key: e._id,
                  }))
                : allCourses?.map((e, i) => ({
                    value: i,
                    label: e.title,
                    key: e._id,
                  }))
            }
            onSelect={(value, option) => {
              // clear section & topic when internship changes
              setSelectedInternShipValue(option.label);
              setSelectedSectionValue(undefined);
              setSelectedTopicValue(undefined);
              getAllSectionsFromInternships(option.key);
              setSelectedInternshipId(option.key);
            }}
          />

          {/* Section Select */}
          <div className={zoomStyles.itemTitleLabel}>Select Section</div>
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder={
              type == "internship"
                ? "Select internship to get sections"
                : "Select course to get sections"
            }
            optionFilterProp="label"
            disabled={!allSections.length}
            value={selectedSectionValue}
            filterSort={(a, b) =>
              (a.label ?? "")
                .toLowerCase()
                .localeCompare((b.label ?? "").toLowerCase())
            }
            options={allSections.map((e, i) => ({
              value: i,
              label: e.title,
              key: e._id,
            }))}
            onSelect={(value, option) => {
              // clear topic when section changes
              setSelectedTopicValue(undefined);
              getAllTopicsFromSections(option.key);
              setSelectedSectionId(option.key);
              setSelectedSectionValue(option.label);
            }}
          />

          {/* Topic Select */}
          <div className={zoomStyles.itemTitleLabel}>Select Topic</div>
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Select section to get topics"
            optionFilterProp="label"
            disabled={!allTopics.length}
            value={selectedTopicValue}
            filterSort={(a, b) =>
              (a.label ?? "")
                .toLowerCase()
                .localeCompare((b.label ?? "").toLowerCase())
            }
            options={allTopics.map((e, i) => ({
              value: i,
              label: e.title,
              key: e._id,
            }))}
            onSelect={(value, option) => {
              setSelectedTopicValue(option.label);
              setSelectedTopicId(option.key);
            }}
          />
        </div>

        <button onClick={createMeetingButton}>Create Meeting</button>
      </Modal>
    </>
  );
};

export default page;
