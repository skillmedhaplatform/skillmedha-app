"use client";
import {
  fetchSubtopicsByTopic,
  fetchPracQuestions,
} from "@/redux/slices/practiceSlice";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { Button, Divider, Result, Spin, Tooltip, message } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { InfoCircleOutlined } from "@ant-design/icons";

export default function NontechnicalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const subtopics = useSelector((s) => s.practice.subtopics);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [loading, setLoading] = useState(false);
  const [loadingSubtopicId, setLoadingSubtopicId] = useState(null);

  // Get specific parameters
  const subjectId = searchParams.get("sub");
  const topicId = searchParams.get("top");

  useEffect(() => {
    if (topicId) {
      setLoading(true);
      dispatch(fetchSubtopicsByTopic(topicId)).finally(() => {
        setLoading(false);
      });
    }
  }, [topicId, dispatch]);

  const handleClick = async (subtopic) => {
    setLoadingSubtopicId(subtopic._id);

    try {
      const result = await dispatch(
        fetchPracQuestions({
          refId: subtopic._id,
          type: "subTopicId",
          userId: studentCreds?._id,
        })
      ).unwrap();

      // Check if questions exist
      if (result && result?.data?.questionsData?.length > 0) {
        router.push(
          `/student/practice-new/test?sub=${subjectId}&top=${topicId}&subT=${subtopic?._id}&t=${subtopic?.title}`
        );
      } else {
        message.warning("No questions available for this subtopic");
      }
    } catch (error) {
      message.error("Failed to fetch questions. Please try again.");
      console.error("Error fetching questions:", error);
    } finally {
      setLoadingSubtopicId(null);
    }
  };

  if (!topicId) {
    return (
      <Result
        icon={<InfoCircleOutlined style={{ color: "#faad14", fontSize: 50 }} />}
        title="No Topic Selected"
        subTitle="Please select a topic from the sidebar to view its subtopics."
      />
    );
  }

  if (loading) {
    return (
      <div>
        <h2>Nontechnical Practice Page</h2>
        <Divider />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "10px" }}>Loading subtopics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StudentPageHeader section="Practice" title="Non-Technical Practice" />
      {subtopics && subtopics.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6 py-2 pb-16">
          {subtopics.map((subtopic, index) => (
            <Tooltip
              key={subtopic._id || index}
              title={subtopic?.title}
              arrow
              placement="top"
            >
              <div className="flex items-start justify-center flex-col rounded-lg p-8 gap-[1.8rem] bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] hover:shadow-lg transition-shadow">
                <p className="text-[20px] font-bold text-[#24A058] max-w-[95%] break-words overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer m-0">
                  {subtopic?.title || subtopic?.key}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-black text-[15px] font-bold m-0">Number of Questions:</p>
                  <p className="text-[#24A058] text-[15px] font-bold m-0">{subtopic?.totalQuestions}</p>
                </div>
                <Button
                  type="primary"
                  style={{ width: "8rem" }}
                  loading={loadingSubtopicId === subtopic._id}
                  onClick={() => handleClick(subtopic)}
                  disabled={loading}
                >
                  Start
                </Button>
              </div>
            </Tooltip>
          ))}
        </div>
      ) : (
        <Result
          status="404"
          title="No Subtopics Found"
          subTitle="Sorry, there are no subtopics available for this topic right now."
        />
      )}
    </div>
  );
}
