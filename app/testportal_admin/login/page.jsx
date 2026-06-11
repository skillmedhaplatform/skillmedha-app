"use client";
import React, { useEffect, useState } from "react";
import loginstyles from "./page.module.scss";
import axios from "axios";
import LoginNavbar from "./navbar";
import { message } from "antd";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";
import { getLstorage, setLstorage, deleteLstorageVal } from "@/utils/windowMW";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogout = searchParams.get("logout");
  const [creds, setCreds] = useState({});
  const [view, setView] = useState(true);
  const [checkbox, setbox] = useState(false);
  const token = getLstorage("token");

  useEffect(() => {
    if (isLogout) {
      deleteLstorageVal("token");
      deleteLstorageVal("businessId");
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } else if (token && token !== "null" && token !== "undefined") {
      router.replace("/testportal_admin/myTests");
    }
  }, [token, isLogout, router]);

  const loginUser = async () => {
    const hideLoading = message.loading("Verifying ...");
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_LOGIN_URL}/login`, {
      ...creds,
      type: "college",
    });

    if (data?.token) {
      setLstorage("token", data?.token);
      setLstorage("businessId", data?.businessId);
      router.replace("/testportal_admin/myTests");
      hideLoading();
      message.success("Login successful");
      setCreds({});
    } else {
      hideLoading();
      message.error(data?.err);
    }
    setbox(false);
  };

  return (
    <section className={loginstyles.section}>
      <LoginNavbar />
      <article className={loginstyles.main_cont}>
        <div className={loginstyles.first_div}>
          <p>
            Login to your <span style={{ color: "#27ae60", fontWeight: "bold" }}>SkillMedha</span> account
          </p>
          <div className={loginstyles.input_div}>
            <input
              className={loginstyles.input_text}
              value={creds?.email || ""}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
              placeholder="Email Address*"
              type="text"
            />
            <div className={loginstyles.pass_div}>
              <input
                className={loginstyles.input_pass}
                value={creds?.password || ""}
                onChange={(e) =>
                  setCreds({ ...creds, password: e.target.value })
                }
                placeholder="Password*"
                type={view ? "password" : "text"}
              />
              {view ? (
                <IoEyeOutline onClick={() => setView(!view)} />
              ) : (
                <FaRegEyeSlash onClick={() => setView(!view)} />
              )}
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={checkbox}
                  onChange={() => setbox(!checkbox)}
                />
                Remember Me
              </label>
            </div>
          </div>
          <div className={loginstyles.checkbox_main_div}>
            <button onClick={loginUser}>Log in</button>
          </div>
        </div>
      </article>
    </section>
  );
}
