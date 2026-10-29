"use client";
import React, { useMemo, useState } from "react";
import { App, Button, Input, InputNumber, Segmented, Select, Space, Switch, Table, Tag, Tooltip } from "antd";
import { SearchOutlined, StarFilled } from "@ant-design/icons";
import { adminSaveCourseConfig, adminSaveCourseConfigsBulk } from "@/services/courseAccessApi";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const ACCESS_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "bundle", label: "Bundle only" },
];
const ACCESS_COLOR = { free: "green", premium: "gold", bundle: "purple" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "bundle", label: "Bundle only" },
  { value: "hidden", label: "Hidden" },
];

const configOf = (course, changes = {}) => ({
  access: course.access,
  visibility: course.visibility,
  featured: course.featured,
  order: course.order,
  ...changes,
});

export default function CoursesTab({ courses, loading, onChanged, setCourses }) {
  const { message, modal } = App.useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (s && !String(c.title || "").toLowerCase().includes(s) && !String(c.category || "").toLowerCase().includes(s)) {
        return false;
      }
      if (filter === "hidden") return c.visibility === "hidden";
      if (filter !== "all") return c.access === filter && c.visibility === "published";
      return true;
    });
  }, [courses, search, filter]);

  // Saves one course right away, updating the row optimistically.
  const saveOne = async (course, changes) => {
    const next = configOf(course, changes);
    if (next.access === "premium" && !(course.price > 0)) {
      message.warning("This course has no price in the course editor — set a price there first, or make it Free.");
      return;
    }
    if (next.access === "bundle" && !course.bundles?.length) {
      message.info("Remember to add this course to a published bundle, or students won't be able to get it.");
    }
    setSavingId(course.courseId);
    setCourses((list) => list.map((c) => (c.courseId === course.courseId ? { ...c, ...next, isDefault: false } : c)));
    try {
      await adminSaveCourseConfig(course.courseId, next);
      message.success(`${course.title}: saved`);
    } catch (err) {
      message.error(err.message || "Couldn't save");
      onChanged();
    } finally {
      setSavingId(null);
    }
  };

  const applyBulk = (changes, label) => {
    const targets = courses.filter((c) => selected.includes(c.courseId));
    if (!targets.length) return;
    const unpriced = changes.access === "premium" ? targets.filter((c) => !(c.price > 0)) : [];
    modal.confirm({
      title: `${label} for ${targets.length} course${targets.length === 1 ? "" : "s"}?`,
      content: unpriced.length
        ? `${unpriced.length} of them have no price in the course editor and will be skipped.`
        : "Students who already own these courses keep their access.",
      okText: "Apply",
      onOk: async () => {
        const list = targets
          .filter((c) => !unpriced.includes(c))
          .map((c) => ({ courseId: c.courseId, title: c.title, ...configOf(c, changes) }));
        if (!list.length) return;
        setBulkSaving(true);
        try {
          const res = await adminSaveCourseConfigsBulk(list);
          message.success(res?.msg || "Saved");
          setSelected([]);
          onChanged();
        } catch (err) {
          message.error(err.message || "Couldn't save");
        } finally {
          setBulkSaving(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_, c) => (
        <div className="flex items-center gap-3">
          <div className="h-[42px] w-[64px] shrink-0 overflow-hidden rounded-md border border-slate-100 bg-slate-50">
            {c.thumbnail && <img src={c.thumbnail} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              {c.featured && <StarFilled className="text-amber-400" />}
              <span className="line-clamp-1">{c.title}</span>
            </div>
            <div className="text-[12px] text-slate-400">
              {[c.category, c.difficulty, c.collegeCount ? `${c.collegeCount} college${c.collegeCount === 1 ? "" : "s"}` : null]
                .filter(Boolean)
                .join(" · ")}
              {c.isDefault && <span className="ml-1.5 text-slate-300">(not configured yet)</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Editor price",
      key: "price",
      width: 130,
      render: (_, c) => (
        <div>
          <div className="font-semibold text-slate-800">{c.price > 0 ? formatPrice(c.price) : "₹0"}</div>
          {c.mrp > c.price && <div className="text-[12px] text-slate-400 line-through">{formatPrice(c.mrp)}</div>}
        </div>
      ),
    },
    {
      title: "Access",
      key: "access",
      width: 160,
      render: (_, c) => (
        <Select
          value={c.access}
          options={ACCESS_OPTIONS}
          onChange={(access) => saveOne(c, { access })}
          disabled={savingId === c.courseId}
          style={{ width: 140 }}
        />
      ),
    },
    {
      title: (
        <Tooltip title="Hidden courses disappear from the student library. Students who already own them keep access.">
          Visible
        </Tooltip>
      ),
      key: "visibility",
      width: 90,
      render: (_, c) => (
        <Switch
          checked={c.visibility === "published"}
          onChange={(on) => saveOne(c, { visibility: on ? "published" : "hidden" })}
          disabled={savingId === c.courseId}
        />
      ),
    },
    {
      title: "Featured",
      key: "featured",
      width: 90,
      render: (_, c) => (
        <Switch size="small" checked={c.featured} onChange={(featured) => saveOne(c, { featured })} disabled={savingId === c.courseId} />
      ),
    },
    {
      title: <Tooltip title="Lower numbers show first">Order</Tooltip>,
      key: "order",
      width: 100,
      render: (_, c) => (
        <InputNumber
          size="small"
          min={0}
          defaultValue={c.order}
          key={`${c.courseId}-${c.order}`}
          onBlur={(e) => {
            const order = Number(e.target.value);
            if (Number.isFinite(order) && order !== c.order) saveOne(c, { order });
          }}
          style={{ width: 72 }}
        />
      ),
    },
    {
      title: "In bundles",
      key: "bundles",
      render: (_, c) =>
        c.bundles?.length ? (
          <Space size={[4, 4]} wrap>
            {c.bundles.map((b) => (
              <Tag key={b._id} color={b.status === "published" ? "purple" : "default"}>
                {b.title}
              </Tag>
            ))}
          </Space>
        ) : c.access === "bundle" ? (
          <Tag color="red">Not in any bundle</Tag>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={filter} onChange={setFilter} options={FILTERS} />
        <Input
          allowClear
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search courses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260 }}
        />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <span className="mr-2 text-[13px] font-semibold text-blue-800">{selected.length} selected</span>
          {ACCESS_OPTIONS.map((o) => (
            <Button key={o.value} size="small" loading={bulkSaving} onClick={() => applyBulk({ access: o.value }, `Make ${o.label}`)}>
              Make {o.label}
            </Button>
          ))}
          <Button size="small" loading={bulkSaving} onClick={() => applyBulk({ visibility: "hidden" }, "Hide")}>
            Hide
          </Button>
          <Button size="small" loading={bulkSaving} onClick={() => applyBulk({ visibility: "published" }, "Show")}>
            Show
          </Button>
          <Button size="small" type="link" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}

      <Table
        rowKey="courseId"
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={false}
        scroll={{ x: 980 }}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
        rowClassName={(c) => (c.visibility === "hidden" ? "opacity-60" : "")}
        locale={{ emptyText: "No courses match" }}
      />
      <div className="text-[12px] text-slate-400">
        <Tag color={ACCESS_COLOR.free}>Free</Tag> anyone can learn ·
        <Tag color={ACCESS_COLOR.premium} className="!ml-2">Premium</Tag> buy at the editor price (or in a bundle) ·
        <Tag color={ACCESS_COLOR.bundle} className="!ml-2">Bundle only</Tag> can be bought only in a bundle
      </div>
    </div>
  );
}
