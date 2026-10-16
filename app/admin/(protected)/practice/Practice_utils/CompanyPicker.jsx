"use client";
import React, { useEffect, useState } from "react";
import { App, Checkbox, Empty, Select, Spin, Tag } from "antd";
import { getCompanySources } from "@/redux/slices/admin/cms/practiceSetsSlice";

// Controlled antd Form field for company-wise practice sets. `value` is the
// list of question sources:
//   { subjectId: companyTestId, scope: "company" }                 whole company test
//   { subjectId: companyTestId, section: "Aptitude", scope: "section" }  one section
// each with display titles. Counts follow `difficulty` and exclude coding
// questions (company sets run in the multiple-choice player).

const scopeOf = (sel) => sel.scope || (sel.section ? "section" : "company");

const countFor = (item, difficulty) =>
  (difficulty === "mixed" ? item?.totalQuestions : item?.[`${difficulty}Questions`]) || 0;

export default function CompanyPicker({ value = [], onChange, difficulty = "mixed" }) {
  const { message } = App.useApp();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCompanySources()
      .then((data) => !cancelled && setCompanies(data))
      .catch(() => message.error("Failed to load company tests"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [message]);

  const company = companies.find((c) => c._id === companyId);
  const isWholeCompany = value.some((v) => scopeOf(v) === "company" && v.subjectId === companyId);
  const isSectionSelected = (name) =>
    value.some((v) => scopeOf(v) === "section" && v.subjectId === companyId && v.section === name);

  const toggleCompany = (checked) => {
    // The whole test replaces any section picks of the same company.
    const others = value.filter((v) => v.subjectId !== companyId);
    onChange?.(
      checked
        ? [
            ...others,
            { subjectId: companyId, scope: "company", subjectTitle: company.title, topicTitle: `All of ${company.title}` },
          ]
        : others
    );
  };

  const toggleSection = (name, checked) => {
    const others = value.filter((v) => !(v.subjectId === companyId && v.section === name));
    onChange?.(
      checked
        ? [
            ...others,
            { subjectId: companyId, section: name, scope: "section", subjectTitle: company.title, topicTitle: name },
          ]
        : others
    );
  };

  const qs = (item) => (
    <span className="text-xs text-slate-400">
      ({countFor(item, difficulty)}
      {difficulty === "mixed" ? "" : ` ${difficulty}`} Qs)
    </span>
  );

  return (
    <div className="flex flex-col gap-3">
      <Select
        placeholder="Choose a company"
        loading={loading}
        value={companyId}
        onChange={setCompanyId}
        options={companies.map((c) => ({
          value: c._id,
          label: `${c.title}${c.patternName ? ` · ${c.patternName}` : ""} (${c.totalQuestions} Qs)`,
          color: c.color,
        }))}
        optionRender={(option) => (
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: option.data.color || "#94a3b8" }}
            />
            {option.data.label}
          </span>
        )}
        notFoundContent={
          loading ? <Spin size="small" /> : "No company tests yet — add them under Practice → Company-wise"
        }
        showSearch
        optionFilterProp="label"
        style={{ maxWidth: 420 }}
      />

      {company && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Checkbox
            checked={isWholeCompany}
            disabled={!company.totalQuestions && !isWholeCompany}
            onChange={(e) => toggleCompany(e.target.checked)}
            className="font-semibold"
          >
            Whole test — all questions in {company.title} {qs(company)}
          </Checkbox>

          {company.sections?.length ? (
            <div className="mt-2 border-t border-slate-200 pt-2">
              <div className="mb-1 text-xs font-semibold text-slate-500">Or pick sections</div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {company.sections.map((section) => (
                  <Checkbox
                    key={section.name}
                    checked={isWholeCompany || isSectionSelected(section.name)}
                    disabled={isWholeCompany || (!section.totalQuestions && !isSectionSelected(section.name))}
                    onChange={(e) => toggleSection(section.name, e.target.checked)}
                  >
                    {section.name} {qs(section)}
                  </Checkbox>
                ))}
              </div>
            </div>
          ) : company.totalQuestions ? (
            <div className="mt-2 text-xs text-slate-500">
              This test has no sections — its questions are picked from the whole test.
            </div>
          ) : (
            <Empty
              className="!my-2"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No questions uploaded for this company yet"
            />
          )}
          <div className="mt-2 text-[11px] text-slate-400">
            Coding questions aren&apos;t included — company sets run in the multiple-choice test player.
          </div>
        </div>
      )}

      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-600">Selected ({value.length})</div>
        {value.length ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((sel) => (
              <Tag
                key={`${sel.subjectId}|${sel.section || ""}`}
                closable
                color={scopeOf(sel) === "company" ? "purple" : "geekblue"}
                onClose={(e) => {
                  e.preventDefault();
                  onChange?.(value.filter((v) => v !== sel));
                }}
              >
                {scopeOf(sel) === "company"
                  ? `${sel.subjectTitle} (whole test)`
                  : `${sel.subjectTitle} › ${sel.topicTitle}`}
              </Tag>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">Nothing selected yet</span>
        )}
      </div>
    </div>
  );
}
