"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, Segmented, Tag, Tooltip } from "antd";
import { EditOutlined, LeftOutlined, RightOutlined, StarFilled } from "@ant-design/icons";
import { templateComponents } from "@/app/student/(protected)/resumeBuilder/Templates/registry";
import { PreviewContext } from "@/app/student/(protected)/resumeBuilder/Templates/components/resumeTemplateData";
import { accessLabel, formatPrice } from "./access";

const A4_WIDTH = 794;
const ZOOMS = [
  { value: 0.6, label: "60%" },
  { value: 0.8, label: "80%" },
  { value: 1, label: "100%" },
];
const ACCESS_COLORS = { free: "green", premium: "blue", bundle: "gold" };

/**
 * The whole template — full A4 page with sample data, nothing cropped.
 * `templates` is the list to browse with ← / → (each { key, name, category,
 * access, price, visibility, featured, previewImage }); `index` is the one
 * shown. `onEdit(template)` adds an "Edit details" button.
 */
export default function FullTemplatePreview({ templates, index, onIndexChange, onClose, onEdit }) {
  const [zoom, setZoom] = useState(0.8);
  const template = templates[index];
  const Tmp = template ? templateComponents[template.key] : null;
  const hasPrev = index > 0;
  const hasNext = index < templates.length - 1;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
      if (e.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, hasPrev, hasNext, onIndexChange]);

  if (!template) return null;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={Math.round(A4_WIDTH * zoom) + 120}
      centered
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex flex-wrap items-center gap-2 pr-8">
          {template.featured && <StarFilled className="text-amber-400" />}
          <span className="text-[16px] font-bold">{template.name}</span>
          <span className="text-[12px] font-normal text-slate-400">
            {template.key} · {template.category}
          </span>
          <Tag color={ACCESS_COLORS[template.access]} className="!m-0">
            {accessLabel(template.access)}
            {template.access === "premium" ? ` · ${formatPrice(template.price)}` : ""}
          </Tag>
          {template.visibility === "hidden" && <Tag className="!m-0">Hidden</Tag>}
        </div>
      }
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-2.5">
        <div className="flex items-center gap-2">
          <Tooltip title="Previous (←)">
            <Button icon={<LeftOutlined />} disabled={!hasPrev} onClick={() => onIndexChange(index - 1)} />
          </Tooltip>
          <span className="min-w-[64px] text-center text-[13px] text-slate-500">
            {index + 1} / {templates.length}
          </span>
          <Tooltip title="Next (→)">
            <Button icon={<RightOutlined />} disabled={!hasNext} onClick={() => onIndexChange(index + 1)} />
          </Tooltip>
        </div>
        <div className="flex items-center gap-3">
          <Segmented size="small" value={zoom} onChange={setZoom} options={ZOOMS} />
          {onEdit && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(template)}>
              Edit details
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-[75vh] overflow-auto bg-slate-200/70 p-6">
        {/* The page is drawn at real A4 width and zoomed, so its full height scrolls. */}
        <div className="mx-auto bg-white shadow-xl" style={{ width: A4_WIDTH * zoom }}>
          <div style={{ zoom, width: A4_WIDTH }}>
            {Tmp ? (
              <div className="bg-white p-8">
                <PreviewContext.Provider value={true}>
                  <Tmp />
                </PreviewContext.Provider>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">This template has no layout in the app.</div>
            )}
          </div>
        </div>
        {template.previewImage && (
          <p className="mt-3 text-center text-[12px] text-slate-500">
            Live layout shown above. Students see your uploaded preview image on the template card.
          </p>
        )}
      </div>
    </Modal>
  );
}
