import React from "react";
import { Button, Tooltip } from "antd";
import styles from "./departmentcard.module.scss";
import { 
  ArrowRightOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  TeamOutlined 
} from "@ant-design/icons";
const DepartmentCard = ({ item, onActionClick }) => {
  return (
    <div className={styles.cardCont}>
      <div className={styles.imgCont}>
        <img
          className={styles.branchImage}
          src={item?.branchLogo || "/default-dept.png"}
          alt={item?.title}
        />
      </div>
      <div className={styles.titleCont}>
        <p className={styles.title}>{item?.title || "Department"}</p>
      </div>

      <div className={styles.infoSection}>
        <div className={styles.titleSection}>
          <p style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#1E69DA", marginRight: "8px" }}>
              {item?.students?.length || 0}
            </span>
            <span style={{ color: "#334155", fontWeight: 500 }}>students registered</span>
          </p>
        </div>

        <div className={styles.detailsSection} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <UserOutlined style={{ fontSize: "16px", color: "#334155", width: "24px", marginTop: "3px" }} />
            <strong style={{ width: "60px", color: "#1e293b", flexShrink: 0 }}>HOD</strong>
            <span style={{ color: "#475569", wordBreak: "break-word", flex: 1 }}>{item?.hodName || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <PhoneOutlined style={{ fontSize: "16px", color: "#334155", width: "24px", marginTop: "3px" }} />
            <strong style={{ width: "60px", color: "#1e293b", flexShrink: 0 }}>Phone</strong>
            <span style={{ color: "#475569", wordBreak: "break-word", flex: 1 }}>{item?.mobile || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <MailOutlined style={{ fontSize: "16px", color: "#334155", width: "24px", marginTop: "3px" }} />
            <strong style={{ width: "60px", color: "#1e293b", flexShrink: 0 }}>Email</strong>
            <span style={{ color: "#475569", wordBreak: "break-all", flex: 1 }}>{item?.email || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <TeamOutlined style={{ fontSize: "16px", color: "#334155", width: "24px", marginTop: "3px" }} />
            <strong style={{ width: "60px", color: "#1e293b", flexShrink: 0 }}>SPOC</strong>
            <span style={{ color: "#475569", wordBreak: "break-word", flex: 1 }}>{item?.spoc || "N/A"}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingTop: "12px" }}>
        <Tooltip title="View Students">
          <Button 
            shape="circle" 
            icon={<ArrowRightOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              onActionClick && onActionClick();
            }}
            style={{
              background: "#fff",
              color: "#1E69DA",
              borderColor: "#c7d2fe",
              borderWidth: "2px",
              boxShadow: "none",
              width: "36px",
              height: "36px"
            }}
          />
        </Tooltip>
      </div>

    </div>
  );
};

export default DepartmentCard;
