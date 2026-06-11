"use client";
import React, { memo } from "react";
import { Button, Empty } from "antd";
import { FilePdfOutlined, CodeOutlined } from "@ant-design/icons";
import interPageStyles from "../page.module.scss";

/**
 * ResourceList
 * Displays downloadable resources or source code items.
 */
export const ResourceList = memo(({ items, title, iconType }) => {
  if (!items || items.length === 0) {
    return <Empty description={`No ${title.toLowerCase()} available for this topic.`} />;
  }

  const IconComponent = iconType === "code" ? CodeOutlined : FilePdfOutlined;

  return (
    <div className={interPageStyles.resourceList}>
      {items.map((item, index) => {
        // Source code arrays are often strings, while resources are objects { url, title }
        const isString = typeof item === "string";
        const url = isString ? item : item.url;
        const itemTitle = isString ? `${title} ${index + 1}` : (item.title || `${title} ${index + 1}`);

        return (
          <div key={index} className={interPageStyles.resourceItem}>
            <div className={interPageStyles.resourceInfo}>
              <IconComponent className={interPageStyles.resourceIcon} />
              <span className={interPageStyles.resourceName}>{itemTitle}</span>
            </div>
            <Button type="primary" onClick={() => window.open(url, "_blank")}>
              Download
            </Button>
          </div>
        );
      })}
    </div>
  );
});

ResourceList.displayName = "ResourceList";
export default ResourceList;
