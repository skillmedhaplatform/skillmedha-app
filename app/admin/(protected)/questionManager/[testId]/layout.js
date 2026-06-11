"use client";
import { Tabs, Button, message, Tooltip } from "antd";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./layout.module.scss";
import { getOneSKill, getSKillQuestions } from "@/redux/slices/admin/cms/skillsSlice";
import { useSelector, useDispatch } from "react-redux";
import { IoCaretBackOutline } from "react-icons/io5";
export default function AssessmentLayout({ children }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const ReduxState = useSelector((state) => ({
    SKILL: state.skill.skill?.value?.data,
  }));

  const getActiveKeyFromPathname = () => {
    if (pathname.includes("/details")) {
      return "details";
    } else if (pathname.includes("/admin/questionManager")) {
      return "questionManager";
    }

    return "details";
  };

  useEffect(() => {
    const loadSkillData = async () => {
      try {
        const [skillResult, questionsResult] = await Promise.all([
          dispatch(getOneSKill({ skillId: params?.testId })),
          dispatch(getSKillQuestions({ skillId: params?.testId })),
        ]);

        const skillSuccess = getOneSKill.fulfilled.match(skillResult);
        const questionsSuccess =
          getSKillQuestions.fulfilled.match(questionsResult);

        if (skillSuccess && questionsSuccess) {
          router.push(`/admin/questionManager/${params?.testId}/details`);
        } else {
          const skillError = skillSuccess ? null : skillResult.error?.message;
          const questionsError = questionsSuccess
            ? null
            : questionsResult.error?.message;

          const errorMessage =
            [skillError, questionsError].filter(Boolean).join(", ") ||
            "Failed to load data";
        }
      } catch (error) {
        console.error("Error loading skill data:", error);
      }
    };

    if (params?.testId) {
      loadSkillData();
    }
  }, [params?.testId, dispatch, router]);

  useEffect(() => {
    const newActiveKey = getActiveKeyFromPathname();
    setActiveKey(newActiveKey);
  }, [pathname]);

  const [activeKey, setActiveKey] = useState("details");

  const baseUrl = `/admin/questionManager/${params?.testId}`;
  const isNewSkill = params?.testId === "newSkill";

  const routes = [
    {
      key: "details",
      name: "Details",
      route: `${baseUrl}/details`,
    },
    {
      key: "questionManager",
      name: "Question Manager",
      route: `${baseUrl}/questionManager`,
      disabled: isNewSkill,
    },
  ];

  const onChange = (key) => {
    setActiveKey(key);
    const selectedRoute = routes.find((route) => route.key === key);
    if (selectedRoute && !selectedRoute.disabled) {
      router.push(selectedRoute.route);
    } else if (selectedRoute?.disabled) {
      message.warning("Finish basic details and click save");
    }
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentRoute = routes.find((route) =>
      currentPath.endsWith(`/${route.key}`)
    );
    if (currentRoute) {
      setActiveKey(currentRoute.key);
    }
  }, []);

  const items = routes.map((route) => ({
    key: route.key,
    label: route.disabled ? (
      <Tooltip title="Finish basic details and click save" placement="top">
        <span style={{ cursor: "not-allowed" }}>{route.name}</span>
      </Tooltip>
    ) : (
      route.name
    ),
    children: null,
    disabled: route.disabled,
  }));

  const tabBarExtraContent = {
    left: (
      <Button
        icon={<IoCaretBackOutline />}
        type="text"
        onClick={() => {
          router.push(`/admin/questionManager`);
        }}
      >
        <h3>{ReduxState?.SKILL?.title}</h3>
      </Button>
    ),
  };

  return (
    <div className={styles.container}>
      <Tabs
        defaultActiveKey="details"
        activeKey={activeKey}
        items={items}
        onChange={onChange}
        tabBarGutter={150}
        className={styles.customTabs}
        tabBarExtraContent={tabBarExtraContent}
      />
      <div className={styles.contentCont}>{children}</div>
    </div>
  );
}
