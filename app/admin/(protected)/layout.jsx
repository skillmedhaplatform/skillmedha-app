import React from "react";
import UserDataLayer from "@/modules/admin/components/dal/UserDataLayer";
import AdminProgressProvider from "./AdminProgressProvider";
import AntdAppProvider from "@/modules/admin/utils/providers";
import AdminSidebarShell from "./AdminSidebarShell";

export const metadata = {
  title: "Admin Portal | SkillMedha",
  description: "SkillMedha Admin Dashboard",
};

export default function layout({ children }) {
  return (
    <AntdAppProvider>
      <UserDataLayer>
        <AdminProgressProvider>
          <AdminSidebarShell>
            {children}
          </AdminSidebarShell>
        </AdminProgressProvider>
      </UserDataLayer>
    </AntdAppProvider>
  );
}
