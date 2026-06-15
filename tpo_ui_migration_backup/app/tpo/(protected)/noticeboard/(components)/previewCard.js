import React from "react";
import { Button } from "antd";
import styles from "../notice.module.scss";

export default function NoticePreviewCard({ data, onEdit }) {
  const { title, startDate, message, priority, attachment } = data || {};

  return (
    <div className={styles.previewCard}>
      <div className={styles.cardHeader}>
        <p className={styles.headTitle}>Notice Preview</p>
        <div className={styles.btnCont}>
          <Button
            onClick={onEdit}
            type="primary"
            style={{ alignSelf: "flex-end" }}
          >
            Edit
          </Button>
          {/* <Button onClick={onClose} type="text">
            ❌
          </Button> */}
        </div>
      </div>
      <h3 className={styles.catdTitle}>{title}</h3>
      <p>
        {startDate?.split(" ")[0]} | {startDate?.split(" ")[1]}
      </p>
      <p className={styles.message}>
        <strong>Message:</strong> {message}
      </p>

      {attachment && (
        <div>
          <strong>{attachment.name}</strong>{" "}
          <DownloadOutlined
            style={{ cursor: "pointer" }}
            onClick={() => window.open(attachment.url, "_blank")}
          />
        </div>
      )}

      {priority && (
        <p>
          <strong>Priority :</strong>{" "}
          <strong style={{ color: priority === "High" ? "red" : "#24A058" }}>
            {priority}
          </strong>
        </p>
      )}
    </div>
  );
}
