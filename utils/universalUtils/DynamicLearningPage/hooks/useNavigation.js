"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { updateLastAccessed } from "@/redux/slices/internship";
import _ from "lodash";

/**
 * useNavigation
 * Manages section/topic selection, prev/next, and position restoration.
 */
export const useNavigation = ({
  mounted,
  selectedInternshipData,
  lastAccessedSection,
  lastAccessedTopic,
  studentCreds,
  internshipId,
  orgId,
  moduleType,
  getOneTopic,
}) => {
  const dispatch    = useDispatch();
  const params      = useSearchParams();

  const [activeKey,            setActiveKey]            = useState(null);
  const [openSectionKeys,      setOpenSectionKeys]      = useState([]);
  const [selectedTopicIndex,   setSelectedTopicIndex]   = useState(null);
  const [hasRestoredPosition,  setHasRestoredPosition]  = useState(false);
  const [isNavigating,         startNavTransition]       = useTransition();

  const totalSections = selectedInternshipData?.sections?.length ?? 0;

  // ── Restore last-accessed position ───────────────────────────────────────
  useEffect(() => {
    if (!mounted || !selectedInternshipData?.sections || hasRestoredPosition) return;

    const sectionParam = params.get("section");
    const topicParam   = params.get("topic");

    if (sectionParam !== null && topicParam !== null) {
      const si = parseInt(sectionParam, 10);
      const ti = parseInt(topicParam, 10);
      if (!isNaN(si) && !isNaN(ti)) {
        setActiveKey(si);
        setOpenSectionKeys([String(si)]);
        setSelectedTopicIndex(ti);
        setHasRestoredPosition(true);
        return;
      }
    }

    if (
      lastAccessedSection !== null &&
      lastAccessedTopic   !== null &&
      lastAccessedSection < selectedInternshipData.sections.length
    ) {
      setActiveKey(lastAccessedSection);
      setOpenSectionKeys([String(lastAccessedSection)]);
      setSelectedTopicIndex(lastAccessedTopic);
      setHasRestoredPosition(true);
      return;
    }

    setActiveKey(0);
    setOpenSectionKeys(["0"]);
    setSelectedTopicIndex(0);
    setHasRestoredPosition(true);
  }, [mounted, selectedInternshipData, lastAccessedSection, lastAccessedTopic, hasRestoredPosition, params]);

  // ── Track navigation (debounced) ─────────────────────────────────────────
  useEffect(() => {
    if (
      !mounted ||
      !studentCreds?._id ||
      !internshipId ||
      !selectedInternshipData?._id ||
      activeKey === null ||
      selectedTopicIndex === null
    ) return;

    const debounced = _.debounce(() => {
      dispatch(
        updateLastAccessed({
          userId:       studentCreds._id,
          itemId:       internshipId,
          itemType:     moduleType,
          sectionIndex: activeKey,
          topicIndex:   selectedTopicIndex,
          orgId,
        })
      );
    }, 2000);

    debounced();
    return () => debounced.cancel();
  }, [activeKey, selectedTopicIndex, mounted, studentCreds, internshipId, orgId, selectedInternshipData, dispatch, moduleType]);

  // ── Next / Prev ───────────────────────────────────────────────────────────
  const currentSection = selectedInternshipData?.sections?.[activeKey];

  const handleNext = useCallback(() => {
    startNavTransition(() => {
      const topicCount = currentSection?.topics?.length ?? 0;
      if (selectedTopicIndex < topicCount - 1) {
        setSelectedTopicIndex((i) => i + 1);
      } else if (activeKey < totalSections - 1) {
        setActiveKey((k) => k + 1);
        setSelectedTopicIndex(0);
      }
    });
  }, [currentSection, selectedTopicIndex, activeKey, totalSections, startNavTransition]);

  const handlePrev = useCallback(() => {
    startNavTransition(() => {
      if (selectedTopicIndex > 0) {
        setSelectedTopicIndex((i) => i - 1);
      } else if (activeKey > 0) {
        const prevCount = selectedInternshipData?.sections?.[activeKey - 1]?.topics?.length ?? 0;
        setActiveKey((k) => k - 1);
        setSelectedTopicIndex(prevCount - 1);
      }
    });
  }, [selectedTopicIndex, activeKey, selectedInternshipData, startNavTransition]);

  // ── Section collapse handler ──────────────────────────────────────────────
  const handleSectionChange = useCallback((keys) => {
    const nextKeys = Array.isArray(keys)
      ? keys.map(String)
      : keys ? [String(keys)] : [];

    const newlyOpened = nextKeys.find((k) => !openSectionKeys.includes(k));
    setOpenSectionKeys(nextKeys);

    if (newlyOpened !== undefined) {
      const secIndex = Number(newlyOpened);
      const sec = selectedInternshipData?.sections?.[secIndex];
      if (sec?.topics?.[0]) {
        getOneTopic({ id: sec.topics[0]._id });
        setActiveKey(secIndex);
        setSelectedTopicIndex(0);
      }
      setTimeout(() => {
        const el = document.getElementById(`section-container-${secIndex}`);
        if (el) {
          const card = el.closest(".ant-collapse-item");
          (card || el).scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
    }

    if (activeKey !== null && !nextKeys.includes(String(activeKey))) {
      setActiveKey(null);
    }
  }, [openSectionKeys, activeKey, selectedInternshipData, getOneTopic]);

  return {
    activeKey,
    setActiveKey,
    openSectionKeys,
    setOpenSectionKeys,
    selectedTopicIndex,
    setSelectedTopicIndex,
    isNavigating,
    handleNext,
    handlePrev,
    handleSectionChange,
  };
};
