"use client";
import { FaCopy, FaInfoCircle } from "react-icons/fa";

import React, { useEffect, useRef, useState } from "react";
import PublicStyles from "./styles/public.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Switch from "../utils/switch/switch";
import { message } from "antd";
import { useParams, useRouter } from "next/navigation";

import { v4 as uuidv4 } from "uuid";
import { usePathname } from "next/navigation";
import {
  getOneTests,
  updateTest,
  updateTestValues,
} from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { skillmedhaTestPortal } from "@/utils/universalUtils/urls";

const PublicComponent = () => {
  const currPath = usePathname();
  const updatedata = useSelector((state) => state.tests.value);
  const SingleTest = useSelector((state) => state.tests.test);
  const values = useSelector((state) => state.steps.value);
  // console.log(SingleTest)
  const dispatch = useDispatch();
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];

  useEffect(() => {
    // dispatch(getOneTests({ _id: selectedId }));
    dispatch(setFormValues(SingleTest));
  }, [SingleTest?._id, values?._id]);

  const copyRef = useRef(null);

  const copyToClipboard = () => {
    if (copyRef.current) {
      navigator.clipboard.writeText(copyRef.current.innerText);
      message.success("copied link");
    }
  };

  useEffect(() => {
    if (SingleTest?.access?.type === "public") {
      setattemptsPerRespondent(SingleTest?.access?.attemptsPerRespondent);
    }
  }, [SingleTest]);
  const link = `${window.location.origin}${skillmedhaTestPortal}/?testId=${SingleTest?._id}`;
  const [isSwitchOn, setSwitch] = useState(false);
  const [attemptsPerRespondent, setattemptsPerRespondent] = useState(1);

  const updateVals = {
    access: {
      type: "public",
      url: link,
      attemptsPerRespondent,
    },
    pricing: SingleTest.pricing,
    honestRespondent: SingleTest.honestRespondent,
  };

  const handleUpdate = (val) => {
    dispatch(
      updateTestValues({
        access: {
          ...SingleTest.access,
          type: "public",
          url: link,
        },
      })
    );
    if (SingleTest?._id) {
      const accessData = {
        access: {
          type: "public",
          url: link,
          accesscoderequired: isSwitchOn,
          noOfRetries,
        },
      };

      console.log(accessData);
      dispatch(updateTest({ id: selectedId, updates: accessData }));
    }
  };

  const nav = useRouter();

  return (
    <div className={PublicStyles.container}>
      <div className={PublicStyles.copyComp}>
        <div ref={copyRef}>
          <span>{link}</span>
        </div>
        <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaCopy size={16} />
          CopyLink
        </button>
      </div>
      <p className={PublicStyles.aboutText}>
        <FaInfoCircle size={20} color="#555" style={{ marginRight: '5px' }} />
        Anyone who has a link will be able to take the test
      </p>

      <div className={PublicStyles.respondents_cont}>
        <div className={PublicStyles.attempts_respondents_cont}>
          <h2> Attempts per Respondent *</h2>

          <select
            name=""
            id=""
            value={attemptsPerRespondent}
            onChange={(e) => setattemptsPerRespondent(e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <FaInfoCircle size={20} color="#555" style={{ marginRight: '5px' }} />
          Number of times a respondent can take test
        </div>
      </div>

      <button
        type="submit"
        className={PublicStyles.save_btn}
        onClick={() => {
          const updates = { ...SingleTest };
          delete updates._id;

          dispatch(updateTest({ id: selectedId, updates: updateVals }));
        }}
      >
        {SingleTest?._id ? "Update" : "Save"}
      </button>
    </div>
  );
};

export default PublicComponent;
