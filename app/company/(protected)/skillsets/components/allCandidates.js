"use client";

import { DatePicker, Input, Select, Switch, Spin } from "antd";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import StudentCard from "./candidateCard";
import { useDispatch } from "react-redux";
import { fetchAllStudents } from "@/redux/slices/company/skillMedhaData";
import styles from "../styles/candidates.module.scss";
import dayjs from "dayjs";

const EDU_TYPES = [
  "10th / Secondary Education",
  "Senior Secondary / Diploma / ITI",
  "Degree",
  "Masters / M.Tech",
  "PhD",
];

export default function AllCandidates() {
  const {
    value: colleges = [],
    status: collegeStatus = "pending",
    error: collegeError,
  } = useSelector((s) => s.skillmedha?.partnerColleges ?? {});

  const {
    allStudents = [],
    status: studentsStatus = "pending",
    error: studentsError,
    hasMore,
    currentPage: reduxCurrentPage,
    totalCount,
  } = useSelector((s) => s.skillmedha?.students ?? {});

  const dispatch = useDispatch();

  // Local state for pagination control
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const observerRef = useRef();
  const isRequestInProgress = useRef(false);

  const [filter, setFilter] = useState({
    skill: [],
    college: "",
    degree: [],
    yearOfPassing: [],
    grade: [],
    hasInternship: false,
    hasResume: false,
  });

  // Debounce function to prevent rapid successive calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Load more data function with proper guards
  const loadMoreStudents = useCallback(
    async (page = 1, isNewFilter = false) => {
      // Prevent multiple simultaneous requests
      if (isRequestInProgress.current) {
        console.log("Request already in progress, skipping...");
        return;
      }

      // Throttle requests to prevent rapid calls
      const now = Date.now();
      if (now - lastRequestTime < 1000) {
        // 1 second throttle
        console.log("Request throttled, too soon...");
        return;
      }

      // Don't load more if we've reached the end
      if (!isNewFilter && !hasMore) {
        console.log("No more data available");
        return;
      }

      isRequestInProgress.current = true;
      setLoading(true);
      setLastRequestTime(now);

      try {
        await dispatch(
          fetchAllStudents({
            ...filter,
            page,
            limit: 10,
            isNewFilter,
          })
        ).unwrap();
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setLoading(false);
        isRequestInProgress.current = false;
      }
    },
    [dispatch, filter, hasMore, lastRequestTime]
  );

  // Debounced version of loadMoreStudents
  const debouncedLoadMore = useCallback(
    debounce((page, isNewFilter) => {
      loadMoreStudents(page, isNewFilter);
    }, 300),
    [loadMoreStudents]
  );

  // Initial load and filter changes
  useEffect(() => {
    // Reset request controls when filters change
    isRequestInProgress.current = false;
    setLastRequestTime(0);

    loadMoreStudents(1, true);
  }, [JSON.stringify(filter)]); // Use JSON.stringify to properly detect filter changes

  // Improved Intersection Observer
  const lastStudentElementRef = useCallback(
    (node) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Don't set up observer if loading or no more data
      if (loading || !hasMore || isRequestInProgress.current) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          // Only trigger if:
          // 1. Element is intersecting
          // 2. Has more data
          // 3. Not currently loading
          // 4. Not at the very bottom (add small buffer)
          if (
            entry.isIntersecting &&
            hasMore &&
            !loading &&
            !isRequestInProgress.current &&
            entry.intersectionRatio > 0.1
          ) {
            console.log("Loading next page:", reduxCurrentPage + 1);
            debouncedLoadMore(reduxCurrentPage + 1, false);
          }
        },
        {
          threshold: [0.1, 0.5], // Multiple thresholds for better control
          rootMargin: "50px 0px", // Reduced margin to prevent premature loading
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, reduxCurrentPage, debouncedLoadMore]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Clear all filters function
  const clearAllFilters = () => {
    setFilter({
      skill: [],
      college: "",
      degree: [],
      yearOfPassing: [],
      grade: [],
      hasInternship: false,
      hasResume: false,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={`${styles.filterHead} ${styles.flex_sb}`}>
          <p>All Filters</p>
          <p
            onClick={clearAllFilters}
            style={{
              cursor: "pointer",
              color: "#25A3A6",
              fontSize: "0.875rem",
            }}
          >
            Clear all
          </p>
        </div>
        <div className={styles.filterItem}>
          <div>
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Skills"
              value={filter.skill}
              onChange={(e) => setFilter((p) => ({ ...p, skill: e }))}
              tokenSeparators={[","]}
              dropdownStyle={{ display: "none" }}
            />
          </div>
          <div>
            <Select
              style={{ width: "100%" }}
              options={
                colleges?.map((e) => ({ label: e?.orgName, value: e?._id })) ||
                []
              }
              placeholder="Colleges"
              maxTagPlaceholder={(omittedValues) =>
                omittedValues.length > 0 ? `${omittedValues}` : "Colleges"
              }
              title="College"
              allowClear
              value={colleges?.find((e) => e._id == filter.college)?.orgName}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, college: e }));
              }}
            />
          </div>
          <div>
            <Select
              style={{ width: "100%" }}
              options={EDU_TYPES.map((e) => ({ label: e, value: e }))}
              placeholder="Degree"
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, degree: [e] }));
              }}
              allowClear
            />
          </div>
          <div>
            <DatePicker
              style={{ width: "100%" }}
              picker="year"
              onChange={(date, dateStr) => {
                setFilter((prev) => ({ ...prev, yearOfPassing: dateStr }));
              }}
            />
          </div>
          <div>
            <Input
              style={{ width: "100%" }}
              allowClear
              type="number"
              title="CGPA"
              placeholder="CGPA (0-10)"
              max={"10"}
              value={filter.grade || ""}
              onChange={(e) => {
                let val = e.target.value;
                if (parseInt(val) > 10) {
                  val = 10;
                }
                setFilter((p) => ({ ...p, grade: val }));
              }}
            />
          </div>
          <div>
            Has Internship{" "}
            <Switch
              checked={filter.hasInternship}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, hasInternship: e }));
              }}
            />
          </div>
          <div>
            Has Resume{" "}
            <Switch
              checked={filter.hasResume}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, hasResume: e }));
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        {/* Results count */}
        <div
          style={{
            marginBottom: "1rem",
            color: "#666",
            fontSize: "0.875rem",
          }}
        >
          Showing {allStudents.length} of {totalCount} candidates
          {loading && " (Loading...)"}
        </div>

        {/* Student Cards */}
        {allStudents?.map((student, index) => {
          // Only add observer ref to the element that's 3 items from the end
          // This prevents the observer from triggering when user is at the very bottom
          const isNearEnd = allStudents.length === index + 3;

          if (isNearEnd && hasMore && !loading) {
            return (
              <div ref={lastStudentElementRef} key={student?._id}>
                <StudentCard student={student} />
              </div>
            );
          } else {
            return <StudentCard student={student} key={student?._id} />;
          }
        })}

        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem",
              color: "#25A3A6",
            }}
          >
            <Spin size="large" />
          </div>
        )}

        {/* No more data indicator */}
        {!hasMore && allStudents.length > 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#666",
              fontSize: "0.875rem",
            }}
          >
            No more candidates to load
          </div>
        )}

        {/* No results found */}
        {!loading &&
          allStudents.length === 0 &&
          studentsStatus !== "loading" && (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#666",
                fontSize: "0.875rem",
              }}
            >
              No candidates found matching your criteria
            </div>
          )}
      </div>
    </div>
  );
}
