"use client";
import React from "react";
import TimeStyles from "../styles/tdd.module.scss";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateTestValues } from "@/redux/slices/testportal_admin/slice/test";

export default function TimeDD({
  open,
  setIsopen,
  name,
  lable,
  setVal,
  val,
  keyName,
}) {
  const SingleTest = useSelector((state) => state.tests.test);
  const dispatch = useDispatch();
  const formatTimeValue = (value) => {
    return value.trim().replace(/\s+/g, "").padStart(2, "0");
  };

  return (
    <div className={TimeStyles.timeCon} onClick={() => setIsopen(false)}>
      <div className={TimeStyles.timeFlex}>
        <div className={TimeStyles.TimeParent}>
          <div className={TimeStyles.tp}>{name.split(":")[0]}</div>
          {Array.from({ length: 24 }, (_, i) => i).map((hour, i) => {
            const hrsCon = val?.val1?.split(" ")[1]
              ? val?.val1?.split(" ")[1]
              : val?.val1;

            return (
              <div
                key={i}
                className={`${TimeStyles.TimeDiv} ${
                  hrsCon === hour ? TimeStyles.activeTime : null
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  const hourValue = formatTimeValue(e.target.innerText);
                  setVal({ ...val, val1: hourValue });
                  dispatch(
                    updateTestValues({
                      ...SingleTest?.time,
                      testDuration: {
                        ...SingleTest?.time?.testDuration,
                        [keyName]: {
                          val1: val?.val1?.trim(),
                          val2: val?.val2?.trim(),
                        },
                      },
                    })
                  );
                }}
              >
                {hour.toString()?.length > 1 ? hour : `0 ${hour}`}
              </div>
            );
          })}
        </div>

        <div className={TimeStyles.TimeParent}>
          <div className={TimeStyles.tp}>{name.split(":")[1]}</div>

          {Array.from({ length: 60 }, (_, i) => i).map((min, i) => {
            const minsCon = val?.val2?.split(" ")[1]
              ? val?.val2?.split(" ")[1]
              : val?.val2;

            return (
              <div
                key={i}
                onClick={(e) => {
                  const minValue = formatTimeValue(e.target.innerText);
                  setVal({ ...val, val2: minValue });
                  dispatch(
                    updateTestValues({
                      ...SingleTest?.time,
                      testDuration: {
                        ...SingleTest?.time?.testDuration,
                        [keyName]: {
                          val1: val?.val1?.trim(),
                          val2: val?.val2?.trim(),
                        },
                      },
                    })
                  );
                }}
                className={`${minsCon == min ? TimeStyles.activeMinute : null}`}
              >
                {min.toString()?.length > 1 ? min : `0 ${min}`}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
