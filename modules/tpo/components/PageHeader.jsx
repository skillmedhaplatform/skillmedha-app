import React from "react";
import { Button } from "antd";
import styles from "./styles/pageheader.module.scss";

import { BsX, BsPlus, BsStar } from "react-icons/bs";

const PageHeader = ({
  breadcrumb,
  title,
  subtitle,
  actionText,
  onActionClick,
  tabs,
  activeTabKey,
  onTabChange,
  showGreeting,
  userName,
}) => {
  const [currentDate, setCurrentDate] = React.useState("");
  const [greetingText, setGreetingText] = React.useState("Good Afternoon");

  React.useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreetingText("Good Morning");
    else if (currentHour < 18) setGreetingText("Good Afternoon");
    else setGreetingText("Good Evening");
  }, []);

  return (
    <div className={styles.headerSection}>
      <div className={styles.bgIcons}>
        <BsX className={styles.icon1} />
        <BsPlus className={styles.icon2} />
        <BsStar className={styles.icon3} />
        <BsX className={styles.icon4} />
      </div>

      <div className={styles.headerTop}>
        <div className={styles.headerLeft} style={showGreeting ? { width: '100%', gap: '0.4rem' } : {}}>
          {breadcrumb && <span className={styles.breadcrumb}>{breadcrumb}</span>}
          {showGreeting ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.2' }}>Hi {userName},</h1>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#a0aec0', fontWeight: '500' }}>{currentDate}</p>
              </div>
              <p className={styles.subtitle} style={{ fontSize: '1.3rem', color: '#e2e8f0', marginTop: '0.8rem', lineHeight: '1.4' }}>
                {greetingText}! Here’s an overview of today’s placement activities.
              </p>
            </>
          ) : (
            <>
              {title && <h1>{title}</h1>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </>
          )}
        </div>
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
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6BA8ED] rounded-t-md" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
