"use client";
import React, { useMemo, useState } from "react";
import { App, Button, Input, InputNumber, Popover, Segmented, Select, Space, Switch, Table, Tag, Tooltip } from "antd";
import { EditOutlined, SearchOutlined, StarFilled } from "@ant-design/icons";
import { adminSaveCourseConfig, adminSaveCourseConfigsBulk } from "@/services/courseAccessApi";
import CoursePricePicker from "./CoursePricePicker";
import CourseEditDrawer from "./CourseEditDrawer";

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
  // Course open in the edit drawer (with any access pre-selected, e.g. Premium
  // picked for a course that has no price yet).
  const [editing, setEditing] = useState(null);
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);

  // Drawer save: one request for access, price, coupon and library settings,
  // then reload so the table shows exactly what the server stored.
  const saveFromDrawer = async (course, body) => {
    setDrawerSaving(true);
    try {
      await adminSaveCourseConfig(course.courseId, body);
      message.success(`${course.title}: saved`);
      setEditing(null);
      onChanged();
    } catch (err) {
      message.error(err.message || "Couldn't save");
    } finally {
      setDrawerSaving(false);
    }
  };

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

  // Quick inline changes (access, visible, featured, order) save right away,
  // updating the row optimistically.
  const saveOne = async (course, changes) => {
    const next = configOf(course, changes);
    if (next.access === "premium" && !(course.price > 0)) {
      // A paid course needs a price — finish in the drawer.
      setEditing({ ...course, access: "premium" });
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

  // Same price for every selected course (each course's coupon still applies).
  const applyBulkPrice = async ({ price, mrp }) => {
    const list = courses
      .filter((c) => selected.includes(c.courseId))
      .map((c) => ({ courseId: c.courseId, title: c.title, ...configOf(c), price, mrp }));
    if (!list.length) return;
    setBulkSaving(true);
    try {
      const res = await adminSaveCourseConfigsBulk(list);
      message.success(res?.msg || "Prices saved");
      setBulkPriceOpen(false);
      setSelected([]);
      onChanged();
    } catch (err) {
      message.error(err.message || "Couldn't save prices");
    } finally {
      setBulkSaving(false);
    }
  };

  const applyBulk = (changes, label) => {
    const targets = courses.filter((c) => selected.includes(c.courseId));
    if (!targets.length) return;
    const unpriced = changes.access === "premium" ? targets.filter((c) => !(c.price > 0)) : [];
    modal.confirm({
      title: `${label} for ${targets.length} course${targets.length === 1 ? "" : "s"}?`,
      content: unpriced.length
        ? `${unpriced.length} of them have no price yet and will be skipped — use "Set price" for them.`
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
            <button
              type="button"
              onClick={() => setEditing(c)}
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-left font-semibold text-slate-800 hover:text-blue-600"
            >
              {c.featured && <StarFilled className="text-amber-400" />}
              <span className="line-clamp-1">{c.title}</span>
            </button>
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
      title: <Tooltip title="What students pay. Saved on the course, so the course editor shows the same price.">Price</Tooltip>,
      key: "price",
      width: 170,
      render: (_, c) => (
          <button
            type="button"
            onClick={() => setEditing(c)}
            className="group flex cursor-pointer flex-col items-start border-none bg-transparent p-0 text-left"
          >
            <span className="flex items-center gap-1.5">
              <span className={`font-semibold ${c.access === "free" ? "text-emerald-600" : "text-slate-800"}`}>
                {c.access === "free" ? "Free" : c.price > 0 ? formatPrice(c.price) : "No price"}
              </span>
              <EditOutlined className="text-[12px] text-slate-300 group-hover:text-blue-600" />
            </span>
            {c.access !== "free" && c.mrp > c.price && (
              <span className="text-[12px] text-slate-400 line-through">{formatPrice(c.mrp)}</span>
            )}
            {c.access === "free" && c.price > 0 && (
              <span className="text-[11px] text-slate-400">{formatPrice(c.price)} when paid</span>
            )}
            {c.access !== "free" && c.couponDiscount > 0 && (
              <span className="text-[11px] text-slate-400">
                after {c.couponCode || "coupon"} −{formatPrice(c.couponDiscount)}
              </span>
            )}
          </button>
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
      title: <Tooltip title="Featured courses get a ★ Featured tag and are listed first in the student Course Library">Featured</Tooltip>,
      key: "featured",
      width: 90,
      render: (_, c) => (
        <Switch size="small" checked={c.featured} onChange={(featured) => saveOne(c, { featured })} disabled={savingId === c.courseId} />
      ),
    },
    {
      title: <Tooltip title="Position in the student Course Library — lower numbers show first (after featured courses)">Order</Tooltip>,
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
          <Popover
            trigger="click"
            open={bulkPriceOpen}
            onOpenChange={setBulkPriceOpen}
            title={`Set the same price for ${selected.length} course${selected.length === 1 ? "" : "s"}`}
            destroyOnHidden
            content={<CoursePricePicker busy={bulkSaving} applyLabel="Save prices" onApply={applyBulkPrice} />}
          >
            <Button size="small" type="primary" ghost>
              Set price
            </Button>
          </Popover>
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
      <CourseEditDrawer
        open={!!editing}
        course={editing}
        saving={drawerSaving}
        onClose={() => setEditing(null)}
        onSave={saveFromDrawer}
      />
      <div className="text-[12px] text-slate-400">
        Click a course name or price to edit everything about it ·{" "}
        <Tag color={ACCESS_COLOR.free}>Free</Tag> anyone can learn ·
        <Tag color={ACCESS_COLOR.premium} className="!ml-2">Premium</Tag> buy at its price (or in a bundle) ·
        <Tag color={ACCESS_COLOR.bundle} className="!ml-2">Bundle only</Tag> can be bought only in a bundle
      </div>
    </div>
  );
}
