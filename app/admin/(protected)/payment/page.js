"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveRazorpayCredentials,
  fetchRazorpayCredentials,
} from "@/redux/slices/admin/adminRazorpaySlice";
import styles from "./RazorpaySettingsForm.module.scss";

export default function RazorpaySettingsForm() {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const dispatch = useDispatch();
  const {
    loading = false,
    error = null,
    credentials = null,
  } = useSelector((state) => state.adminRazorpay || {});

  // Fetch existing credentials on mount
  useEffect(() => {
    dispatch(fetchRazorpayCredentials())
      .unwrap()
      .then((data) => {
        if (data.keyId) {
          setKeyId(data.keyId);
          setKeySecret(data.keySecret);
          setIsSaved(true);
          setIsEditing(false);
        }
      })
      .catch(() => {
        // No credentials found, allow editing
        setIsEditing(true);
      });
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!keyId.trim() || !keySecret.trim()) {
      alert("Both Key ID and Key Secret are required");
      return;
    }

    try {
      await dispatch(saveRazorpayCredentials({ keyId, keySecret })).unwrap();
      alert("Razorpay credentials saved successfully");
      setIsSaved(true);
      setIsEditing(false);
    } catch (error) {
      alert(error || "Failed to save credentials");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Restore previous values if saved
    if (isSaved && credentials) {
      setKeyId(credentials.keyId || "");
      setKeySecret(credentials.keySecret || "");
    }
    setIsEditing(false);
  };

  const maskSecret = (secret) => {
    if (!secret || secret.length <= 8) return "••••••••••••••••";
    return (
      secret.substring(0, 4) + "••••••••" + secret.substring(secret.length - 4)
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Razorpay Settings</h2>
        {isSaved && !isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className={styles.editButton}
          >
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="keyId" className={styles.label}>
            Razorpay Key ID
          </label>
          <input
            type="text"
            id="keyId"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            className={`${styles.input} ${
              !isEditing ? styles.inputDisabled : ""
            }`}
            placeholder="rzp_test_xxxxxxxxxxxxx"
            autoComplete="off"
            disabled={!isEditing}
            readOnly={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="keySecret" className={styles.label}>
            Razorpay Key Secret
          </label>
          <input
            type={isEditing ? "password" : "text"}
            id="keySecret"
            value={isEditing ? keySecret : maskSecret(keySecret)}
            onChange={(e) => setKeySecret(e.target.value)}
            className={`${styles.input} ${
              !isEditing ? styles.inputDisabled : ""
            }`}
            placeholder="Enter your key secret"
            autoComplete="off"
            disabled={!isEditing}
            readOnly={!isEditing}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {isEditing && (
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary} ${
                loading ? styles.buttonDisabled : ""
              }`}
            >
              {loading
                ? "Saving..."
                : isSaved
                ? "Update Credentials"
                : "Save Credentials"}
            </button>

            {isSaved && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
