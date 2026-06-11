import { Breadcrumb } from "antd";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { sideBarTitles } from "@/utils/windowMW";
import { FaCaretRight } from "react-icons/fa6";
import "./Breadcrumb.css";

const BreadcrumbComponent = ({ customLabels = {} }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split("/").filter(Boolean);

    const items = [
      {
        title: <Link href="/">Home</Link>,
      },
    ];

    let accumulatedPath = "";

    pathSegments.forEach((segment, index) => {
      accumulatedPath += `/${segment}`;

      // Determine which query params to include based on the segment
      let fullPath = accumulatedPath;

      if (segment === "departments" || segment === "students") {
        // For departments and students, include orgId and orgName
        const orgId = searchParams.get("orgId");
        const orgName = searchParams.get("orgName");

        const params = new URLSearchParams();
        if (orgId) params.append("orgId", orgId);
        if (orgName) params.append("orgName", orgName);

        // For students, also include deptId
        if (segment === "students") {
          const deptId = searchParams.get("deptId");
          if (deptId) params.append("deptId", deptId);
        }

        const queryString = params.toString();
        if (queryString) {
          fullPath = `${accumulatedPath}?${queryString}`;
        }
      }

      const sideBarItem = sideBarTitles.find(
        (item) => item.path === `/${segment}`
      );

      const label =
        customLabels[segment] ||
        sideBarItem?.name ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

      if (index === pathSegments.length - 1) {
        items.push({
          title: label,
        });
      } else {
        items.push({
          title: <Link href={fullPath}>{label}</Link>,
        });
      }
    });

    return items;
  }, [pathname, searchParams, customLabels]);

  return (
    <div className="breadcrumb-wrapper">
      <Breadcrumb
        separator={<FaCaretRight style={{ fontSize: "22px", color: "gray" }} />}
        items={breadcrumbItems}
      />
    </div>
  );
};

export default BreadcrumbComponent;
