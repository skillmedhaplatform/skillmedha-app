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
import { HiOutlineDocumentText } from "react-icons/hi2";

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
  const [basicDetails, setBasicDetails] = useState({
    middleName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    professionalSummary: "",
    profile: personalDetailsResumeBuilder?.value?.profile || "",
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

  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState("Basic Details");

  const availableSections = isEditing 
    ? [
        "Basic Details", "Links", "Experience", "Internships", "Education", 
        "Projects", "Certifications", "Volunteering", "Skills", "Languages"
      ]
    : [
        "Basic Details", 
        links?.length > 0 && "Links",
        experienceDetails?.length > 0 && "Experience",
        internships?.length > 0 && "Internships",
        educationDetails?.length > 0 && "Education",
        projectDetails?.length > 0 && "Projects",
        certificates?.length > 0 && "Certifications",
        volunteerings?.length > 0 && "Volunteering",
        skills?.length > 0 && "Skills",
        languages?.length > 0 && "Languages"
      ].filter(Boolean);

  const scrollToSection = (sectionName) => {
    setActiveSection(sectionName);
    if (isEditing) {
      sectionRefs.current[sectionName]?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const el = document.getElementById(`section-${sectionName.replace(" ", "-")}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        activeSection={activeSection}
      />
    );
  }
  


  return (
    <div className="flex flex-col gap-0 relative bg-white h-screen overflow-hidden">
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center p-4 lg:px-8 shadow-sm bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        {/* Decorative Icons */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]">✕</div>
          <div className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]">+</div>
          <div className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]">★</div>
          <div className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]">✕</div>
        </div>

        {/* Top half: Title & Stats */}
        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <HiOutlineDocumentText className="text-white text-3xl" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <h1
                className="text-[24px] lg:text-[28px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-3 pb-0"
                style={{ border: 'none', marginBottom: 0 }}
              >
                Resume Builder
              </h1>
              <p className="text-white/90 text-[14px] lg:text-[15px] m-0 leading-tight" style={{ marginTop: 0 }}>
                Build your professional resume and stand out to recruiters today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Button onClick={() => setIsEditing(!isEditing)} className="!bg-transparent !text-white !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">
               {isEditing ? "Disable Editing" : "Edit Details"}
             </Button>
             {isEditing && (
               <Button onClick={handleSubmit} className="!bg-transparent !text-white !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">
                 Submit
               </Button>
             )}
             <Button onClick={uploadResume} className="!bg-transparent !text-white !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">
               Download Resume
             </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full flex overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-[280px] shrink-0 bg-white border-r border-[#e2e8f0] p-6 flex flex-col gap-6 overflow-y-auto hidden lg:flex">
          <div className="text-[12px] font-bold text-[#94a3b8] tracking-wider uppercase mb-[-10px]">Sections</div>
          
          {/* Profile Completion */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[#334155] text-[13px] font-medium">Profile complete</span>
              <span className="text-[#1E69DA] font-bold text-[14px]">35%</span>
            </div>
            <div className="w-full bg-[#e2e8f0] h-[6px] rounded-full overflow-hidden">
              <div className="bg-[#1E69DA] h-full" style={{ width: "35%" }}></div>
            </div>
            <p className="text-[10px] text-[#94a3b8] m-0 leading-tight mt-1">Add more sections to strengthen your resume</p>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-col gap-2">
              {availableSections.map((item) => (
               <div 
                 key={item} 
                 onClick={() => scrollToSection(item)}
                 className={`group px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer border flex justify-between items-center transition-all ${activeSection === item ? '!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !text-white !border-transparent shadow-sm' : '!bg-transparent !border-transparent text-[#64748b] hover:!bg-white hover:!text-[#1E69DA] hover:!border-[#1E69DA] hover:shadow-sm'}`}
               >
                 {item}
                 <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSection === item ? 'bg-white' : 'bg-[#cbd5e1] group-hover:!bg-[#1E69DA]'}`}></div>
               </div>
             ))}
          </div>
        </div>

        {/* Right Canvas (Scrolling Editor) */}
        <div className="flex-1 h-full overflow-y-auto bg-[#f8fafc] p-6 lg:p-12 relative" onClick={(e) => {
          // Only clear active section if clicking outside the sidebar navigation
          if (!e.target.closest('.group.px-4.py-2\\.5')) {
            setActiveSection(null);
          }
        }}>
          <div className="max-w-[800px] mx-auto flex flex-col gap-6">
            
            {/* If not editing, show Template. If editing, show forms. */}
            {!isEditing ? (
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-[#e2e8f0]">
                <Template2
                  downloadImage={downloadImage}
                  setDownloadImage={setDownloadImage}
                  resumeTemplateRef={resumeTemplateRef}
                  activeSection={activeSection}
                />
              </div>
            ) : (
              <>
                <div ref={(el) => sectionRefs.current["Basic Details"] = el} data-section-name="Basic Details" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-[#1E69DA] text-white p-4 font-semibold">Basic Details</div>
                   <BasicDetails data={basicDetails} updateField={updateBasicDetail} />
                </div>
                
                <div ref={(el) => sectionRefs.current["Links"] = el} data-section-name="Links" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Links <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <Links links={links} updateLink={updateLink} addLink={addLink} removeLink={removeLink} />
                </div>

                <div ref={(el) => sectionRefs.current["Experience"] = el} data-section-name="Experience" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Experience <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <ExperienceDetails experiences={experienceDetails} updateExperience={updateExperience} addExperience={addExperience} removeExperience={removeExperience} />
                </div>

                <div ref={(el) => sectionRefs.current["Internships"] = el} data-section-name="Internships" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Internships <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <InternshipsDetails experiences={internships} updateExperience={updateInternship} addExperience={addInternship} removeExperience={removeInternship} />
                </div>

                <div ref={(el) => sectionRefs.current["Education"] = el} data-section-name="Education" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Education <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <EducationDetails educationDetails={educationDetails} updateEducationDetail={updateEducationDetail} addEducation={addEducation} removeEducation={removeEducation} />
                </div>

                <div ref={(el) => sectionRefs.current["Projects"] = el} data-section-name="Projects" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Projects <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <ProjectDetails projects={projectDetails} updateProject={updateProject} addProject={addProject} removeProject={removeProject} />
                </div>

                <div ref={(el) => sectionRefs.current["Certifications"] = el} data-section-name="Certifications" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Certifications <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <CertificateDetails certificates={certificates} updateCertificate={updateCertificate} addCertificate={addCertificate} removeCertificate={removeCertificate} />
                </div>

                <div ref={(el) => sectionRefs.current["Volunteering"] = el} data-section-name="Volunteering" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Volunteering <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <VolunteeringDetails volunteerings={volunteerings} updateVolunteering={updateVolunteering} addVolunteering={addVolunteering} removeVolunteering={removeVolunteering} />
                </div>

                <div ref={(el) => sectionRefs.current["Skills"] = el} data-section-name="Skills" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Skills <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <SkillDetails skills={skills} updateSkill={updateSkill} addSkill={addSkill} removeSkill={removeSkill} />
                </div>

                <div ref={(el) => sectionRefs.current["Languages"] = el} data-section-name="Languages" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                   <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] flex justify-between items-center text-[15px]">Languages <Button size="small" className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">Add</Button></div>
                   <Language languages={languages} updateLanguage={updateLanguage} addLanguage={addLanguage} removeLanguage={removeLanguage} />
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Form;
