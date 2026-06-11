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
  downloadImage,
  setDownloadImage,
  resumeTemplateRef,
  // Form Data
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
  // Dynamic Template Component
  Template2,
}) {
  const [activeSectionTab, setActiveSectionTab] = useState("edit");
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
  ]);

  return (
    <div className={styles.container}>
      {/* 1. Header Sticky Action Bar */}
      <div className={styles.actionsBar}>
        <div className={styles.actionsLeft}>
          <Button
            type="default"
            onClick={() => setIsEditing(!isEditing)}
            className={styles.actionsBtn}
          >
            {isEditing ? "Disable Editing" : "Edit Form"}
          </Button>

          {isEditing && (
            <Button
              type="primary"
              onClick={handleSubmit}
              className={`${styles.actionsBtn} ${styles.submitBtn}`}
            >
              Submit Resume
            </Button>
          )}
        </div>

        <Button
          type="primary"
          onClick={() => setDownloadImage(true)}
          className={styles.actionsBtn}
        >
          Download PDF
        </Button>
      </div>

      {/* 2. Tabs Selector (Edit vs Preview) */}
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
              { label: "✏️ Edit Resume", value: "edit" },
              { label: "📄 Resume Preview", value: "preview" },
            ]}
            style={{ fontWeight: 600 }}
          />
        </ConfigProvider>
      </div>

      {/* 3. Render Form or Preview */}
      {activeSectionTab === "edit" ? (
        <div className={styles.editorScrollCon}>
          {isEditing ? (
            <>
              <BasicDetails data={basicDetails} updateField={updateBasicDetail} />
              <Links
                links={links}
                updateLink={updateLink}
                addLink={addLink}
                removeLink={removeLink}
              />
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
              <ProjectDetails
                projects={projectDetails}
                updateProject={updateProject}
                addProject={addProject}
                removeProject={removeProject}
              />
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
              <SkillDetails
                skills={skills}
                updateSkill={updateSkill}
                addSkill={addSkill}
                removeSkill={removeSkill}
              />
              <Language
                languages={languages}
                updateLanguage={updateLanguage}
                addLanguage={addLanguage}
                removeLanguage={removeLanguage}
              />
            </>
          ) : (
            <div className={styles.emptyPreview}>
              <h3>Editing is Disabled</h3>
              <p>Click the "Edit Form" button at the top to start building your resume.</p>
            </div>
          )}
        </div>
      ) : (
        /* Preview Tab */
        <div className={styles.previewWrapper} ref={wrapperRef}>
          <div
            className={styles.scaledContainer}
            style={{
              "--scale-factor": scale,
              "--preview-height": `${previewHeight}px`,
            }}
            ref={scaledRef}
          >
            <Template2
              downloadImage={downloadImage}
              setDownloadImage={setDownloadImage}
              resumeTemplateRef={resumeTemplateRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}
