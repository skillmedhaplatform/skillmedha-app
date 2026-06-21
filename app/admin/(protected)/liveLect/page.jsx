"use client";
import React, { useEffect, useState } from "react";
// import Home from "../page";
import "./page.css";
import zoomStyles from "./page.module.scss";
import dynamic from "next/dynamic";

const ZoomClient = dynamic(() => import("./utils/join"), {
  ssr: false,
});
import { Input, Modal, Radio, Select, Space } from "antd";
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
        limit: 20,
      })
    );
  }, [type]);

  const createMeetingButton = () => {
    const payload = {
      hostName: userCreds?.userName,
      hostId: userCreds?._id,
      topic: selectedTopicValue,
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
            limit: 20,
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
        limit: 20,
        cursor: null,
        type,
        text,
      })
    );
  };

  return (
    <>
      <div className={zoomStyles.container}>
        {!joined && (
          <div className={zoomStyles.beforeJoinContainer}>
            <div className={zoomStyles.headerContainer}>
              <span>Zoom Meetings</span>
              <button onClick={() => setCreateModal(true)}>
                + Create Meeting
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1.5rem",
              }}
            >
              <Input.Search
                placeholder="Search existing meetings"
                style={{ maxWidth: "50%", width: "40%" }}
                onSearch={(value) => searchMeetingByTopicButton(value)}
              />

              <Space orientation="vertical" size="middle">
                <Radio.Group
                  options={options}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Space>
            </div>

            <div className={zoomStyles.zoomMeetingsBody}>
              <div className={zoomStyles.zoomMeetingsCardsCon}>
                {allMeetings?.map((eachMeeting, eachMeetingIndex) => {
                  return (
                    <div key={eachMeetingIndex} className={zoomStyles.card_cont}>
                      <div>
                        <strong>Title : {eachMeeting?.topic}</strong>
                      </div>
                      <button
                        disabled={eachMeeting?.isCompleted}
                        onClick={() => startClass(eachMeeting?._id)}
                      >
                        {eachMeeting?.isCompleted
                          ? "Meeting Ended"
                          : "Start Class"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
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
            <Radio.Group
              options={options}
              value={type}
              onChange={(e) => setType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            />
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
