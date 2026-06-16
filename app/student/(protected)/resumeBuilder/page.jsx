"use client";
"use strict";
import React, { useEffect, useRef, useState } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";

import AccomplishmentDetails from "./components/AccomplishmentDetails";

import Links from "./components/Links";

// import Template2 from "./Templates/components/Template2";
import ProjectDetails from "./components/ProjectsDetails";
import Language from "./components/Languages";
import SkillDetails from "./components/skillsDetails";
import { useSelector } from "react-redux";
import { updateStudent } from "@/redux/slices/student";
import { useDispatch } from "react-redux";
import InternshipsDetails from "./components/internship";
import BasicDetails from "./components/basicDetails";
import ExperienceDetails from "./components/experienceDetails";
import EducationDetails from "./components/educationDetails";

import dynamic from "next/dynamic";
import axios from "axios";
import { restUrl } from "@/config/urls";
// import html2pdf from "html2pdf.js";
import { getLstorage } from "@/universalUtils/windowMW";
import VolunteeringDetails from "./components/volunteringDetails";
import { Button } from "antd";
import CertificateDetails from "./components/certificateDetails";
import useResponsive from "@/hooks/useResponsive";
import MobileResumeBuilder from "@/mobile_views/resumeBuilder/MobileResumeBuilder";
const Template2 = dynamic(() => import("./Templates/components/Template2"), {
  ssr: false,
});
// const html2pdf = dynamic(() => import("html2pdf.js"), {
//   ssr: false,
// });
function Form() {
  useEffect(() => {
    if (typeof self === "undefined") return;
    // your code here that uses self
  }, []);
  const studentDetails = useSelector((state) => state.student.student?.data);

  const personalDetailsResumeBuilder = useSelector((state) => state.personalDetailsResumeBuilder);
  // const [basicDetails, setBasicDetails] = useState({
  //   middleName: "",
  //   firstName: "",
  //   lastName: "",
  //   email: "",
  //   phone: "",
  //   dob: "",
  //   professionalSummary: "",
  //   profile: personalDetailsResumeBuilder?.value?.profile || "",
  // });
  const [basicDetails, setBasicDetails] = useState({
    // middleName: "",
    // firstName: "",
    // lastName: "",
    // email: "",
    // phone: "",
    // dob: "",
    // professionalSummary: "",
    // profile: personalDetailsResumeBuilder?.value?.profile || "",
    middleName: studentDetails?.middleName || "",
      firstName: studentDetails?.firstName || "",
      lastName: studentDetails?.lastName || "",
      email: studentDetails?.email || "",
      phone: studentDetails?.phone || "",
      dob: studentDetails?.dob || "",
      professionalSummary: studentDetails?.professionalSummary || "",
      profile:personalDetailsResumeBuilder?.value?.profile || "",
  });

  const [educationDetails, setEducationDetails] = useState([
    {
      type: "",
      board: "",
      school: "",
      hallticket: "",
      startDate: "",
      endDate: "",
      yearofPass: "",
      gradingSystem: "",
      grade: "",
      city: "",
      description: "",
      stream: "",
    },
  ]);

  const [experienceDetails, setExperienceDetails] = useState([
    {
      id: Date.now(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      city: "",
      description: "",
      type: "work",
    },
  ]);

  const [internships, setInternshipDetails] = useState([
    {
      id: Date.now(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      city: "",
      description: "",
      type: "internship",
    },
  ]);

  const [projectDetails, setProjectDetails] = useState([
    {
      id: Date.now() + 1,
      company: "",
      project: "",
      startDate: "",
      endDate: "",
      city: "",
      description: "",
    },
  ]);

  const [accDetails, setAccDetails] = useState([
    {
      id: Date.now() + 2,
      company: "",
      accomplishment: "",
      startDate: "",
      endDate: "",
      city: "",
      description: "",
    },
  ]);

  const [skills, setSkills] = useState([""]);
  const [languages, setLanguages] = useState([""]);
  const [links, setLinks] = useState([{ title: "", link: "" }]);

  const [isEditing, setIsEditing] = useState(false);
  const [downloadImage, setDownloadImage] = useState(false);

  // Handler updates for basic details
  const updateBasicDetail = (field, value) => {
    setBasicDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Handler updates Education array field
  const updateEducationDetail = (index, field, value) => {
    setEducationDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const [volunteerings, setVolunteerings] = useState([
    {
      id: Date.now() + 3,
      organization: "",
      volunteering: "",
      start: "",
      end: "",
      city: "",
      description: "",
    },
  ]);

  const updateVolunteering = (index, field, value) => {
    setVolunteerings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addVolunteering = () =>
    setVolunteerings((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        organization: "",
        volunteering: "",
        start: "",
        end: "",
        city: "",
        description: "",
      },
    ]);

  const removeVolunteering = (index) =>
    setVolunteerings((prev) => prev.filter((_, i) => i !== index));

  const addEducation = () => {
    setEducationDetails((prev) => [
      ...prev,
      {
        type: "",
        board: "",
        school: "",
        hallticket: "",
        startDate: "",
        endDate: "",
        yearofPass: "",
        gradingSystem: "",
        grade: "",
        city: "",
        description: "",
        stream: "",
      },
    ]);
  };

  const removeEducation = (index) => {
    // if (educationDetails.length === 0) return;
    setEducationDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // Experience handlers
  const updateExperience = (index, field, value) => {
    setExperienceDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addExperience = () => {
    setExperienceDetails((prev) => [
      ...prev,
      {
        id: Date.now(),
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        city: "",
        description: "",
        type: "work",
      },
    ]);
  };

  const removeExperience = (id) => {
    setExperienceDetails((prev) => prev.filter((exp) => exp.id !== id));
  };
  const updateInternship = (index, field, value) => {
    setInternshipDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addInternship = () => {
    setInternshipDetails((prev) => [
      ...prev,
      {
        id: Date.now(),
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        city: "",
        description: "",
        type: "internship",
      },
    ]);
  };

  const removeInternship = (id) => {
    // if (experienceDetails.length === 0) return;
    setInternshipDetails((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Project handlers
  const updateProject = (index, field, value) => {
    setProjectDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addProject = () => {
    setProjectDetails((prev) => [
      ...prev,
      {
        id: Date.now(),
        company: "",
        project: "",
        startDate: "",
        endDate: "",
        city: "",
        description: "",
      },
    ]);
  };

  const removeProject = (index) => {
    // if (projectDetails.length === 0) return;
    setProjectDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // Accomplishments handlers
  const updateAccomplishment = (index, field, value) => {
    setAccDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addAccomplishment = () => {
    setAccDetails((prev) => [
      ...prev,
      {
        id: Date.now(),
        company: "",
        accomplishment: "",
        startDate: "",
        endDate: "",
        city: "",
        description: "",
      },
    ]);
  };

  const removeAccomplishment = (index) => {
    // if (accDetails.length === 0) return;
    setAccDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // Skills handlers
  const updateSkill = (index, value) => {
    setSkills((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addSkill = () => {
    setSkills((prev) => [...prev, ""]);
  };

  const removeSkill = (index) => {
    // if (skills.length === 0) return;
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Languages handlers
  const updateLanguage = (index, value) => {
    setLanguages((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addLanguage = () => {
    setLanguages((prev) => [...prev, ""]);
  };

  const removeLanguage = (index) => {
    // if (languages.length === 0) return;
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  // Links handlers
  const updateLink = (index, field, value) => {
    setLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { title: "", link: "" }]);
  };

  const removeLink = (index) => {
    if (links.length === 0) return;
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Add this with your other state declarations
  const [certificates, setCertificates] = useState([
    {
      id: Date.now() + 4,
      name: "",
      organization: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    },
  ]);

  // Add these handlers with your other handlers
  const updateCertificate = (index, field, value) => {
    setCertificates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCertificate = () => {
    setCertificates((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: "",
        organization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      },
    ]);
  };

  const removeCertificate = (index) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!studentDetails) return;

    // Map only if the data exists; else keep defaults

    setVolunteerings(
      Array.isArray(studentDetails?.volunteerings) &&
        studentDetails.volunteerings.length
        ? studentDetails.volunteerings.map((v) => ({
          ...v,
          id: v.id || Date.now() + Math.random(),
        }))
        : [
          {
            id: Date.now() + 3,
            organization: "",
            volunteering: "",
            start: "",
            end: "",
            city: "",
            description: "",
          },
        ]
    );

    setBasicDetails({
      middleName: studentDetails.middleName || "",
      firstName: studentDetails.firstName || "",
      lastName: studentDetails.lastName || "",
      email: studentDetails.email || "",
      phone: studentDetails.phone || "",
      dob: studentDetails.dob || "",
      professionalSummary: studentDetails.professionalSummary || "",
      profile: studentDetails.profile || "",
      volunteerings,
    });

    setEducationDetails(
      studentDetails.educationDetails?.length
        ? studentDetails.educationDetails
        : [
          {
            type: "",
            board: "",
            school: "",
            hallticket: "",
            startDate: "",
            endDate: "",
            yearofPass: "",
            gradingSystem: "",
            grade: "",
            city: "",
            description: "",
            stream: "",
          },
        ]
    );

    setExperienceDetails(
      studentDetails.experiences?.length
        ? studentDetails.experiences
          ?.filter((e) => e?.type == "work")
          .map((exp) => ({
            ...exp,
            id: exp.id || Date.now(),
          }))
        : [
          {
            id: Date.now(),
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            city: "",
            description: "",
          },
        ]
    );

    setInternshipDetails(
      studentDetails.experiences?.length
        ? studentDetails?.experiences
          ?.filter((e) => e?.type !== "work")
          .map((exp) => ({
            ...exp,
            id: exp.id || Date.now(),
          }))
        : [
          {
            id: Date.now(),
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            city: "",
            description: "",
          },
        ]
    );

    setProjectDetails(
      studentDetails.projects?.length
        ? studentDetails.projects.map((proj) => ({
          ...proj,
          id: proj.id || Date.now(),
        }))
        : [
          {
            id: Date.now(),
            company: "",
            project: "",
            startDate: "",
            endDate: "",
            city: "",
            description: "",
          },
        ]
    );

    setAccDetails(
      studentDetails.accomplishments?.length
        ? studentDetails.accomplishments.map((acc) => ({
          ...acc,
          id: acc.id || Date.now(),
        }))
        : [
          {
            id: Date.now(),
            company: "",
            accomplishment: "",
            startDate: "",
            endDate: "",
            city: "",
            description: "",
          },
        ]
    );

    setSkills(
      studentDetails.technical?.length ? studentDetails.technical : [""]
    );

    setLanguages(
      studentDetails.languages?.length ? studentDetails.languages : [""]
    );

    setLinks(
      studentDetails.links?.length
        ? studentDetails.links
        : [{ title: "", link: "" }]
    );
    setCertificates(
      Array.isArray(studentDetails?.certificates) &&
        studentDetails.certificates.length
        ? studentDetails.certificates.map((cert) => ({
          ...cert,
          id: cert.id || Date.now() + Math.random(),
        }))
        : [
          {
            id: Date.now() + 4,
            name: "",
            organization: "",
            issueDate: "",
            expiryDate: "",
            credentialId: "",
            credentialUrl: "",
          },
        ]
    );
  }, [studentDetails]);

  const dispatch = useDispatch();
  useEffect(() => {
    setBasicDetails({
      ...basicDetails,
      profile: personalDetailsResumeBuilder?.value?.profile,
    });
  }, [personalDetailsResumeBuilder?.value?.profile]);

  const resumeTemplateRef = useRef(null);
  const studentCreds = useSelector((state) => state.student.student);

  useEffect(() => {
    if (typeof self === "undefined") return;
    if (typeof window === "undefined") return;

    // your code here that uses self
  }, []);
  const uploadResume = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    if (!resumeTemplateRef.current) {
      alert("Resume template is not ready. Please wait a moment.");
      return;
    }

    // Configure html2pdf.js
    const opt = {
      margin: 0.5,
      filename: "resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Generate PDF as a 'blob'
    const pdfBlob = await html2pdf()
      .set(opt)
      .from(resumeTemplateRef.current)
      .output("blob");

    // Create FormData to send both file and JSON data
    const formData = new FormData();
    formData.append("resume", pdfBlob, studentCreds?.data?._id + ".pdf");
    formData.append("bucketName", "skillmedha-student-docs");
    formData.append("uniqueName", studentCreds?.data?._id);

    try {
      const { data } = await axios.post(restUrl + "/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ` + getLstorage("token"),
        },
      });

      return data?.fileUrl;
    } catch (error) {
      console.error("Error uploading resume:", error);
    }
  };

  // const handleSubmit = async () => {
  //   const combinedExperiences = [
  //     ...experienceDetails.map((item) => ({ ...item, type: "work" })),
  //     ...internships.map((item) => ({ ...item, type: "internship" })),
  //   ];
  //   const volunteeringPayload =
  //     Array.isArray(volunteerings) && volunteerings.length > 0
  //       ? volunteerings
  //       : studentDetails?.volunteerings || [];
  //   const uploadedResumeFile = await uploadResume();
  //   const resumeData = {
  //     ...basicDetails,
  //     educationDetails,
  //     experiences: combinedExperiences,
  //     projects: projectDetails,
  //     accomplishments: accDetails,
  //     technical: skills,
  //     languages,
  //     links,
  //     resumeDoc: uploadedResumeFile,
  //     volunteerings: volunteeringPayload,
  //   };

  //   try {
  //     dispatch(updateStudent({ aboutDetails: resumeData }));
  //   } catch (error) {
  //     console.error("Error submitting resume:", error);
  //     alert("Something went wrong while submitting.");
  //   }
  // };
  const handleSubmit = async () => {
    const combinedExperiences = [
      ...experienceDetails.map((item) => ({ ...item, type: "work" })),
      ...internships.map((item) => ({ ...item, type: "internship" })),
    ];
    const volunteeringPayload =
      Array.isArray(volunteerings) && volunteerings.length > 0
        ? volunteerings
        : studentDetails?.volunteerings || [];

    const certificatesPayload =
      Array.isArray(certificates) && certificates.length > 0
        ? certificates
        : studentDetails?.certificates || [];

    const uploadedResumeFile = await uploadResume();
    const resumeData = {
      ...basicDetails,
      educationDetails,
      experiences: combinedExperiences,
      projects: projectDetails,
      accomplishments: accDetails,
      technical: skills,
      languages,
      links,
      resumeDoc: uploadedResumeFile,
      volunteerings: volunteeringPayload,
      certificates: certificatesPayload, // Add this line
    };

    try {
      dispatch(updateStudent({ aboutDetails: resumeData }));
    } catch (error) {
      console.error("Error submitting resume:", error);
    }
  };

  const isMobile = useResponsive();

  if (isMobile) {
    return (
      <MobileResumeBuilder
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSubmit={handleSubmit}
        downloadImage={downloadImage}
        setDownloadImage={setDownloadImage}
        resumeTemplateRef={resumeTemplateRef}
        basicDetails={basicDetails}
        updateBasicDetail={updateBasicDetail}
        links={links}
        updateLink={updateLink}
        addLink={addLink}
        removeLink={removeLink}
        experienceDetails={experienceDetails}
        updateExperience={updateExperience}
        addExperience={addExperience}
        removeExperience={removeExperience}
        internships={internships}
        updateInternship={updateInternship}
        addInternship={addInternship}
        removeInternship={removeInternship}
        educationDetails={educationDetails}
        updateEducationDetail={updateEducationDetail}
        addEducation={addEducation}
        removeEducation={removeEducation}
        projectDetails={projectDetails}
        updateProject={updateProject}
        addProject={addProject}
        removeProject={removeProject}
        certificates={certificates}
        updateCertificate={updateCertificate}
        addCertificate={addCertificate}
        removeCertificate={removeCertificate}
        volunteerings={volunteerings}
        updateVolunteering={updateVolunteering}
        addVolunteering={addVolunteering}
        removeVolunteering={removeVolunteering}
        skills={skills}
        updateSkill={updateSkill}
        addSkill={addSkill}
        removeSkill={removeSkill}
        languages={languages}
        updateLanguage={updateLanguage}
        addLanguage={addLanguage}
        removeLanguage={removeLanguage}
        Template2={Template2}
      />
    );
  }

  return (
    <div className="w-full mx-auto p-5">
      <StudentPageHeader section="Tools" title="Resume Builder" />
      <div className="flex justify-between px-4 mb-4 sticky left-0 top-0 z-[100]">
        <Button type="primary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Disable Editing" : "Edit"}
        </Button>
        {isEditing && (
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
        )}
        <Button type="primary" onClick={() => setDownloadImage(true)}>
          Download Resume
        </Button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        {isEditing && (
          <div
            className="flex flex-col gap-4 h-full overflow-y-scroll border border-solid border-[#ccc] p-4 bg-[#f8f8f8] font-['Lexend_Deca'] [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-[#f4f4f4] [&::-webkit-scrollbar-thumb]:bg-[#f4f4f4] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[#f4f4f4]"
            style={{
              width: "50%",
              overflowY: "auto",
              paddingRight: "1rem",
              boxSizing: "border-box",
              borderRight: "1px solid #ccc",
              maxHeight: "80vh",
            }}
          >
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
            {/* <AccomplishmentDetails
                            accDetails={accDetails}
                            updateAccomplishment={updateAccomplishment}
                            addAccomplishment={addAccomplishment}
                            removeAccomplishment={removeAccomplishment}
                        /> */}
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
          </div>
        )}
        <div
          style={{
            width: isEditing ? "50%" : "100%",
            overflowY: "auto",
            maxHeight: "90vh",
            paddingLeft: isEditing ? "1rem" : "0",
            boxSizing: "border-box",
          }}
        >
          <Template2
            downloadImage={downloadImage}
            setDownloadImage={setDownloadImage}
            resumeTemplateRef={resumeTemplateRef}
          />
        </div>
      </div>
    </div>
  );
}

export default Form;
