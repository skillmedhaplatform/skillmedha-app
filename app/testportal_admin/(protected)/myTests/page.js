"use client";
import React, { useState } from "react";
import AllTestsStyles from "./styles/alltests.module.scss";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

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
import CardSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/cardSkeleton";
import { Button } from "antd";

const Page = () => {
  const values = useSelector((state) => state.steps.value);
  const [loading, setLoading] = useState(true);

  const allTests = useSelector((state) => state.tests.value);
  const singleTest = useSelector((state) => state.tests.test);
  const testCategories = useSelector(
    (state) => state.tests.testCategories.value
  );

  const [allTestCates, setAllTestCates] = useState([]);

  useEffect(() => {
    const alltestsCategory = allTests?.map((test) => test?.category[0]);

    if (!allTestCates?.length && alltestsCategory?.length) {
      setAllTestCates(alltestsCategory);
    }
  }, [allTests?.length]);

  const newTest = useSelector((state) => state.tests.newTest.value);

  const [cursor, setCursor] = useState(null);

  const nav = useRouter();

  const [selectedOption1, setSelectedOption1] = useState("");

  const handleChange1 = (event) => {
    setSelectedOption1(event.target.value);
    setLoading(true);
    dispatch(getTests({ status: event.target.value, limit: 20 })).finally(
      () => {
        setLoading(false);
      }
    );
  };

  const [selectedOption2, setSelectedOption2] = useState("");

  const handleChange2 = (event) => {
    setSelectedOption2(event.target.value);
    setLoading(true);

    dispatch(getTests({ category: event.target.value, limit: 20 })).finally(
      () => {
        setLoading(false);
      }
    );
  };

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    dispatch(getTests({ cursor: null, limit: 20, nav })).finally(() => {
      setLoading(false);
    });
    dispatch(getTestCategories());
    dispatch(clearSelectQuestions());
  }, [dispatch, nav]);

  setSstorage("questionObj", null);
  setSstorage("quesId", null);
  return (
    <React.Fragment>
      <div className={AllTestsStyles.container}>
        <div className={AllTestsStyles.headerTitle}>
          <div className={AllTestsStyles.Tests}>Tests</div>
          <div className={AllTestsStyles.TestsFlex}>
            <Button
              type="primary"
              onClick={() => {
                clearSstorageVals();
                dispatch(setFormValues({}));
                dispatch(clearTestVals());
                if (!singleTest?._id) nav.replace("/testportal_admin/myTests/new-test");
              }}
            >
              Add New Test
            </Button>
          </div>
        </div>

        {/* <div className={AllTestsStyles.dropDownCon}>
          <button>
            <select value={selectedOption1} onChange={handleChange1}>
              <option value=""> Status </option>
              <option value="active">Active</option>
              <option value="inprogress">Inprogress</option>
              <option value="inactive">Inactive</option>
            </select>
          </button>

          <button>
            <select value={selectedOption2} onChange={handleChange2}>
              <option value=""> All Categories </option>
              {allTestCates?.length &&
                allTestCates?.map((e) => (
                  <option value={e?.name} key={e?.name}>
                    {e?.name}
                  </option>
                ))}
            </select>
          </button>
        </div> */}

        <div className={AllTestsStyles.TestCards}>
          {loading ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : allTests?.length > 0 ? (
            <AllTestsComp />
          ) : (
            <div className={AllTestsStyles.noTestsMessage}>
              {allTests?.length <= 0 && !selectedOption2 && !selectedOption1
                ? "No tests Added."
                : "No tests with selected filter"}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page;
