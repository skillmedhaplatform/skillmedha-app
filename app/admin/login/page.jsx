"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/redux/slices/admin/adminAuthSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./login.module.scss";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error } = useSelector((state) => state.adminAuth.user);

  useEffect(() => {
    // If user is already logged in, redirect
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || Cookies.get("token")) : null;
    if (token) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please enter email and password");
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (result.type === "auth/loginUser/fulfilled") {
      router.replace("/admin/dashboard");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.logoContainer}>
            <img
              src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
              alt="Logo"
              className={styles.icon}
            />
            <div className={styles.logoText}>
              S K I L L <span>M E D H A</span>
            </div>
          </div>

          {/* <div className={styles.header}>
            <h1 className={styles.title}>Admin Login</h1>
            <p className={styles.subtitle}>Welcome back! Please enter your details.</p>
          </div> */}

          {(error || localError) && (
            <div className={styles.error}>
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.group}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="admin@skillmedha.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
