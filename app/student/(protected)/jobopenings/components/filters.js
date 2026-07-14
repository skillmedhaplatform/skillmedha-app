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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const profileNameParam = searchParams.get("profileName") || "all";
  const sortParam = searchParams.get("sort") || "createdAt";
  const searchParam = searchParams.get("search") || "";

  const [filters, setFilters] = useState({
    profileName: profileNameParam,
    sort: sortParam,
    search: searchParam,
  });

  // Sync local filters state with URL changes (e.g. on clear or reload)
  React.useEffect(() => {
    setFilters({
      profileName: searchParams.get("profileName") || "all",
      sort: searchParams.get("sort") || "createdAt",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  const { jobs } = useSelector(
    (state) => state.jonOpenings.allJobOpenings.value
  );
  const jobsStatus = useSelector(
    (state) => state.jonOpenings.allJobOpenings?.status
  );
  const isLoading = jobsStatus === "pending";



  const sortOptions = [
    { value: "createdAt", label: "Sort By Date" },
    { value: "relevance", label: "Sort By Relevance" },
  ];

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      params.set("page", "1"); // Reset to page 1 on search or filter change
      return params.toString().replace(/\+/g, "%20");
    },
    [searchParams]
  );

  const handleClearFilter = () => {
    router.push(pathname);
    setFilters({ profileName: "all", sort: "createdAt", search: "" });
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1E69DA" } }}>
      <div className="flex items-center justify-between gap-2 flex-nowrap mb-4 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-[#e2e8f0]">
        {/* ── Left: Search ── */}
        <div className="flex-1 flex items-center justify-start gap-3">
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
            style={{ maxWidth: "400px" }}
            className="w-full text-[16px]"
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
              } else {
                handleClearFilter();
              }
            }}
          />
        </div>

        {/* ── Right: Sort + Clear ── */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <Select
            id="sort-selector"
            style={{ width: "100%", maxWidth: 180 }}
            value={filters.sort}
            options={sortOptions}
            suffixIcon={<SortAscendingOutlined />}
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, sort: value }));
              router.push(pathname + "?" + createQueryString("sort", value));
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
