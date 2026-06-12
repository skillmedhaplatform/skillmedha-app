import React from "react";
import { Button } from "antd";
import styles from "./styles/pageheader.module.scss";
import bannerBase from "@/components/shared/styles/bannerBase.module.scss";

const PageHeader = ({
  breadcrumb,
  title,
  subtitle,
  actionText,
  onActionClick,
  tabs,
  activeTabKey,
  onTabChange,
}) => {
  return (
    <div className={`${bannerBase.bannerBase} ${styles.headerSection}`}>
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          {breadcrumb && <span className={styles.breadcrumb}>{breadcrumb}</span>}
          {title && <h1>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actionText && onActionClick && (
          <Button className={styles.addBtn} onClick={onActionClick}>
            {actionText}
          </Button>
        )}
      </div>

      {tabs && tabs.length > 0 && (
        <div className={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTabKey === tab.key;
            return (
              <div
                key={tab.key}
                className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                onClick={() => onTabChange && onTabChange(tab.key)}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#24a058] rounded-t-md" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
