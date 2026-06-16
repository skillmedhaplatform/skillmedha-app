"use client";

import React, { useCallback, useState } from "react";
import { Button, Input, Select, ConfigProvider } from "antd";
import {
  CloseCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import _ from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { GetAllJobs } from "@/redux/slices/jobopenings";

const { Search } = Input;

export default function JobHeader() {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    profileName: "all",
    sort: "createdAt",
    search: "",
  });

  const { jobs } = useSelector(
    (state) => state.jonOpenings.allJobOpenings.value
  );
  const jobsStatus = useSelector(
    (state) => state.jonOpenings.allJobOpenings?.status
  );
  const isLoading = jobsStatus === "pending";

  const jobOptions = [
    { value: "all", label: "All Jobs" },
    ..._.uniqBy(
      (jobs ?? []).map((e) => ({
        value: e?.profileName,
        label: e?.profileName,
      })),
      "value"
    ).filter((e) => e.value),
  ];

  const sortOptions = [
    { value: "createdAt", label: "Sort By Date" },
    { value: "relevance", label: "Sort By Relevance" },
  ];

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString().replace(/\+/g, "%20");
    },
    [searchParams]
  );

  const handleClearFilter = () => {
    const hasQueryParams = Array.from(searchParams.entries()).length > 0;
    if (hasQueryParams) {
      dispatch(GetAllJobs({ fetchType: "initial" }));
    }
    router.push(pathname);
    setFilters({ profileName: "all", sort: "createdAt", search: "" });
  };

  function handleDispatchFilter(key, value) {
    if (key === "profileName" && value === "all") {
      handleClearFilter();
      return;
    }
    const queryObj = {};
    for (const [k, v] of searchParams.entries()) {
      queryObj[k] = v;
    }
    queryObj[key] = value;
    dispatch(GetAllJobs({ fetchType: "initial", queryObj }));
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1E69DA" } }}>
      <div className="flex items-center justify-between gap-2 flex-nowrap mb-4 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-[#e2e8f0]">
        {/* ── Left: Selects ── */}
        <div className="w-[60%] max-w-[60%] flex items-center justify-start gap-3">
          <Select
            id="job-selector"
            style={{ width: "100%", maxWidth: 180 }}
            value={filters.profileName}
            options={jobOptions}
            placeholder="Job Profile"
            loading={isLoading}
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, profileName: value }));
              router.push(
                pathname + "?" + createQueryString("profileName", value)
              );
              handleDispatchFilter("profileName", value);
            }}
          />

          <Select
            id="sort-selector"
            style={{ width: "100%", maxWidth: 180 }}
            value={filters.sort}
            options={sortOptions}
            suffixIcon={<SortAscendingOutlined />}
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, sort: value }));
              router.push(pathname + "?" + createQueryString("sort", value));
              handleDispatchFilter("sort", value);
            }}
          />
        </div>

        {/* ── Right: Search + Clear ── */}
        <div className="w-[40%] max-w-[40%] flex items-center justify-end gap-2">
          <Search
            id="job-search"
            placeholder="Search by job position, company..."
            allowClear
            enterButton={
              <Button
                type="primary"
                className="px-4 !bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none"
              >
                Search
              </Button>
            }
            className="max-w-full w-full text-[16px]"
            value={filters.search}
            loading={isLoading}
            onChange={(e) => {
              const value = e.target.value;
              setFilters((prev) => ({ ...prev, search: value }));
              if (!value) handleClearFilter();
            }}
            onSearch={(value) => {
              if (value) {
                router.push(pathname + "?" + createQueryString("search", value));
                handleDispatchFilter("search", value);
              } else {
                handleClearFilter();
              }
            }}
          />

          <Button
            type="text"
            className="whitespace-nowrap text-[#ef4444] font-semibold hover:!text-[#dc2626] hover:!bg-red-50 mx-1"
            onClick={handleClearFilter}
          >
            Clear
          </Button>
        </div>
      </div>
    </ConfigProvider>
  );
}
