"use client";

import React from "react";
import { templateComponents } from "@/app/student/(protected)/resumeBuilder/Templates/registry";
import { PreviewContext } from "@/app/student/(protected)/resumeBuilder/Templates/components/resumeTemplateData";

// Miniature of a resume template filled with sample data. Uses the admin's
// uploaded preview image when there is one (cheaper to render), otherwise
// renders the real layout scaled down. `scale` is the zoom of the A4 page.
export default function TemplateThumb({ templateKey, previewImage, height = 220, scale = 0.32, className = "" }) {
  const Tmp = templateComponents[templateKey];

  return (
    <div
      className={`relative w-full overflow-hidden bg-white ${className}`}
      style={{ height }}
      aria-label={`Preview of ${templateKey}`}
    >
      {previewImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewImage} alt="" className="h-full w-full object-cover object-top" />
      ) : Tmp ? (
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{ transform: `scale(${scale})`, width: `${100 / scale}%`, height: `${100 / scale}%` }}
        >
          <div className="h-full w-full bg-white p-8">
            <PreviewContext.Provider value={true}>
              <Tmp />
            </PreviewContext.Provider>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-slate-400">No preview</div>
      )}
    </div>
  );
}
