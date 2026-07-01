"use client";
import React from "react";
import sideBarStyles from "@/mainLayout/styles/sidebar.module.scss";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Dropdown, Skeleton } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { changeCollapse } from "@/redux/slices/testportal_admin/slice/sideBar";
import { sideBarTitles } from "../sideBarTitles";

const SideBar = ({ activeView, setView }) => {
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const basePath = "/testportal_admin";
  
  const isCollapsed = useSelector((s) => s.sideBar.collapse);

  const userDetailsVal = useSelector((state) => state.tests?.UserDetails?.value);
  const USER_DETAILS = userDetailsVal?.data || userDetailsVal;
  const isLoadingUser = useSelector((state) => state.tests?.UserDetails?.status === "pending");

  const name = USER_DETAILS?.name || USER_DETAILS?.userName || "Admin User";
  const email = USER_DETAILS?.email || "";
  const firstLetter = name ? name.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("businessId");
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = "/login?portal=tpo";
  };

  const menuItems = [
    {
      type: 'group',
      label: isCollapsed ? '' : <span style={{ fontWeight: '800', color: '#1e293b' }}>TEST PORTAL</span>,
      children: sideBarTitles.map((item) => ({
        key: item.path,
        icon: item.icon,
        label: item.name,
      }))
    }
  ];

  const getSelectedKeys = () => {
    const pathToCheck = activeView || pathName;
    const match = sideBarTitles.find(
      (t) => t.path && pathToCheck.includes(t.path)
    );
    if (match) return [match.path];
    return [];
  };

  const handleMenuClick = ({ key }) => {
    const matchedItem = sideBarTitles.find((item) => item.path === key);
    if (matchedItem && matchedItem.isExternal) {
      router.replace(matchedItem.path);
      return;
    }
    if (typeof setView === "function") {
      setView(key);
      return;
    }
    router.replace(`${basePath}/${key}`);
  };

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      style: { cursor: "default", backgroundColor: "transparent" },
      label: (
        <div style={{ padding: "4px 0", color: "#333" }}>
          <strong style={{ display: "block", fontSize: "14px", lineHeight: "1.2" }}>
            {name}
          </strong>
          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {email}
          </span>
        </div>
      )
    },
    { type: "divider" },
    {
      key: "logout",
      label: <span style={{ color: "#ff4d4f" }}>Logout</span>,
      onClick: handleLogout
    }
  ];

  return (
    <section
      className={`${sideBarStyles.sideBarContainer} ${isCollapsed ? sideBarStyles.collapsedSidebar : sideBarStyles.expandedSidebar}`}
    >
      <div className={sideBarStyles.logoContainer}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="Synsper Logo"
          onClick={() => router.replace(`${basePath}/myTests`)}
          style={{ cursor: "pointer" }}
        />
        {!isCollapsed && (
          <div
            className={sideBarStyles.logoText}
            onClick={() => router.replace(`${basePath}/myTests`)}
            style={{ flex: 1, paddingRight: '8px', cursor: "pointer" }}
          >
            S K I L L <span> M E D H A</span>
          </div>
        )}
        <div
          onClick={() => dispatch(changeCollapse(!isCollapsed))}
          style={{ cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: isCollapsed ? '0' : '24px', marginLeft: isCollapsed ? '0' : 'auto' }}
        >
          {isCollapsed ? <MenuUnfoldOutlined style={{ fontSize: '30px' }} /> : <MenuFoldOutlined style={{ fontSize: '24px' }} />}
        </div>
      </div>

      <div className={sideBarStyles.scrolltabs}>
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={isCollapsed}
          className={sideBarStyles.styledAntMenu}
          selectedKeys={getSelectedKeys()}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </div>

      <div className={sideBarStyles.bottom}>
        <div style={{ padding: isCollapsed ? "0" : "0 1rem", display: "flex", justifyContent: "center" }}>
          {isLoadingUser ? (
            <div className={sideBarStyles.profilePillSkeleton}>
              <Skeleton.Avatar active size="large" shape="circle" />
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Skeleton.Button active size="small" style={{ width: 100, height: 14 }} />
                  <Skeleton.Button active size="small" style={{ width: 140, height: 10 }} />
                </div>
              )}
            </div>
          ) : (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="topLeft">
              <div className={`${sideBarStyles.profilePill} ${isCollapsed ? sideBarStyles.collapsedPill : ''}`}>
                <div className={sideBarStyles.avatar}>
                  {USER_DETAILS?.tpoLogo ? (
                    <img src={USER_DETAILS.tpoLogo} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt="TPO Logo" />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className={sideBarStyles.profileInfo}>
                      <span className={sideBarStyles.name}>
                        {name.length > 15
                          ? name.substring(0, 15) + "..."
                          : name}
                      </span>
                      <span className={sideBarStyles.email}>
                        {email}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </section>
  );
};

export default SideBar;
