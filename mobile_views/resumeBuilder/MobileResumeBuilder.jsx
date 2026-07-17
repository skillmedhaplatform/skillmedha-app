"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button, ConfigProvider, Segmented } from "antd";
import styles from "./mobileResumeBuilder.module.scss";

import BasicDetails from "@/app/student/(protected)/resumeBuilder/components/basicDetails";
import Links from "@/app/student/(protected)/resumeBuilder/components/Links";
import ExperienceDetails from "@/app/student/(protected)/resumeBuilder/components/experienceDetails";
import InternshipsDetails from "@/app/student/(protected)/resumeBuilder/components/internship";
import EducationDetails from "@/app/student/(protected)/resumeBuilder/components/educationDetails";
import ProjectDetails from "@/app/student/(protected)/resumeBuilder/components/ProjectsDetails";
import CertificateDetails from "@/app/student/(protected)/resumeBuilder/components/certificateDetails";
import VolunteeringDetails from "@/app/student/(protected)/resumeBuilder/components/volunteringDetails";
import SkillDetails from "@/app/student/(protected)/resumeBuilder/components/skillsDetails";
import Language from "@/app/student/(protected)/resumeBuilder/components/Languages";

export default function MobileResumeBuilder({
  isEditing,
  setIsEditing,
  handleSubmit,
  handleDownloadResume,
  resumeTemplateRef,
  basicDetails,
  updateBasicDetail,
  links,
  updateLink,
  addLink,
  removeLink,
  experienceDetails,
  updateExperience,
  addExperience,
  removeExperience,
  internships,
  updateInternship,
  addInternship,
  removeInternship,
  educationDetails,
  updateEducationDetail,
  addEducation,
  removeEducation,
  projectDetails,
  updateProject,
  addProject,
  removeProject,
  certificates,
  updateCertificate,
  addCertificate,
  removeCertificate,
  volunteerings,
  updateVolunteering,
  addVolunteering,
  removeVolunteering,
  skills,
  updateSkill,
  addSkill,
  removeSkill,
  languages,
  updateLanguage,
  addLanguage,
  removeLanguage,
  templateOptions,
  templateFilters,
  selectedTemplate,
  setSelectedTemplate,
  SelectedTemplate,
  builderStep,
  setBuilderStep,
  isGeneratingPdf,
}) {
  const [activeSectionTab, setActiveSectionTab] = useState("edit");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [scale, setScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(1130);
  const wrapperRef = useRef(null);
  const scaledRef = useRef(null);

  useEffect(() => {
    if (activeSectionTab !== "preview") return;
    const updateScale = () => {
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.clientWidth - 32;
        const targetWidth = 800;
        const factor = Math.min(1, containerWidth / targetWidth);
        setScale(factor);

        if (scaledRef.current) {
          const firstChild = scaledRef.current.firstElementChild;
          if (firstChild) {
            setPreviewHeight(firstChild.scrollHeight);
          }
        }
      }
    };

    const timer = setTimeout(updateScale, 150);
    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
    };
  }, [
    activeSectionTab,
    basicDetails,
    educationDetails,
    experienceDetails,
    projectDetails,
    certificates,
    volunteerings,
    skills,
    languages,
    selectedTemplate,
  ]);

  const filteredTemplateOptions =
    templateFilter === "all"
      ? templateOptions
      : templateOptions.filter((template) => template.audience === templateFilter);

  return (
    <div className={styles.container}>
      <div className={styles.actionsBar}>
        <div className={styles.actionsLeft}>
          <Button
            type="default"
            onClick={() => {
              if (builderStep === "choose") {
                setBuilderStep("build");
                setIsEditing(true);
                return;
              }
              setIsEditing(!isEditing);
            }}
            className={styles.actionsBtn}
          >
            {isEditing ? "Disable Editing" : "Edit Form"}
          </Button>

          {isEditing && builderStep === "build" && (
            <Button type="primary" onClick={handleSubmit} className={`${styles.actionsBtn} ${styles.submitBtn}`}>
              Submit Resume
            </Button>
          )}
        </div>

        <Button type="primary" onClick={handleDownloadResume} loading={isGeneratingPdf} className={styles.actionsBtn}>
          Download PDF
        </Button>
      </div>

      <div className={styles.tabsBar}>
        <ConfigProvider
          theme={{
            components: {
              Segmented: {
                itemSelectedBg: "#24A058",
                itemSelectedColor: "#ffffff",
                itemActiveBg: "#24A058",
                trackBg: "rgba(39,174,96,0.1)",
                fontSize: 14,
              },
            },
          }}
        >
          <Segmented
            block
            value={activeSectionTab}
            onChange={setActiveSectionTab}
            options={[
              { label: "Edit Resume", value: "edit" },
              { label: "Resume Preview", value: "preview" },
            ]}
            style={{ fontWeight: 600 }}
          />
        </ConfigProvider>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(templateFilters || [{ id: "all", label: "All" }]).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTemplateFilter(item.id)}
              className={`min-w-max rounded-full border px-3 py-1.5 text-[11px] font-semibold ${templateFilter === item.id ? "border-[#24A058] bg-[#24A058] text-white" : "border-[#d1d5db] bg-white text-[#4b5563]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {filteredTemplateOptions.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setSelectedTemplate(template.id);
                setBuilderStep("build");
                setIsEditing(true);
              }}
              className={`min-w-[200px] rounded-lg border p-3 text-left ${selectedTemplate === template.id ? "border-[#24A058] bg-[#f0fdf4]" : "border-[#e2e8f0] bg-white"}`}
            >
              <div className="text-[13px] font-semibold text-[#0f172a]">{template.label}</div>
              <div className="mt-1 text-[11px] text-[#64748b]">{template.summary}</div>
            </button>
          ))}
        </div>
      </div>

      {builderStep === "choose" ? (
        <div className="p-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
            <h3 className="m-0 text-[18px] font-bold text-[#0f172a]">Choose a Template</h3>
            <p className="mt-2 mb-4 text-[13px] text-[#64748b]">Select one template to start filling your data.</p>
            <div className="grid gap-3">
              {filteredTemplateOptions.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setBuilderStep("build");
                    setIsEditing(true);
                  }}
                  className={`rounded-lg border p-3 text-left ${selectedTemplate === template.id ? "border-[#24A058] bg-[#f0fdf4]" : "border-[#e2e8f0] bg-white"}`}
                >
                  <div className="text-[13px] font-semibold text-[#0f172a]">{template.label}</div>
                  <div className="mt-1 text-[11px] text-[#64748b]">{template.summary}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeSectionTab === "edit" ? (
        <div className={styles.editorScrollCon}>
          {isEditing ? (
            <>
              <BasicDetails data={basicDetails} updateField={updateBasicDetail} />
              <Links links={links} updateLink={updateLink} addLink={addLink} removeLink={removeLink} />
              <ExperienceDetails
                experiences={experienceDetails}
                updateExperience={updateExperience}
                addExperience={addExperience}
                removeExperience={removeExperience}
              />
              <InternshipsDetails
                experiences={internships}
                updateExperience={updateInternship}
                addExperience={addInternship}
                removeExperience={removeInternship}
              />
              <EducationDetails
                educationDetails={educationDetails}
                updateEducationDetail={updateEducationDetail}
                addEducation={addEducation}
                removeEducation={removeEducation}
              />
              <ProjectDetails projects={projectDetails} updateProject={updateProject} addProject={addProject} removeProject={removeProject} />
              <CertificateDetails
                certificates={certificates}
                updateCertificate={updateCertificate}
                addCertificate={addCertificate}
                removeCertificate={removeCertificate}
              />
              <VolunteeringDetails
                volunteerings={volunteerings}
                updateVolunteering={updateVolunteering}
                addVolunteering={addVolunteering}
                removeVolunteering={removeVolunteering}
              />
              <SkillDetails skills={skills} updateSkill={updateSkill} addSkill={addSkill} removeSkill={removeSkill} />
              <Language languages={languages} updateLanguage={updateLanguage} addLanguage={addLanguage} removeLanguage={removeLanguage} />
            </>
          ) : (
            <div className={styles.emptyPreview}>
              <h3>Editing is Disabled</h3>
              <p>Click Edit Form at the top to start building your resume.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.previewWrapper} ref={wrapperRef}>
          <div
            className={styles.scaledContainer}
            style={{
              "--scale-factor": scale,
              "--preview-height": `${previewHeight}px`,
            }}
            ref={scaledRef}
          >
            <SelectedTemplate
              downloadImage={false}
              setDownloadImage={() => {}}
              resumeTemplateRef={resumeTemplateRef}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>
        </div>
      )}
    </div>
  );
}
