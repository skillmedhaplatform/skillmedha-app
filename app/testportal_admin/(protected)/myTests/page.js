"use client";
import React, { useState, useEffect } from "react";
import AllTestsStyles from "./styles/alltests.module.scss";

import { useDispatch, useSelector } from "react-redux";
import AllTestsComp from "./components/allTests";
import { useRouter } from "@bprogress/next/app";
import {
  clearTestVals,
  getTestCategories,
  getTests,
} from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { clearSstorageVals, setSstorage } from "@/utils/universalUtils/windowMW";
import { clearSelectQuestions } from "@/redux/slices/testportal_admin/slice/questions";
import { 
  CarryOutOutlined, 
  SearchOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all"); // "all", "active", "expired"

  const allTests = useSelector((state) => state.tests.value) || [];
  const singleTest = useSelector((state) => state.tests.test);

  const dispatch = useDispatch();
  const nav = useRouter();

  useEffect(() => {
    setLoading(true);
    dispatch(getTests({ cursor: null, limit: 100, nav })).finally(() => {
      setLoading(false);
    });
    dispatch(getTestCategories());
    dispatch(clearSelectQuestions());
  }, [dispatch, nav]);

  setSstorage("questionObj", null);
  setSstorage("quesId", null);

  const isTestExpired = (test) => {
    const expiryDate =
      test?.time?.expiryDates?.accessClosingDate ||
      test?.time?.expiryDates?.testExpirationData;
    if (test?.time?.expiryDates?.expiry && expiryDate) {
      return new Date(expiryDate) < new Date();
    }
    return false;
  };

  // Calculate dynamic tab counts based on allTests
  const totalCount = allTests.length;
  const activeCount = allTests.filter(
    (t) => t.status?.toLowerCase() === "active" && !isTestExpired(t)
  ).length;
  const expiredCount = allTests.filter(
    (t) => t.status?.toLowerCase() === "inactive" || isTestExpired(t)
  ).length;

  // Filter tests based on searchQuery and selectedStatus
  const displayTests = allTests.filter((test) => {
    const matchesSearch =
      searchQuery === "" ||
      test?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test?.category?.some((cat) =>
        cat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const isExpired = isTestExpired(test);
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && test.status?.toLowerCase() === "active" && !isExpired) ||
      (selectedStatus === "expired" && (test.status?.toLowerCase() === "inactive" || isExpired));

    return matchesSearch && matchesStatus;
  });

  return (
    <React.Fragment>
      <div className={AllTestsStyles.container}>
        {/* Redesigned Header Row */}
        <div className={AllTestsStyles.headerRow}>
          <div className={AllTestsStyles.headerLeft}>
            <span className={AllTestsStyles.titleIcon}>
              <CarryOutOutlined />
            </span>
            <h1 className={AllTestsStyles.titleText}>Tests</h1>
          </div>

          <div className={AllTestsStyles.headerCenter}>
            {/* Search Box */}
            <div className={AllTestsStyles.searchWrapper}>
              <SearchOutlined className={AllTestsStyles.searchIcon} />
              <input
                type="text"
                placeholder="Search tests..."
                className={AllTestsStyles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className={AllTestsStyles.filterTabs}>
              <button
                className={`${AllTestsStyles.tab} ${selectedStatus === "all" ? AllTestsStyles.active : ""}`}
                onClick={() => setSelectedStatus("all")}
              >
                All <span className={AllTestsStyles.badge}>{totalCount}</span>
              </button>
              <button
                className={`${AllTestsStyles.tab} ${selectedStatus === "active" ? AllTestsStyles.active : ""}`}
                onClick={() => setSelectedStatus("active")}
              >
                <CheckCircleOutlined /> Active <span className={AllTestsStyles.badge}>{activeCount}</span>
              </button>
              <button
                className={`${AllTestsStyles.tab} ${selectedStatus === "expired" ? AllTestsStyles.active : ""}`}
                onClick={() => setSelectedStatus("expired")}
              >
                <ClockCircleOutlined /> Expired <span className={AllTestsStyles.badge}>{expiredCount}</span>
              </button>
            </div>
          </div>

          <div className={AllTestsStyles.headerRight}>
            <button
              className={AllTestsStyles.addBtn}
              onClick={() => {
                clearSstorageVals();
                dispatch(setFormValues({}));
                dispatch(clearTestVals());
                if (!singleTest?._id) nav.replace("/testportal_admin/myTests/new-test");
              }}
            >
              <PlusOutlined /> Add New Test
            </button>
          </div>
        </div>

        {/* Card Listing Container */}
        <div className={AllTestsStyles.TestCards}>
          <AllTestsComp 
            displayTests={displayTests} 
            loading={loading} 
            onAddNewTest={() => {
              clearSstorageVals();
              dispatch(setFormValues({}));
              dispatch(clearTestVals());
              if (!singleTest?._id) nav.replace("/testportal_admin/myTests/new-test");
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page;
