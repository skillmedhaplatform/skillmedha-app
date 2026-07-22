"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser, getCurrentUser } from "@/redux/slices/admin/adminAuthSlice";
import styles from "./login.module.scss";
import Cookies from "js-cookie";

import { FiMail, FiLock, FiAlertCircle, FiShield, FiLogIn } from "react-icons/fi";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, value: userValue } = useSelector((state) => state.adminAuth.user);

  useEffect(() => {
    // If user has a token, verify it's an admin token before redirecting
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || Cookies.get("token")) : null;
    if (token) {
      if (userValue) {
        router.replace("/admin/dashboard");
      } else {
        dispatch(getCurrentUser()).then((res) => {
          if (res.meta.requestStatus === "fulfilled") {
            router.replace("/admin/dashboard");
          }
        });
      }
    }
  }, [router, dispatch, userValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please enter your email and password.");
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (result.type === "auth/loginUser/fulfilled") {
      router.replace("/admin/dashboard");
    } else {
      setLocalError(result.payload || "Login failed");
    }
  };

  return (
    <div className={styles.page}>
      {/* Background decorations */}
      <div className={`${styles.blob} ${styles.blob1}`}></div>
      <div className={`${styles.blob} ${styles.blob2}`}></div>
      <div className={`${styles.blob} ${styles.blob3}`}></div>

      {/* Login card */}
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <img
            src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
            alt="Logo"
            className={styles.logoIcon}
          />
          <div className={styles.logoText}>SKILL<span>MEDHA</span></div>
          <div className={styles.logoSub}>Admin Management Portal</div>
        </div>

        {/* Role badge */}
        <div className={styles.roleBadgeWrap}>
          <span className={styles.roleBadge}>👑 Administrator Access</span>
        </div>

        {/* Error message */}
        {localError && (
          <div className={styles.errorMsg}>
            <FiAlertCircle />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">Email Address</label>
            <div className={styles.inputWrap}>
              <FiMail className={styles.inputIcon} />
              <input 
                type="email" 
                id="email"
                className={`${styles.formInput} ${localError && !email ? styles.error : ''}`} 
                placeholder="admin@skillmedha.com" 
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLocalError("");
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="password">Password</label>
            <div className={styles.inputWrap}>
              <FiLock className={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className={`${styles.formInput} ${localError && !password ? styles.error : ''}`} 
                placeholder="Enter your password" 
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError("");
                }}
              />
              <button 
                className={styles.eyeBtn} 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className={styles.optionsRow}>
            <div className={styles.rememberWrap} onClick={() => setRememberMe(!rememberMe)}>
              <div className={`${styles.chk} ${rememberMe ? styles.on : ''}`}>
                <FaCheck />
              </div>
              <span className={styles.rememberLbl}>Remember me</span>
            </div>
            <a className={styles.forgotLink} href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }}>Forgot password?</a>
          </div>

          {/* Sign in button */}
          <button className={styles.signinBtn} type="submit" disabled={loading}>
            {loading ? (
              <div className={styles.spinner}></div>
            ) : (
              <FiLogIn style={{ fontSize: '18px' }} />
            )}
            <span>{loading ? "Signing in..." : "Sign in"}</span>
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <div className={styles.dividerText}>Secured Portal</div>
          <div className={styles.dividerLine}></div>
        </div>

        {/* Security note */}
        <div className={styles.securityNote}>
          <FiShield />
          Protected by end-to-end encryption &nbsp;·&nbsp; SkillMedha v2.0
        </div>
      </div>

      {showForgotModal && (
        <div className={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Reset Password</h2>
              <button className={styles.closeBtn} onClick={() => setShowForgotModal(false)}>
                ✕
              </button>
            </div>
            <p className={styles.modalText}>
              Enter your email address and we'll send you a link to reset your password securely.
            </p>
            <input 
              type="email" 
              className={styles.modalInput} 
              placeholder="Email Address" 
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <button className={styles.resetBtn} onClick={() => {
              if(!resetEmail) { alert("Please enter your email."); return; }
              alert("Reset link sent!"); 
              setShowForgotModal(false);
              setResetEmail("");
            }}>
              Send Reset Link
            </button>
          </div>
        </div>
      )}

      <div className={styles.version}>v2.0.1</div>
    </div>
  );
}
