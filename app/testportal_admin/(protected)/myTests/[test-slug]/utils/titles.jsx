"use client";
import React from "react";
import TitlesStyles from "../styles/title.module.scss";
import { titleData } from "./titlesData";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname, useParams } from "next/navigation";
import { message, Tabs } from "antd";

const TitlesForm = () => {
  const dispatch = useDispatch();
  const param = useParams();
  const nav = useRouter();
  const currPath = usePathname();

  const activeKey =
    titleData.find(
      (title) =>
        currPath.includes(title.path) || currPath.split("/").pop() === title.path
    )?.path || titleData[0].path;

  const items = titleData.map((title) => ({
    key: title.path,
    label: title.name,
  }));

  const onChange = (key) => {
    nav.replace("/testportal_admin/myTests/" + param["test-slug"] + "/" + key);
  };

  return (
    <div className={TitlesStyles.titlesContainer}>
      <Tabs
        activeKey={activeKey}
        onChange={onChange}
        items={items}
        className={TitlesStyles.navTabs}
        size="large"
        tabBarGutter={100}
        animated={{ inkBar: true, tabPane: false }}
      />
    </div>
  );
};

export default TitlesForm;
