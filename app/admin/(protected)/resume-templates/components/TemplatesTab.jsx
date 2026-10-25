"use client";
import React, { useMemo, useState } from "react";
import {
  App,
  Button,
  Checkbox,
  Dropdown,
  Empty,
  Input,
  InputNumber,
  Pagination,
  Popover,
  Segmented,
  Select,
  Skeleton,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  CloseOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  GiftOutlined,
  StarFilled,
  StarOutlined,
  TagsOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  WarningOutlined,
  CrownOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import TemplateThumb from "@/components/resumeTemplates/TemplateThumb";
import {
  ACCESS_OPTIONS,
  CATEGORY_SUGGESTIONS,
  VISIBILITY_OPTIONS,
  accessLabel,
  formatPrice,
} from "@/components/resumeTemplates/access";
import { adminSaveTemplateConfig, adminSaveTemplateConfigsBulk } from "@/services/resumeTemplatesApi";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";
import TemplateConfigDrawer from "./TemplateConfigDrawer";
import QuickSetupModal from "./QuickSetupModal";
import FullTemplatePreview from "@/components/resumeTemplates/FullTemplatePreview";
import PricePicker from "./PricePicker";
import { configPayload } from "./configPayload";

const PAGE_SIZE = 12;
const ACCESS_COLORS = { free: "green", premium: "blue", bundle: "gold" };

export default function TemplatesTab({ templates, bundles, loading, onSaved }) {
  const { message } = App.useApp();
  const { canAccess, getPermissionMessage } = usePermissions();
  const canEdit = canAccess(PERMISSION_VALUES.EDIT);

  const [view, setView] = useState("cards");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [quickSetup, setQuickSetup] = useState(false);
  // Index into `filtered` of the template open in the full-page preview.
  const [previewIndex, setPreviewIndex] = useState(null);
  const openPreview = (key) => setPreviewIndex(filtered.findIndex((x) => x.key === key));

  const categories = useMemo(
    () => [...new Set([...CATEGORY_SUGGESTIONS, ...templates.map((t) => t.category).filter(Boolean)])],
    [templates]
  );
  const publishedBundleKeys = useMemo(
    () => new Set(bundles.filter((b) => b.status === "published").flatMap((b) => b.templateKeys || [])),
    [bundles]
  );

  const filtered = templates.filter((t) => {
    const q = search.trim().toLowerCase();
    if (q && !t.name.toLowerCase().includes(q) && !t.key.includes(q) && !t.category.toLowerCase().includes(q)) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.access && t.access !== filters.access) return false;
    if (filters.visibility && t.visibility !== filters.visibility) return false;
    return true;
  });
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedSet = new Set(selected);

  const guardEdit = () => {
    if (canEdit) return true;
    message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
    return false;
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // ─── Saving ──────────────────────────────────────────────────────────────

  const saveOne = async (template, changes, successText) => {
    if (!guardEdit()) return;
    setBusyKey(template.key);
    try {
      await adminSaveTemplateConfig(template.key, configPayload(template, changes));
      if (successText) message.success(successText);
      await onSaved();
    } catch (err) {
      message.error(err.message || "Failed to save");
    } finally {
      setBusyKey(null);
    }
  };

  const applyBulk = async (changes, label) => {
    if (!guardEdit() || !selected.length) return;
    setBulkBusy(true);
    try {
      const payload = templates
        .filter((t) => selectedSet.has(t.key))
        .map((t) => ({ templateKey: t.key, ...configPayload(t, changes) }));
      await adminSaveTemplateConfigsBulk(payload);
      message.success(`${label} — ${payload.length} template${payload.length === 1 ? "" : "s"} updated`);
      setPriceOpen(false);
      await onSaved();
    } catch (err) {
      message.error(err.message || "Bulk update failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const toggleSelect = (key, on) =>
    setSelected((prev) => (on ? [...new Set([...prev, key])] : prev.filter((k) => k !== key)));
  const allFilteredSelected = filtered.length > 0 && filtered.every((t) => selectedSet.has(t.key));

  // ─── Pieces ──────────────────────────────────────────────────────────────

  const accessTag = (t) => (
    <Tag color={ACCESS_COLORS[t.access]} className="!m-0">
      {accessLabel(t.access)}
      {t.access === "premium" ? ` · ${formatPrice(t.price)}` : ""}
    </Tag>
  );

  const orphanWarning = (t) =>
    t.access === "bundle" &&
    !publishedBundleKeys.has(t.key) && (
      <Tooltip title="Bundle-only, but not in any published bundle — students can't get it yet">
        <WarningOutlined className="text-amber-500" />
      </Tooltip>
    );

  const bulkBar = selected.length > 0 && (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 shadow-sm">
      <span className="mr-1 text-[13px] font-semibold text-blue-800">{selected.length} selected</span>
      <Button size="small" icon={<GiftOutlined />} loading={bulkBusy} onClick={() => applyBulk({ access: "free", price: 0, mrp: 0 }, "Made free")}>
        Make free
      </Button>
      <Popover
        trigger="click"
        open={priceOpen}
        onOpenChange={(open) => setPriceOpen(open && canEdit)}
        content={
          <PricePicker
            busy={bulkBusy}
            applyLabel={`Make ${selected.length} premium`}
            onApply={({ price, mrp }) => applyBulk({ access: "premium", price, mrp }, `Premium at ${formatPrice(price)}`)}
          />
        }
      >
        <Button size="small" icon={<CrownOutlined />} onClick={guardEdit}>
          Make premium…
        </Button>
      </Popover>
      <Button size="small" icon={<AppstoreAddOutlined />} loading={bulkBusy} onClick={() => applyBulk({ access: "bundle", price: 0, mrp: 0 }, "Set to bundle-only")}>
        Bundle only
      </Button>
      <span className="mx-1 h-5 w-px bg-blue-200" />
      <Button size="small" icon={<EyeOutlined />} loading={bulkBusy} onClick={() => applyBulk({ visibility: "published" }, "Published")}>
        Publish
      </Button>
      <Button size="small" icon={<EyeInvisibleOutlined />} loading={bulkBusy} onClick={() => applyBulk({ visibility: "hidden" }, "Hidden")}>
        Hide
      </Button>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: categories.map((c) => ({ key: c, label: c })),
          onClick: ({ key }) => applyBulk({ category: key }, `Moved to ${key}`),
        }}
      >
        <Button size="small" icon={<TagsOutlined />} loading={bulkBusy}>
          Set category
        </Button>
      </Dropdown>
      <Button size="small" icon={<StarOutlined />} loading={bulkBusy} onClick={() => applyBulk({ featured: true }, "Featured")}>
        Feature
      </Button>
      <Button size="small" loading={bulkBusy} onClick={() => applyBulk({ featured: false }, "Unfeatured")}>
        Unfeature
      </Button>
      <Button size="small" type="text" icon={<CloseOutlined />} onClick={() => setSelected([])} className="!ml-auto">
        Clear
      </Button>
    </div>
  );

  // ─── Views ───────────────────────────────────────────────────────────────

  const cardsView = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pageItems.map((t) => {
          const isSelected = selectedSet.has(t.key);
          return (
            <div
              key={t.key}
              className={`relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/25"
                  : t.visibility === "hidden"
                    ? "border-dashed border-slate-300"
                    : "border-slate-200"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onChange={(e) => toggleSelect(t.key, e.target.checked)}
                className="!absolute left-2.5 top-2.5 z-10 rounded bg-white/90 px-1"
              />
              {t.visibility === "hidden" && (
                <span className="absolute right-2.5 top-2.5 z-10 rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Hidden
                </span>
              )}
              <div
                role="button"
                tabIndex={0}
                title="View the full template"
                className={`group/thumb relative border-b border-slate-100 text-left cursor-pointer ${t.visibility === "hidden" ? "opacity-60" : ""}`}
                onClick={() => openPreview(t.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openPreview(t.key);
                  }
                }}
              >
                <TemplateThumb templateKey={t.key} previewImage={t.previewImage} height={200} scale={0.27} />
                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover/thumb:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-800 shadow">
                    <EyeOutlined /> View full template
                  </span>
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate font-semibold text-slate-800">
                      {t.featured && <StarFilled className="text-amber-400" />}
                      {t.name} {orphanWarning(t)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t.category} · #{t.order}
                    </div>
                  </div>
                  <Tooltip title={t.visibility === "published" ? "Visible to students" : "Hidden from students"}>
                    <Switch
                      size="small"
                      checked={t.visibility === "published"}
                      loading={busyKey === t.key}
                      disabled={!canEdit}
                      onChange={(on) =>
                        saveOne(t, { visibility: on ? "published" : "hidden" }, `${t.name} ${on ? "published" : "hidden"}`)
                      }
                    />
                  </Tooltip>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {accessTag(t)}
                  {t.bundles.length > 0 && (
                    <Tooltip title={t.bundles.map((b) => b.title).join(", ")}>
                      <Tag color="purple" className="!m-0">
                        {t.bundles.length} bundle{t.bundles.length === 1 ? "" : "s"}
                      </Tag>
                    </Tooltip>
                  )}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Button size="small" icon={<EyeOutlined />} onClick={() => openPreview(t.key)}>
                    Preview
                  </Button>
                  <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(t)}>
                    {canEdit ? "Edit" : "Details"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Pagination current={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} showSizeChanger={false} />
      </div>
    </>
  );

  // Every column edits in place and saves straight away.
  const columns = [
    {
      title: "Template",
      key: "name",
      width: 300,
      render: (_, t) => (
        <div className="flex items-center gap-3">
          <div
            role="button"
            tabIndex={0}
            title="View the full template"
            onClick={() => openPreview(t.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openPreview(t.key);
              }
            }}
            className="w-[52px] shrink-0 cursor-zoom-in overflow-hidden rounded border border-slate-200 p-0 hover:border-blue-400"
          >
            <TemplateThumb templateKey={t.key} previewImage={t.previewImage} height={68} scale={0.07} />
          </div>
          <div className="min-w-0">
            <Typography.Text
              strong
              editable={
                canEdit && {
                  triggerType: ["text", "icon"],
                  onChange: (value) =>
                    value.trim() && value.trim() !== t.name && saveOne(t, { name: value.trim() }, "Name saved"),
                }
              }
            >
              {t.name}
            </Typography.Text>
            <div className="text-[11px] text-slate-400">{t.key}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 160,
      render: (_, t) => (
        <Select
          size="small"
          value={t.category}
          disabled={!canEdit}
          options={categories.map((c) => ({ value: c, label: c }))}
          onChange={(category) => saveOne(t, { category }, "Category saved")}
          style={{ width: 140 }}
        />
      ),
    },
    {
      title: "Access",
      key: "access",
      width: 150,
      render: (_, t) => (
        <Select
          size="small"
          value={t.access}
          disabled={!canEdit}
          options={ACCESS_OPTIONS}
          onChange={(access) =>
            access === "premium" && !t.price
              ? saveOne(t, { access, price: 99, mrp: 99 }, "Now premium at ₹99 — adjust the price if needed")
              : saveOne(t, { access }, "Access saved")
          }
          style={{ width: 130 }}
        />
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 140,
      render: (_, t) =>
        t.access === "premium" ? (
          <InputNumber
            size="small"
            min={1}
            precision={0}
            prefix="₹"
            defaultValue={t.price}
            disabled={!canEdit}
            onPressEnter={(e) => e.currentTarget.blur()}
            onBlur={(e) => {
              const price = Number(e.target.value.replace(/[^\d]/g, ""));
              if (price > 0 && price !== t.price) saveOne(t, { price, mrp: Math.max(price, t.mrp || 0) }, "Price saved");
            }}
            style={{ width: 110 }}
          />
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      title: "Order",
      key: "order",
      width: 90,
      sorter: (a, b) => a.order - b.order,
      render: (_, t) => (
        <InputNumber
          size="small"
          min={0}
          precision={0}
          defaultValue={t.order}
          disabled={!canEdit}
          onPressEnter={(e) => e.currentTarget.blur()}
          onBlur={(e) => {
            const order = Number(e.target.value);
            if (Number.isFinite(order) && order !== t.order) saveOne(t, { order }, "Order saved");
          }}
          style={{ width: 70 }}
        />
      ),
    },
    {
      title: "Visible",
      key: "visibility",
      width: 80,
      render: (_, t) => (
        <Switch
          size="small"
          checked={t.visibility === "published"}
          loading={busyKey === t.key}
          disabled={!canEdit}
          onChange={(on) => saveOne(t, { visibility: on ? "published" : "hidden" })}
        />
      ),
    },
    {
      title: "Featured",
      key: "featured",
      width: 80,
      render: (_, t) => (
        <Button
          type="text"
          size="small"
          disabled={!canEdit}
          icon={t.featured ? <StarFilled className="text-amber-400" /> : <StarOutlined className="text-slate-400" />}
          onClick={() => saveOne(t, { featured: !t.featured })}
        />
      ),
    },
    {
      title: "",
      key: "more",
      width: 70,
      render: (_, t) => (
        <span className="flex items-center gap-1">
          {orphanWarning(t)}
          <Button size="small" type="link" className="!px-1" onClick={() => openPreview(t.key)}>
            Preview
          </Button>
          <Button size="small" type="link" className="!px-1" onClick={() => setEditing(t)}>
            More
          </Button>
        </span>
      ),
    },
  ];

  const tableView = (
    <Table
      rowKey="key"
      size="middle"
      columns={columns}
      dataSource={filtered}
      scroll={{ x: 1000 }}
      pagination={{ pageSize: 15, showSizeChanger: false }}
      rowSelection={{
        selectedRowKeys: selected,
        onChange: (keys) => setSelected(keys),
        preserveSelectedRowKeys: true,
      }}
      rowClassName={(t) => (t.visibility === "hidden" ? "opacity-60" : "")}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Input.Search
            allowClear
            placeholder="Search name, key or category…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 240 }}
          />
          <Select
            allowClear
            placeholder="Category"
            options={categories.map((c) => ({ value: c, label: c }))}
            onChange={(v) => setFilter("category", v)}
            style={{ width: 150 }}
          />
          <Select allowClear placeholder="Access" options={ACCESS_OPTIONS} onChange={(v) => setFilter("access", v)} style={{ width: 130 }} />
          <Select allowClear placeholder="Status" options={VISIBILITY_OPTIONS} onChange={(v) => setFilter("visibility", v)} style={{ width: 120 }} />
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<ThunderboltOutlined />} onClick={() => guardEdit() && setQuickSetup(true)}>
            Quick setup
          </Button>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "cards", icon: <AppstoreOutlined />, label: "Cards" },
              { value: "table", icon: <UnorderedListOutlined />, label: "Table" },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-[13px] text-slate-500">
        <Checkbox
          checked={allFilteredSelected}
          indeterminate={!allFilteredSelected && filtered.some((t) => selectedSet.has(t.key))}
          onChange={(e) =>
            setSelected((prev) =>
              e.target.checked
                ? [...new Set([...prev, ...filtered.map((t) => t.key)])]
                : prev.filter((k) => !filtered.some((t) => t.key === k))
            )
          }
        >
          Select all {filtered.length} shown
        </Checkbox>
        <span>· Tip: select templates, then change them all at once.</span>
      </div>

      {bulkBar}

      {loading && !templates.length ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : !filtered.length ? (
        <Empty description="No templates match these filters" />
      ) : view === "cards" ? (
        cardsView
      ) : (
        tableView
      )}

      {editing && (
        <TemplateConfigDrawer
          template={editing}
          categories={categories}
          bundles={bundles}
          canEdit={canEdit}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await onSaved();
          }}
        />
      )}
      {previewIndex !== null && previewIndex >= 0 && (
        <FullTemplatePreview
          templates={filtered}
          index={previewIndex}
          onIndexChange={setPreviewIndex}
          onClose={() => setPreviewIndex(null)}
          onEdit={(t) => {
            setPreviewIndex(null);
            setEditing(t);
          }}
        />
      )}
      {quickSetup && (
        <QuickSetupModal
          templates={templates}
          onClose={() => setQuickSetup(false)}
          onSaved={async () => {
            setQuickSetup(false);
            await onSaved();
          }}
        />
      )}
    </div>
  );
}
