"use client";
import { FaCopy, FaInfoCircle } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import groupPasswordStyles from "./styles/group.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";
import { useParams, useRouter } from "next/navigation";
import { updateTest } from "@/redux/slices/testportal_admin/slice/test";

const GroupPassword = () => {
  const updatedata = useSelector((state) => state.tests.value);
  const SingleTest = useSelector((state) => state.tests.test);

  const dispatch = useDispatch();
  const params = useParams();
  const nav = useRouter();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const copyRef = useRef(null);
  const [password, setPassword] = useState("");
  const [copylink, setCopyLink] = useState("");
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    generatePassword();
    if (subdomain) {
      setCopyLink(`https://${subdomain}.synsper.com`);
    }
  }, [subdomain]);

  const copyToClipboard = () => {
    if (copyRef.current) {
      navigator.clipboard.writeText(copyRef.current.innerText);
      message.success("copied link");
    }
  };
  function generatePassword() {
    const id = uuidv4().replace(/-/g, "").toUpperCase();
    const generatedPassword = id.substring(0, 8);
    setPassword(generatedPassword);
    return generatedPassword;
  }


   
  useEffect(() => {
    if (SingleTest?.access?.type === "group") {
      setCopyLink(SingleTest?.access?.url);
    }
  }, [SingleTest]);

  const updateVals ={
    access:{
      type: 'group',
       url: copylink,
      password,
    },
    pricing : SingleTest.pricing,
    honestRespondent: SingleTest.honestRespondent

  }

  return (
    <div className={groupPasswordStyles.container}>
      <div className={groupPasswordStyles.message_cont}>
        <FaInfoCircle size={20} color="#555" style={{ marginRight: '5px' }} />
        <div>
          <strong>
            Test will be available only to respondents who know your subdomain
            and group password
          </strong>
          <p>
            All respondents use the same group password.It is a more convenient
            way of sending and accessing the test.
          </p>
        </div>
      </div>
      <div className={groupPasswordStyles.bottom_message_cont}>
        <FaInfoCircle size={20} color="#555" style={{ marginRight: '5px' }} />
        <div>This access type requires setting a subdomain.</div>
      </div>

      <div className={groupPasswordStyles.copyComp}>
        <div ref={copyRef}>
          <input
            type="text"
            value={subdomain}
            placeholder="Set your subdomain"
            onChange={(e) => {
     
              setSubdomain(e.target.value);
            }}
          />
          <span>{copylink}</span>
        </div>
        <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaCopy size={16} />
          CopyLink
        </button>
      </div>


      <button
        type="submit"
        className={groupPasswordStyles.save_btn}
        onClick={() => {
          const updates = { ...SingleTest };
          delete updates._id;
          dispatch(updateTest({ id: selectedId, updates :updateVals ,}));
        }}
      >
   {   SingleTest?._id?"Update" :"Save"}      </button>
    </div>
  );
};

export default GroupPassword;
