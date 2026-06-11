"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { internShipUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";

// ── Module-level selectors (stable references, prevent Redux warnings) ────────
const selectSingleInternship = (state) => state.internship.singleInternship;
const selectStudentCreds     = (state) => state.student.student?.data;
const selectLastSection      = (state) => state.internship.lastAccessedSection;
const selectLastTopic        = (state) => state.internship.lastAccessedTopic;
const selectCompletedIds     = (state) => state.internship.completedTopicIds;
const selectTotalProgress    = (state) => state.internship.serverTotalProgress;
const selectCompletedCount   = (state) => state.internship.serverCompletedCount;
const selectTotalCount       = (state) => state.internship.serverTotalCount;

import { useDispatch } from "react-redux";
import { getOneInternsip } from "@/redux/slices/internship";

/**
 * useLearningData
 * Provides all Redux data + stable derived values for the learning page.
 * Also exposes `getOneTopic` for fetching per-topic detail.
 */
export const useLearningData = (setTopicDetails) => {
  const params = useSearchParams();

  const selectedInternshipData = useSelector(selectSingleInternship);
  const studentCreds           = useSelector(selectStudentCreds);
  const lastAccessedSection    = useSelector(selectLastSection);
  const lastAccessedTopic      = useSelector(selectLastTopic);
  const serverCompletedTopicIds = useSelector(selectCompletedIds);
  const serverTotalProgress    = useSelector(selectTotalProgress);
  const serverCompletedCount   = useSelector(selectCompletedCount);
  const serverTotalCount       = useSelector(selectTotalCount);

  const internshipId  = params.get("id")    || "";
  const orgId         = params.get("orgId") || "";
  const selectedTitle = params.get("title") || "";

  const dispatch = useDispatch();

  // Fetch all internship data on mount when credentials are ready
  useEffect(() => {
    if (studentCreds?._id && internshipId && orgId) {
      dispatch(getOneInternsip({ id: internshipId, orgId, userId: studentCreds._id }));
    }
  }, [studentCreds?._id, internshipId, orgId, dispatch]);

  const getOneTopic = async (args) => {
    try {
      const { data } = await axios.get(
        `${internShipUrl}/getOneTopic/${args?.id}?userId=${studentCreds?._id}`,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      setTopicDetails({ ...data?.data, progress: data?.progress?.progress });
    } catch (error) {
      console.error("getOneTopic error:", error);
    }
  };

  return {
    selectedInternshipData,
    studentCreds,
    lastAccessedSection,
    lastAccessedTopic,
    serverCompletedTopicIds,
    serverTotalProgress,
    serverCompletedCount,
    serverTotalCount,
    internshipId,
    orgId,
    selectedTitle,
    getOneTopic,
  };
};
