"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { FiArrowLeft, FiLayers, FiLock, FiPlayCircle } from "react-icons/fi";
import { courseBundleCheckoutUrl, formatPrice } from "./access";

// Shown in the lesson player instead of the lessons when the server says the
// student hasn't unlocked this course. The curriculum (titles only — the
// server already removed lesson content) stays visible as a preview.
export default function CourseLockedScreen({ course, access }) {
  const router = useRouter();
  const sections = course?.sections || [];
  const lessonCount = sections.reduce((n, s) => n + (s.topics?.length || 0), 0);
  const bundleOnly = access?.access === "bundle";
  const bundles = access?.bundles || [];
  const detailsUrl = `/student/course/${course?._id}`;

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#EFF5FB]">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-10">
        <button
          type="button"
          onClick={() => router.push("/student/course")}
          className="flex w-fit cursor-pointer items-center gap-2 border-none bg-transparent text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          <FiArrowLeft /> Course Library
        </button>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl text-amber-500">
            <FiLock />
          </div>
          <h1 className="m-0 text-[22px] font-[800] text-slate-800">{course?.title}</h1>
          <p className="mx-auto mt-2 max-w-[520px] text-sm text-slate-500">
            {access?.reason === "hidden"
              ? "This course isn't available right now."
              : bundleOnly
                ? "This course is available only as part of a bundle. Get the bundle to unlock every lesson."
                : "Enroll in this course to unlock every lesson, resource and quiz."}
          </p>

          {access?.reason !== "hidden" && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {bundleOnly ? (
                bundles.map((b) => (
                  <Button
                    key={b._id}
                    type="primary"
                    size="large"
                    icon={<FiLayers />}
                    onClick={() => router.push(courseBundleCheckoutUrl(b._id))}
                  >
                    {b.title} · {formatPrice(b.price)}
                  </Button>
                ))
              ) : (
                <Button type="primary" size="large" onClick={() => router.push(detailsUrl)}>
                  {access?.price > 0 ? `Enroll for ${formatPrice(access.price)}` : "View course"}
                </Button>
              )}
              {!bundleOnly && bundles.length > 0 && (
                <Button size="large" icon={<FiLayers />} onClick={() => router.push(courseBundleCheckoutUrl(bundles[0]._id))}>
                  Save with {bundles[0].title}
                </Button>
              )}
            </div>
          )}
        </div>

        {sections.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Curriculum</span>
              <span className="text-xs font-semibold text-slate-400">
                {sections.length} modules · {lessonCount} lessons
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {sections.map((section, i) => (
                <div key={section._id || i} className="rounded-xl border border-slate-100">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700">
                    {section.title || `Module ${i + 1}`}
                  </div>
                  <ul className="m-0 list-none p-0">
                    {(section.topics || []).map((topic, j) => (
                      <li
                        key={topic._id || j}
                        className="flex items-center justify-between gap-3 px-4 py-2 text-[13px] text-slate-600"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FiPlayCircle className="shrink-0 text-slate-400" />
                          <span className="truncate">{topic.title || `Lesson ${j + 1}`}</span>
                        </span>
                        <FiLock className="shrink-0 text-slate-300" />
                      </li>
                    ))}
                    {!section.topics?.length && <li className="px-4 py-2 text-[13px] text-slate-400">No lessons yet</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
