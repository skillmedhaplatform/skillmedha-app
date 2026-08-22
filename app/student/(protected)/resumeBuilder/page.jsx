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
import ProfessionalSummary from "./components/ProfessionalSummary";
import { HiOutlineDocumentText } from "react-icons/hi2";
import {
  FileTextOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  UnorderedListOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  FileAddOutlined,
  StarOutlined,
  EditOutlined,
  DownloadOutlined,
  FilterOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
  DesktopOutlined,
  MobileOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UserOutlined,
  BookOutlined,
  SolutionOutlined,
  CheckSquareOutlined,
  CodeOutlined,
  LinkOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  AppstoreOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import axios from "axios";
import { restUrl } from "@/config/urls";
// import html2pdf from "html2pdf.js";
import { getLstorage } from "@/universalUtils/windowMW";
import VolunteeringDetails from "./components/volunteringDetails";
import { PreviewContext, ResumeEditorContext } from "./Templates/components/resumeTemplateData";
import { Button, message, Modal } from "antd";
import CertificateDetails from "./components/certificateDetails";
import useResponsive from "@/hooks/useResponsive";
import MobileResumeBuilder from "@/mobile_views/resumeBuilder/MobileResumeBuilder";
import ATSCheckerSection from "./components/ATSCheckerSection";
const Template1 = dynamic(() => import("./Templates/components/Template3"), {
  ssr: false,
});
const Template2 = dynamic(() => import("./Templates/components/Template2"), {
  ssr: false,
});
const Template3 = dynamic(() => import("./Templates/components/Template1"), {
  ssr: false,
});
const Template4 = dynamic(() => import("./Templates/components/Template4"), {
  ssr: false,
});
const Template5 = dynamic(() => import("./Templates/components/Template5"), {
  ssr: false,
});
const Template6 = dynamic(() => import("./Templates/components/Template6"), {
  ssr: false,
});
const Template7 = dynamic(() => import("./Templates/components/Template7"), {
  ssr: false,
});
const Template8 = dynamic(() => import("./Templates/components/Template8"), {
  ssr: false,
}); const Template9 = dynamic(() => import("./Templates/components/Template9"), {
  ssr: false,
});
const Template10 = dynamic(() => import("./Templates/components/Template10"), {
  ssr: false,
}); const Template11 = dynamic(() => import("./Templates/components/Template11"), {
  ssr: false,
}); const Template12 = dynamic(() => import("./Templates/components/Template12"), {
  ssr: false,
}); const Template13 = dynamic(() => import("./Templates/components/Template13"), {
  ssr: false,
}); const Template14 = dynamic(() => import("./Templates/components/Template14"), {
  ssr: false,
}); const Template15 = dynamic(() => import("./Templates/components/Template15"), {
  ssr: false,
}); const Template16 = dynamic(() => import("./Templates/components/Template16"), {
  ssr: false,
}); const Template17 = dynamic(() => import("./Templates/components/Template17"), {
  ssr: false,
}); const Template18 = dynamic(() => import("./Templates/components/Template18"), {
  ssr: false,
}); const Template19 = dynamic(() => import("./Templates/components/Template19"), {
  ssr: false,
}); const Template20 = dynamic(() => import("./Templates/components/Template20"), {
  ssr: false,
});
const Template21 = dynamic(() => import("./Templates/components/Template21"), {
  ssr: false,
});
const Template22 = dynamic(() => import("./Templates/components/Template22"), {
  ssr: false,
});
const Template23 = dynamic(() => import("./Templates/components/Template23"), {
  ssr: false,
});
const Template24 = dynamic(() => import("./Templates/components/Template24"), {
  ssr: false,
});
const Template25 = dynamic(() => import("./Templates/components/Template25"), {
  ssr: false,
});
const Template26 = dynamic(() => import("./Templates/components/Template26"), {
  ssr: false,
});
const Template27 = dynamic(() => import("./Templates/components/Template27"), {
  ssr: false,
});
const Template28 = dynamic(() => import("./Templates/components/Template28"), {
  ssr: false,
});
const Template29 = dynamic(() => import("./Templates/components/Template29"), {
  ssr: false,
});
const Template30 = dynamic(() => import("./Templates/components/Template30"), {
  ssr: false,
});
const Template31 = dynamic(() => import("./Templates/components/Template31"), {
  ssr: false,
});
const Template32 = dynamic(() => import("./Templates/components/Template32"), {
  ssr: false,
});
const Template33 = dynamic(() => import("./Templates/components/Template33"), {
  ssr: false,
});
const Template34 = dynamic(() => import("./Templates/components/Template34"), {
  ssr: false,
});
const Template35 = dynamic(() => import("./Templates/components/Template35"), {
  ssr: false,
});
const Template36 = dynamic(() => import("./Templates/components/Template36"), {
  ssr: false,
});
const Template37 = dynamic(() => import("./Templates/components/Template37"), {
  ssr: false,
});
const Template38 = dynamic(() => import("./Templates/components/Template38"), {
  ssr: false,
});
const Template39 = dynamic(() => import("./Templates/components/Template39"), {
  ssr: false,
});
const Template40 = dynamic(() => import("./Templates/components/Template40"), {
  ssr: false,
});
const TEMPLATE_SWATCHES = [
  "#1E69DA", "#e8447a", "#1C8A63", "#9c6ade", "#d97706", "#0f6f66", "#be185d", "#4f46e5",
];
const swatchFor = (index) => TEMPLATE_SWATCHES[index % TEMPLATE_SWATCHES.length];

const TEMPLATE_OPTIONS = [
  {
    id: "template1",
    label: "Template1",
    // description: "Clean single-column layout for freshers, internships, and campus hiring.",
  },
  {
    id: "template2",
    label: "Template2",
    // description: "Balanced layout for internships, placements, and early-career roles.",
  },
  {
    id: "template3",
    label: "Template3",
    // description: "Refined sidebar layout for students and experienced professionals.",
  },
  {
    id: "template4",
    label: "Template4",
    // description: "Compact recruiter-friendly format for job portals and screenings.",
  },
  {
    id: "template5",
    label: "Template5",
    // description: "Polished two-column resume for experienced candidates and leadership roles.",
  },
  {
    id: "template6",
    label: "Template6",
    // description: "Modern minimalist design with clean typography.",
  },
  {
    id: "template7",
    label: "Template7",
    // description: "Creative accent layout with colorful section headers.",
  },
  {
    id: "template8",
    label: "Template8",
    // description: "Creative accent layout with colorful section headers.",
  },
  {
    id: "template9",
    label: "Template9",
    // description: "Creative accent layout with colorful section headers.",
  },
  { id: "template10", label: "Template10" },
  { id: "template11", label: "Template11" },
  { id: "template12", label: "Template12" },
  { id: "template13", label: "Template13" },
  { id: "template14", label: "Template14" },
  { id: "template15", label: "Template15" },
  { id: "template16", label: "Template16" },
  { id: "template17", label: "Template17" },
  { id: "template18", label: "Template18" },
  { id: "template19", label: "Template19" },
  { id: "template20", label: "Template20" },
  { id: "template21", label: "Template21" },
  { id: "template22", label: "Template22" },
  { id: "template23", label: "Template23" },
  { id: "template24", label: "Template24" },
  { id: "template25", label: "Template25" },
  { id: "template26", label: "Template26" },
  { id: "template27", label: "Template27" },
  { id: "template28", label: "Template28" },
  { id: "template29", label: "Template29" },
  { id: "template30", label: "Template30" },
  { id: "template31", label: "Template31" },
  { id: "template32", label: "Template32" },
  { id: "template33", label: "Template33" },
  { id: "template34", label: "Template34" },
  { id: "template35", label: "Template35" },
  { id: "template36", label: "Template36" },
  { id: "template37", label: "Template37" },
  { id: "template38", label: "Template38" },
  { id: "template39", label: "Template39" },
  { id: "template40", label: "Template40" },
];
// const html2pdf = dynamic(() => import("html2pdf.js"), {
//   ssr: false,
// });

const AccordionSection = ({ title, icon, isExpanded, onToggle, onRemove, children }) => {
  return (
    <div className="bg-white rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden mb-4 transition-all duration-300">
      <div
        className="px-5 py-4 cursor-pointer flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="text-[#1E69DA] text-[20px] flex items-center justify-center">{icon}</div>
          <span className="font-semibold text-[#0f172a] text-[16px]">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-[#ef4444] hover:text-[#dc2626] bg-transparent border-none cursor-pointer text-[13px] font-medium"
            >
              Remove
            </button>
          )}
          <div className={`text-[#64748b] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="p-5 border-t border-[#e2e8f0] bg-white animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

function Form() {
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  const [loading, setLoading] = useState(false);
  const nav = useRouter();
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
  const defaultSummary = "Motivated Computer Science graduate with a strong foundation in Java, Data Structures, SQL, and Web Development. Passionate about building user-friendly applications and continuously learning new technologies. Seeking an opportunity to contribute technical skills while growing as a software engineer.";

  const getSummary = (val) => {
    if (!val) return defaultSummary;
    let v = val;
    if (typeof v === 'string') {
      v = v.trim();
      while (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (v === "" || v === "<p><br></p>" || v === "<p></p>") return defaultSummary;
    }
    return val;
  };

  const [basicDetails, setBasicDetails] = useState({
    middleName: studentDetails?.middleName || "",
    firstName: studentDetails?.firstName || "",
    lastName: studentDetails?.lastName || "",
    email: studentDetails?.email || "",
    phone: studentDetails?.phone || "",
    dob: studentDetails?.dob || "",
    professionalSummary: getSummary(studentDetails?.professionalSummary),
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

  const [isEditing, setIsEditing] = useState(true);
  const [downloadImage, setDownloadImage] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedSection, setExpandedSection] = useState(null);
  const [visibleOptionalSections, setVisibleOptionalSections] = useState([]);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(true);
  const [previewOptionalSection, setPreviewOptionalSection] = useState("Certifications");

  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resumeBuilder_lastTemplate');
      return saved || "template1";
    }
    return "template1";
  });
  const [templateAccent, setTemplateAccent] = useState("#1E69DA");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewScale, setPreviewScale] = useState(65);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("resumeBuilderStep") || "landing";
    }
    return "landing";
  });

  // Track the template ID that the current state belongs to
  const currentStateTemplateRef = useRef(null);

  // Track download status for the warning popup
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedTemplate) {
      localStorage.setItem('resumeBuilder_lastTemplate', selectedTemplate);
    }
  }, [selectedTemplate]);

  // Removed step persistence to always show landing page on section open


  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDownloadWarningModal, setShowDownloadWarningModal] = useState(false);

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

    const draftKey = `resumeDraft_${selectedTemplate}`;
    const savedDraftStr = localStorage.getItem(draftKey);

    if (savedDraftStr) {
      try {
        const savedDraft = JSON.parse(savedDraftStr);
        const savedBasicDetails = savedDraft.basicDetails || {};
        setBasicDetails({
          ...savedBasicDetails,
          professionalSummary: getSummary(savedBasicDetails.professionalSummary || studentDetails?.professionalSummary)
        });
        setEducationDetails(savedDraft.educationDetails?.length ? savedDraft.educationDetails : [{
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
        }]);
        setExperienceDetails(savedDraft.experienceDetails?.length ? savedDraft.experienceDetails : [{
          id: Date.now(),
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          city: "",
          description: "",
          type: "work",
        }]);
        setInternshipDetails(savedDraft.internships?.length ? savedDraft.internships : [{
          id: Date.now(),
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          city: "",
          description: "",
          type: "internship",
        }]);
        setProjectDetails(savedDraft.projectDetails?.length ? savedDraft.projectDetails : [{
          id: Date.now() + 1,
          company: "",
          project: "",
          startDate: "",
          endDate: "",
          city: "",
          description: "",
        }]);
        setAccDetails(savedDraft.accDetails);
        setSkills(savedDraft.skills);
        setLanguages(savedDraft.languages);
        setLinks(savedDraft.links);
        setCertificates(savedDraft.certificates);
        setVolunteerings(savedDraft.volunteerings);
        currentStateTemplateRef.current = selectedTemplate;
        return;
      } catch (e) {
        console.error("Failed to load draft from localStorage", e);
      }
    }

    // Use the saved visible optional sections if they exist
    // This ensures sections stay visible until the user explicitly removes them.
    // Otherwise, start with an empty array.
    setVisibleOptionalSections(savedDraftStr ? (JSON.parse(savedDraftStr).visibleOptionalSections || []) : []);

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
      professionalSummary: getSummary(studentDetails.professionalSummary),
      profile: personalDetailsResumeBuilder?.value?.profile || "",
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

    currentStateTemplateRef.current = selectedTemplate;
  }, [studentDetails, selectedTemplate]);

  // Auto-save effect
  useEffect(() => {
    // Only save if the state matches the currently selected template
    // This prevents overwriting the new template's draft with old template's state during transition
    if (currentStateTemplateRef.current !== selectedTemplate) return;
    if (!studentDetails || !selectedTemplate) return;

    const draftKey = `resumeDraft_${selectedTemplate}`;
    const draftData = {
      basicDetails,
      educationDetails,
      experienceDetails,
      internships,
      projectDetails,
      accDetails,
      skills,
      languages,
      links,
      certificates,
      volunteerings,
      visibleOptionalSections,
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));

    // Track if they made changes after download
    if (hasDownloaded) {
      setHasUnsavedEdits(true);
      if (step === 'editor') {
        setShowDownloadWarningModal(true);
      }
    }
  }, [
    basicDetails, educationDetails, experienceDetails, internships,
    projectDetails, accDetails, skills, languages, links,
    certificates, volunteerings, visibleOptionalSections, selectedTemplate, studentDetails, hasDownloaded, step
  ]);

  const dispatch = useDispatch();
  useEffect(() => {
    setBasicDetails({
      ...basicDetails,
      profile: personalDetailsResumeBuilder?.value?.profile,
    });
  }, [personalDetailsResumeBuilder?.value?.profile]);

  const resumeTemplateRef = useRef(null);
  const exportTemplateRef = useRef(null);
  const studentCreds = useSelector((state) => state.student.student);

  useEffect(() => {
    if (typeof self === "undefined") return;
    if (typeof window === "undefined") return;

    // your code here that uses self
  }, []);

  const waitForImagesInNode = async (node) => {
    if (!node) return;
    const images = Array.from(node.querySelectorAll("img"));
    if (!images.length) return;

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
      })
    );
  };

  const createPrintableClone = async () => {
    if (!exportTemplateRef.current) return null;

    const source = exportTemplateRef.current;
    const clone = source.cloneNode(true);

    // Force a stable print layout so html2pdf does not capture zero-height content.
    clone.style.width = "794px";
    clone.style.maxWidth = "794px";
    clone.style.minHeight = "1123px";
    clone.style.height = "auto";
    clone.style.overflow = "visible";
    clone.style.background = "#ffffff";
    clone.style.margin = "0";
    clone.style.padding = "0";

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-10000px";   // move off-screen instead of hiding
    wrapper.style.top = "0";
    wrapper.style.width = "794px";
    wrapper.style.height = "auto";
    wrapper.style.background = "#ffffff";
    wrapper.style.zIndex = "-9999";
    wrapper.style.pointerEvents = "none";
    // no visibility:hidden and no opacity:0 — html2canvas needs the
    // element to be genuinely "visible" (just off-screen) to paint it
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      await waitForImagesInNode(wrapper);
    } catch (imgErr) {
      console.warn("Image loading warning:", imgErr);
      // Continue even if images fail to load - we'll use fallbacks
    }

    try {
      // If the 'Inter' web font (or the icon font the ant-design icons
      // rely on) hasn't finished loading yet, html2canvas rasterizes the
      // clone with fallback font metrics instead. Text sized/positioned
      // against the real font then comes out a different height, which is
      // exactly what throws off anything vertically centered against it —
      // e.g. the mail/phone icons sitting next to the contact text, which
      // looks perfectly aligned on screen (real font already loaded there)
      // but shifts in the exported canvas. Waiting on the standard Font
      // Loading API before capture avoids that mismatch.
      if (document?.fonts?.ready) {
        await document.fonts.ready;
      }
    } catch (fontErr) {
      console.warn("Font loading warning:", fontErr);
    }

    return {
      node: wrapper,
      dispose: () => {
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      },
    };
  };

  const uploadResume = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      if (!exportTemplateRef.current) {
        alert("Resume template is not ready. Please wait a moment.");
        return;
      }

      const printable = await createPrintableClone();
      if (!printable?.node) {
        alert("Resume template is not ready. Please wait a moment.");
        return;
      }

      try {
        // Use html2canvas to convert to canvas
        let canvas;
        try {
          canvas = await html2canvas(printable.node, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
          });
        } catch (canvasErr) {
          console.error("html2canvas failed during upload:", canvasErr instanceof Error ? canvasErr.message : String(canvasErr));
          throw new Error(`Canvas rendering failed: ${canvasErr instanceof Error ? canvasErr.message : String(canvasErr)}`);
        }

        if (!canvas) {
          throw new Error("Canvas rendering returned null");
        }

        // Convert canvas to image and create PDF
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "in",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

        // Generate blob from PDF
        const pdfBlob = pdf.output("blob");

        if (!pdfBlob || !(pdfBlob instanceof Blob)) {
          throw new Error("PDF generation returned invalid blob");
        }

        // Create FormData to send both file and JSON data
        const formData = new FormData();
        formData.append("resume", pdfBlob, studentCreds?.data?._id + ".pdf");
        formData.append("bucketName", "skillmedha-uploads");
        formData.append("uniqueName", studentCreds?.data?._id);

        const { data } = await axios.post(restUrl + "/upload-resume", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ` + getLstorage("token"),
          },
        });

        return data?.fileUrl;
      } finally {
        printable.dispose();
      }
    } catch (error) {
      console.error("Error uploading resume:", error instanceof Error ? error.message : String(error));
      throw error;
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
  const processSubmit = async () => {
    setIsSubmitting(true);
    try {
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

      await dispatch(updateStudent({ aboutDetails: resumeData })).unwrap();
      message.success("Resume saved successfully!");
      return true;
    } catch (error) {
      console.error("Error submitting resume:", error);
      message.error("Failed to update resume.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setShowSubmitModal(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("resumeBuilderStep", step);
    }
  }, [step]);

  const [leftTab, setLeftTab] = useState("details");

  const getTemplateCategory = (id) => {
    const num = parseInt(id.replace("template", ""), 10);
    if (isNaN(num)) return "Modern";
    if (num % 4 === 1) return "Modern";
    if (num % 4 === 2) return "Minimal";
    if (num % 4 === 3) return "Professional";
    return "Creative";
  };
  const templateComponents = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
    template4: Template4,
    template5: Template5,
    template6: Template6,
    template7: Template7,
    template8: Template8,
    template9: Template9,
    template10: Template10,
    template11: Template11,
    template12: Template12,
    template13: Template13,
    template14: Template14,
    template15: Template15,
    template16: Template16,
    template17: Template17,
    template18: Template18,
    template19: Template19,
    template20: Template20,
    template21: Template21,
    template22: Template22,
    template23: Template23,
    template24: Template24,
    template25: Template25,
    template26: Template26,
    template27: Template27,
    template28: Template28,
    template29: Template29,
    template30: Template30,
    template31: Template31,
    template32: Template32,
    template33: Template33,
    template34: Template34,
    template35: Template35,
    template36: Template36,
    template37: Template37,
    template38: Template38,
    template39: Template39,
    template40: Template40,

  };

  const SelectedTemplateComponent =
    templateComponents[selectedTemplate] || Template1;

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

  const calculateProfileCompletion = () => {
    let score = 0;

    // Basic Details (20%)
    if (basicDetails?.firstName || basicDetails?.lastName || basicDetails?.email || basicDetails?.phone) score += 10;
    if (basicDetails?.professionalSummary || basicDetails?.profile) score += 10;

    // Education (20%)
    if (educationDetails?.length > 0 && (educationDetails[0].school || educationDetails[0].type || educationDetails[0].board)) score += 20;

    // Experience (15%)
    if (experienceDetails?.length > 0 && (experienceDetails[0].company || experienceDetails[0].role)) score += 15;

    // Projects (15%)
    if (projectDetails?.length > 0 && (projectDetails[0].project || projectDetails[0].company)) score += 15;

    // Skills (10%)
    if (skills?.length > 0 && skills[0] !== "") score += 10;

    // Certifications, Internships, Volunteering, Languages (20% total, 5% each)
    if (certificates?.length > 0 && (certificates[0].name || certificates[0].organization)) score += 5;
    if (internships?.length > 0 && (internships[0].company || internships[0].role)) score += 5;
    if (volunteerings?.length > 0 && (volunteerings[0].organization || volunteerings[0].volunteering)) score += 5;
    if (languages?.length > 0 && languages[0] !== "") score += 5;

    return score;
  };

  const completionPercentage = calculateProfileCompletion();

  const handleDownloadResume = async () => {
    setIsGeneratingPdf(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      if (!exportTemplateRef.current) {
        alert("Resume template is not ready. Please wait a moment.");
        return;
      }

      const printable = await createPrintableClone();
      if (!printable?.node) {
        alert("Resume template is not ready. Please wait a moment.");
        return;
      }

      try {
        // Use html2canvas first to debug rendering issues
        let canvas;
        try {
          canvas = await html2canvas(printable.node, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
          });
        } catch (canvasErr) {
          console.error("html2canvas failed:", canvasErr instanceof Error ? canvasErr.message : String(canvasErr));
          throw new Error(`Canvas rendering failed: ${canvasErr instanceof Error ? canvasErr.message : String(canvasErr)}`);
        }

        if (!canvas) {
          throw new Error("Canvas rendering returned null");
        }

        // Convert canvas to image and create PDF
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "in",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

        // Generate blob from PDF
        const pdfBlob = pdf.output("blob");

        if (!pdfBlob || !(pdfBlob instanceof Blob)) {
          throw new Error("PDF generation returned invalid blob");
        }

        try {
          const downloadUrl = URL.createObjectURL(pdfBlob);
          const anchor = document.createElement("a");
          anchor.href = downloadUrl;
          anchor.download = `${studentDetails?.firstName || "resume"}-resume.pdf`;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(downloadUrl);

          setHasDownloaded(true);
          setHasUnsavedEdits(false);
        } catch (downloadErr) {
          console.error("Download failed:", downloadErr instanceof Error ? downloadErr.message : String(downloadErr));
          throw new Error(`Download failed: ${downloadErr instanceof Error ? downloadErr.message : String(downloadErr)}`);
        }
      } finally {
        printable.dispose();
      }
    } catch (error) {
      console.error("Error downloading resume:", error instanceof Error ? error.message : String(error));
      alert(`Failed to download resume: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isMobile = useResponsive(768);

  const hiddenExportTemplate = (
    <div
      className="pointer-events-none fixed left-[-10000px] top-0 z-[-1] opacity-0"
      style={{ width: "794px" }}
      aria-hidden="true"
    >
      <SelectedTemplateComponent
        downloadImage={false}
        setDownloadImage={() => { }}
        resumeTemplateRef={exportTemplateRef}
        activeSection={null}
        isGeneratingPdf={true}
        accent={templateAccent}
        onAccentChange={setTemplateAccent}
      />
    </div>
  );

  if (step === 'ats_checker') {
    return <ATSCheckerSection onBack={() => setStep('landing')} />;
  }

  if (step === 'landing') {
    return (
      <div className="flex flex-col gap-0 relative bg-[#EFF5FB] h-full overflow-hidden w-full">
        <StudentPageHeader title="Resume Builder" subtitle="Create your professional resume" />
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-0 pt-4 md:pt-6 lg:pt-6 flex flex-col items-center justify-start relative w-full h-full">
          <div className="z-10 flex flex-col items-center justify-evenly min-h-[95%] w-full max-w-[1600px] min-[1600px]:[zoom:1.1] min-[1920px]:[zoom:1.25]">

            {/* Steps Graphic Top Section */}
            {/* Steps Graphic Top Section */}
            <div className="w-full max-w-[1200px] mb-4 md:mb-2 relative block mt-2">

              {/* Wavy SVG Line */}
              <div className="absolute top-[64px] md:top-[87px] left-[12.5%] right-[12.5%] h-[16px] md:h-[24px] -z-10">
                <svg width="100%" height="100%" viewBox="0 0 100 24" preserveAspectRatio="none" className="overflow-visible">
                  <path
                    d="M0,24 C 16.66,24 16.66,0 33.33,0 C 50,0 50,24 66.66,24 C 83.33,24 83.33,0 100,0 C 105,0 108,-4 110,-10"
                    fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Paper Plane */}
              <div className="absolute top-[44px] md:top-[64px] right-[4%] scale-75 md:scale-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#818cf8" className="rotate-[-10deg]">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>

              <div className="flex justify-between items-start w-full relative">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center w-1/4 relative z-10 px-1 md:px-2 mt-[16px] md:mt-[24px]">
                  <div className="w-[44px] h-[44px] md:w-[64px] md:h-[64px] rounded-full bg-white flex items-center justify-center mb-3 md:mb-4 shadow-[0_4px_20px_rgba(59,130,246,0.12)] border border-[#eff6ff] relative">
                    <div className="w-[32px] h-[32px] md:w-[50px] md:h-[50px] rounded-full bg-[#eff6ff] flex items-center justify-center border border-[#bfdbfe]">
                      <HiOutlineDocumentText className="text-[16px] md:text-[24px] text-[#3b82f6]" />
                    </div>
                    {/* Sparkles */}
                    <svg viewBox="0 0 24 24" fill="#bfdbfe" className="w-2 h-2 md:w-3 md:h-3 absolute -top-1 -left-2"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                    <svg viewBox="0 0 24 24" fill="#bfdbfe" className="w-3 h-3 md:w-4 md:h-4 absolute top-1 -right-3"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                  </div>
                  <div className="w-2 h-2 md:w-3.5 md:h-3.5 rounded-full bg-[#3b82f6] mb-2 md:mb-4 shadow-[0_0_0_3px_#EFF5FB] md:shadow-[0_0_0_5px_#EFF5FB]"></div>
                  <h4 className="text-[10px] md:text-[14px] font-bold text-[#0f172a] mb-1 md:mb-2">1. Create / Upload</h4>
                  <p className="text-[9px] md:text-[12px] text-[#64748b] leading-tight max-w-[160px] hidden md:block">Start by creating a new resume or uploading your existing one.</p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center w-1/4 relative z-10 px-1 md:px-2 mt-[0px]">
                  <div className="w-[44px] h-[44px] md:w-[64px] md:h-[64px] rounded-full bg-white flex items-center justify-center mb-3 md:mb-4 shadow-[0_4px_20px_rgba(34,197,94,0.12)] border border-[#f0fdf4] relative">
                    <div className="w-[32px] h-[32px] md:w-[50px] md:h-[50px] rounded-full bg-[#f0fdf4] flex items-center justify-center border border-[#bbf7d0]">
                      <EditOutlined className="text-[16px] md:text-[24px] text-[#22c55e]" />
                    </div>
                    {/* Sparkles */}
                    <svg viewBox="0 0 24 24" fill="#bbf7d0" className="w-3 h-3 md:w-4 md:h-4 absolute -bottom-1 -left-3"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                    <svg viewBox="0 0 24 24" fill="#bbf7d0" className="w-2 h-2 md:w-3 md:h-3 absolute top-0 -right-2"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                  </div>
                  <div className="w-2 h-2 md:w-3.5 md:h-3.5 rounded-full bg-[#22c55e] mb-2 md:mb-4 shadow-[0_0_0_3px_#EFF5FB] md:shadow-[0_0_0_5px_#EFF5FB]"></div>
                  <h4 className="text-[10px] md:text-[14px] font-bold text-[#0f172a] mb-1 md:mb-2">2. Customize</h4>
                  <p className="text-[9px] md:text-[12px] text-[#64748b] leading-tight max-w-[160px] hidden md:block">Personalize your resume with our easy-to-use customization tools.</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center w-1/4 relative z-10 px-1 md:px-2 mt-[16px] md:mt-[24px]">
                  <div className="w-[44px] h-[44px] md:w-[64px] md:h-[64px] rounded-full bg-white flex items-center justify-center mb-3 md:mb-4 shadow-[0_4px_20px_rgba(168,85,247,0.12)] border border-[#faf5ff] relative">
                    <div className="w-[32px] h-[32px] md:w-[50px] md:h-[50px] rounded-full bg-[#faf5ff] flex items-center justify-center border border-[#e9d5ff]">
                      <StarOutlined className="text-[16px] md:text-[24px] text-[#a855f7]" />
                    </div>
                    {/* Sparkles */}
                    <svg viewBox="0 0 24 24" fill="#e9d5ff" className="w-2 h-2 md:w-3 md:h-3 absolute -bottom-2 -left-1"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                    <svg viewBox="0 0 24 24" fill="#e9d5ff" className="w-3 h-3 md:w-4 md:h-4 absolute -top-2 -right-3"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                  </div>
                  <div className="w-2 h-2 md:w-3.5 md:h-3.5 rounded-full bg-[#a855f7] mb-2 md:mb-4 shadow-[0_0_0_3px_#EFF5FB] md:shadow-[0_0_0_5px_#EFF5FB]"></div>
                  <h4 className="text-[10px] md:text-[14px] font-bold text-[#0f172a] mb-1 md:mb-2">3. Optimize</h4>
                  <p className="text-[9px] md:text-[12px] text-[#64748b] leading-tight max-w-[160px] hidden md:block">Get AI suggestions to improve your content and stand out.</p>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center w-1/4 relative z-10 px-1 md:px-2 mt-[0px]">
                  <div className="w-[44px] h-[44px] md:w-[64px] md:h-[64px] rounded-full bg-white flex items-center justify-center mb-3 md:mb-4 shadow-[0_4px_20px_rgba(249,115,22,0.12)] border border-[#fff7ed] relative">
                    <div className="w-[32px] h-[32px] md:w-[50px] md:h-[50px] rounded-full bg-[#fff7ed] flex items-center justify-center border border-[#fed7aa]">
                      <DownloadOutlined className="text-[16px] md:text-[24px] text-[#f59e0b]" />
                    </div>
                    {/* Sparkles */}
                    <svg viewBox="0 0 24 24" fill="#fed7aa" className="w-3 h-3 md:w-4 md:h-4 absolute top-2 -left-4"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                    <svg viewBox="0 0 24 24" fill="#fed7aa" className="w-2 h-2 md:w-3 md:h-3 absolute -bottom-2 -right-1"><path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" /></svg>
                  </div>
                  <div className="w-2 h-2 md:w-3.5 md:h-3.5 rounded-full bg-[#f59e0b] mb-2 md:mb-4 shadow-[0_0_0_3px_#EFF5FB] md:shadow-[0_0_0_5px_#EFF5FB]"></div>
                  <h4 className="text-[10px] md:text-[14px] font-bold text-[#0f172a] mb-1 md:mb-2">4. Download</h4>
                  <p className="text-[9px] md:text-[12px] text-[#64748b] leading-tight max-w-[160px] hidden md:block">Export your resume in PDF format and land your dream job.</p>
                </div>
              </div>
            </div>

            {/* Header Content */}
            <div className="flex flex-col items-center gap-0 w-full mt-0">
              <h2
                className="text-[28px] md:text-[32px] font-bold text-[#0f172a] mt-0 mb-0 border-none pb-0 leading-tight"
                style={{ border: 'none' }}
              >
                Let's get you started
              </h2>
              <p className="text-[#64748b] text-[15px] md:text-[16px] mt-1 mb-0">Choose the best way to build your resume</p>
            </div>

            {/* Main Action Cards (Wide Horizontal Style) */}
            <div className="flex flex-wrap justify-center gap-5 w-full max-w-[1300px] mx-auto mt-2 mb-6 px-4">

              {/* Upload Resume Card */}
              <div
                className="bg-white rounded-2xl p-4 md:p-6 w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex flex-row items-center gap-4 md:gap-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#3b82f6] border-y border-r border-[#e2e8f0] group relative overflow-hidden text-left"
              >
                {/* Icon */}
                <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] shrink-0 rounded-full bg-[#eff6ff] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <CloudUploadOutlined className="text-[22px] md:text-[28px] text-[#3b82f6]" />
                </div>
                {/* Text Content */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-[15px] md:text-[17px] font-bold text-[#0f172a] mb-1 md:mb-2">Upload Resume</h3>
                  <p className="text-[#64748b] text-[11px] md:text-[13px] leading-snug md:leading-relaxed mb-2 md:mb-6">Upload your current resume and improve it with our suggestions.</p>
                  <span
                    className="cursor-pointer text-[#3b82f6] font-semibold text-[13px] md:text-[15px] flex items-center justify-start gap-1 hover:gap-2 transition-all mt-auto md:pt-2"
                    onClick={() => message.info("Upload Resume coming soon!")}
                  >
                    Upload & Enhance <span>→</span>
                  </span>
                </div>
              </div>

              {/* Create Resume Card */}
              <div
                className="bg-white rounded-2xl p-4 md:p-6 w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex flex-row items-center gap-4 md:gap-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#22c55e] border-y border-r border-[#e2e8f0] group relative overflow-hidden text-left"
              >
                {/* Icon */}
                <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] shrink-0 rounded-full bg-[#f0fdf4] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <FileAddOutlined className="text-[22px] md:text-[28px] text-[#22c55e]" />
                </div>
                {/* Text Content */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-[15px] md:text-[17px] font-bold text-[#0f172a] mb-1 md:mb-2">Create New</h3>
                  <p className="text-[#64748b] text-[11px] md:text-[13px] leading-snug md:leading-relaxed mb-2 md:mb-6">Build your resume from scratch using our step-by-step builder.</p>
                  <span
                    className="cursor-pointer text-[#22c55e] font-semibold text-[13px] md:text-[15px] flex items-center justify-start gap-1 hover:gap-2 transition-all mt-auto md:pt-2"
                    onClick={() => {
                      setStep('templates_initial');
                    }}
                  >
                    Create From Scratch <span>→</span>
                  </span>
                </div>
              </div>

              {/* ATS Checker Card */}
                <div
                  className="bg-white rounded-2xl p-4 md:p-6 w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex flex-row items-center gap-4 md:gap-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#f59e0b] border-y border-r border-[#e2e8f0] group relative overflow-hidden text-left"
                >
                  <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] shrink-0 rounded-full bg-[#fffbeb] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <BarChartOutlined className="text-[22px] md:text-[28px] text-[#f59e0b]" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="text-[15px] md:text-[17px] font-bold text-[#0f172a] mb-1 md:mb-2">ATS Checker</h3>
                    <p className="text-[#64748b] text-[11px] md:text-[13px] leading-snug md:leading-relaxed mb-2 md:mb-6">Scan your resume against job descriptions to get your ATS score.</p>
                    <span
                      className="cursor-pointer text-[#f59e0b] font-semibold text-[13px] md:text-[15px] flex items-center justify-start gap-1 hover:gap-2 transition-all mt-auto md:pt-2"
                      onClick={() => setStep('ats_checker')}
                    >
                      Check Score <span>→</span>
                    </span>
                  </div>
                </div>

            </div>

            {/* Bottom Features Banner */}
            <div className="bg-white rounded-2xl p-4 md:p-6 w-full shadow-sm border border-[#e2e8f0] grid grid-cols-2 lg:flex lg:flex-row items-start md:items-center justify-between gap-4 md:gap-6 lg:gap-4 max-w-[1000px] mb-4">
              
              {/* Feature 1 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <div className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] rounded-xl bg-[#faf5ff] flex items-center justify-center border border-[#f3e8ff] shrink-0">
                  <FileTextOutlined className="text-[16px] md:text-[20px] text-[#a855f7]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[12px] md:text-[15px] font-bold text-[#0f172a] mb-0.5 md:mb-1">ATS Friendly</h4>
                  <p className="text-[#64748b] text-[10px] md:text-[13px] leading-snug">Templates that pass ATS checks</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <div className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] rounded-xl bg-[#f0fdf4] flex items-center justify-center border border-[#dcfce7] shrink-0">
                  <StarOutlined className="text-[16px] md:text-[20px] text-[#22c55e]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[12px] md:text-[15px] font-bold text-[#0f172a] mb-0.5 md:mb-1">Professional Templates</h4>
                  <p className="text-[#64748b] text-[10px] md:text-[13px] leading-snug">Choose from a variety of professional designs</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <div className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] rounded-xl bg-[#eff6ff] flex items-center justify-center border border-[#dbeafe] shrink-0">
                  <EditOutlined className="text-[16px] md:text-[20px] text-[#3b82f6]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[12px] md:text-[15px] font-bold text-[#0f172a] mb-0.5 md:mb-1">Easy to Customize</h4>
                  <p className="text-[#64748b] text-[10px] md:text-[13px] leading-snug">Edit and customize your resume with ease</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <div className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] rounded-xl bg-[#fff7ed] flex items-center justify-center border border-[#ffedd5] shrink-0">
                  <DownloadOutlined className="text-[16px] md:text-[20px] text-[#f97316]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[12px] md:text-[15px] font-bold text-[#0f172a] mb-0.5 md:mb-1">Export & Download</h4>
                  <p className="text-[#64748b] text-[10px] md:text-[13px] leading-snug">Download your resume in PDF format</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        <MobileResumeBuilder
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSubmit={handleSubmit}
          handleDownloadResume={handleDownloadResume}
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
          templateOptions={TEMPLATE_OPTIONS}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          SelectedTemplate={SelectedTemplateComponent}
          activeSection={activeSection}
          isGeneratingPdf={isGeneratingPdf}
        />
        {hiddenExportTemplate}
      </>
    );
  }



  if (step === 'templates_initial') {
    const filteredTemplates = activeCategory === 'All Templates'
      ? TEMPLATE_OPTIONS
      : TEMPLATE_OPTIONS.filter(t => getTemplateCategory(t.id) === activeCategory);

    return (
      <div className="flex flex-col gap-0 relative bg-[#F8FAFC] h-[calc(100vh-70px)] overflow-hidden">
        <StudentPageHeader
          title="Choose a Template"
          subtitle="Pick a design that fits your style and make it yours"
        />

        {/* Categories Bar */}
        <div className="bg-white border-b border-[#e2e8f0] px-4 md:px-8 py-3 flex items-center shadow-sm z-10 shrink-0 gap-6">
          <button
            onClick={() => setStep('landing')}
            className="flex items-center gap-2 text-[#475569] hover:text-[#3b82f6] transition-colors text-[14px] font-medium bg-transparent border-none shadow-none shrink-0 cursor-pointer p-0"
          >
            <ArrowLeftOutlined /> Back
          </button>

          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#94a3b8]"
          >
            {["All Templates", "Modern", "Minimal", "Professional", "Creative"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                className={`px-4 py-1.5 rounded-full text-[14px] whitespace-nowrap transition-colors ${activeCategory === cat
                    ? "text-[#3b82f6] bg-[#eff6ff] font-semibold"
                    : "text-[#64748b] hover:text-[#0f172a] font-medium"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                const hasDrafts = Object.keys(localStorage).some(k => k.startsWith('resumeDraft_'));
                if (hasDrafts) {
                  setStep('continue_editing');
                } else {
                  message.info("No saved drafts found. Please create a new resume.");
                }
              }}
              className="flex items-center gap-2 text-[#a855f7] bg-[#faf5ff] hover:bg-[#f3e8ff] px-4 py-1.5 rounded-md transition-colors text-[14px] font-semibold border border-[#e9d5ff]"
            >
              <EditOutlined /> Continue Editing
            </button>
            <button className="flex items-center gap-2 text-[#475569] hover:bg-[#f1f5f9] px-3 py-1.5 rounded-md transition-colors text-[14px] font-medium border border-[#e2e8f0]">
              <FilterOutlined /> Filter
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] hover:[&::-webkit-scrollbar-thumb]:bg-[#94a3b8]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[1600px]:grid-cols-5 min-[1920px]:grid-cols-6 gap-8 w-full mx-auto pb-10">
            {filteredTemplates.map((template, index) => (
              <div
                key={template.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-[#e2e8f0] hover:border-[#1E69DA] group flex flex-col"
                onClick={() => {
                  setPreviewTemplate(template.id);
                }}
              >
                <div className="h-[340px] bg-white w-full flex items-center justify-center border-b border-[#e2e8f0] overflow-hidden relative">
                  <div className="absolute inset-0 scale-[0.42] origin-top-left w-[238%] h-[238%] pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-full p-8 bg-white shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-[#f1f5f9]">
                      {(() => {
                        const Tmp = templateComponents[template.id] || Template1;
                        return (
                          <PreviewContext.Provider value={true}>
                            <Tmp />
                          </PreviewContext.Provider>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="font-semibold text-[#334155]">{template.label}</span>
                  <div className="flex items-center gap-3">
                    {["template3", "template4", "template6", "template8", "template10"].includes(template.id) && (
                      <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-bold px-2 py-0.5 rounded-md">New</span>
                    )}
                    <div
                      className={`w-[18px] h-[18px] rounded-full border-[1.5px] ${template.id === 'template1' ? 'border-[#3b82f6] border-[5px]' : 'border-[#cbd5e1]'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Modal */}
        {previewTemplate && (() => {
          const info = (() => {
            const templateObj = TEMPLATE_OPTIONS.find(t => t.id === previewTemplate);
            const label = templateObj ? templateObj.label : "Template";
            const category = getTemplateCategory(previewTemplate);

            if (category === 'Modern') {
              return { name: label, category, desc: "A clean and elegant two-column layout with a sidebar for your details and a clear content area to highlight your experience.", highlights: ["Professional two-column layout", "Sidebar for contact, education & skills", "Clean typography and spacing", "Easy to customize"], bestFor: ["Developers", "Engineers", "IT Professionals"] };
            } else if (category === 'Minimal') {
              return { name: label, category, desc: "A minimalist approach focusing on your content without distractions. Perfect for a clean, concise presentation.", highlights: ["Minimalist design", "High readability", "Focus on achievements", "Perfect for corporate roles"], bestFor: ["Managers", "Consultants", "Executives"] };
            } else if (category === 'Professional') {
              return { name: label, category, desc: "A traditional and highly professional template favored by recruiters and hiring managers.", highlights: ["Traditional structure", "Highly professional look", "Dense information layout", "Recruiter approved"], bestFor: ["Finance", "Law", "Business Administration"] };
            } else {
              return { name: label, category, desc: "A bold and creative design to make your resume stand out from the crowd with unique accents.", highlights: ["Bold typography", "Creative layout", "Memorable design", "Portfolio ready"], bestFor: ["Designers", "Marketers", "Creative Professionals"] };
            }
          })();

          return (
            <>
              {/* Fullscreen Overlay */}
              {isFullscreen && (
                <div className="fixed inset-0 z-[9999] bg-[#0f172a] overflow-auto flex justify-center items-start py-12">
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="fixed top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50 cursor-pointer border-none"
                  >
                    <FullscreenExitOutlined className="text-[24px]" />
                  </button>
                  <div className="bg-white shadow-2xl rounded-sm overflow-hidden w-[800px] mb-12">
                    {(() => {
                      const Tmp = templateComponents[previewTemplate] || Template1;
                      return (
                        <PreviewContext.Provider value={true}>
                          <Tmp />
                        </PreviewContext.Provider>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Normal Modal */}
              <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#0f172a]/80 backdrop-blur-sm transition-opacity ${isFullscreen ? 'opacity-0 pointer-events-none' : ''}`} onClick={() => setPreviewTemplate(null)}>
                <div className="relative bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full max-w-6xl rounded-2xl max-h-[85vh]" onClick={e => e.stopPropagation()}>

                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-white z-10 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center text-[22px]">
                        <EyeOutlined />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[17px] font-bold text-[#0f172a] m-0 leading-tight">Template Preview</h3>
                        <p className="text-[13px] text-[#64748b] m-0 leading-tight">See how your resume will look with this template.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewTemplate(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] transition-colors border-none cursor-pointer"
                    >
                      <CloseOutlined className="text-[14px]" />
                    </button>
                  </div>

                  {/* Modal Body: Two columns */}
                  <div className="flex-1 flex overflow-hidden flex-col md:flex-row">

                    {/* Left Column: Preview */}
                    <div className="w-full md:w-[55%] lg:w-[65%] bg-[#F8FAFC] p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden flex justify-center items-start border-r border-[#e2e8f0]">
                      <div
                        className="flex justify-center w-full"
                        style={{ zoom: Math.max(65, previewScale) / 100 }}
                      >
                        <div
                          className="transition-all duration-300 bg-white shadow-md origin-top overflow-hidden w-[800px] rounded-sm border border-[#e2e8f0]"
                          style={{ transform: `scale(${previewScale / Math.max(65, previewScale)})` }}
                        >
                          <div className="w-full">
                            {(() => {
                              const Tmp = templateComponents[previewTemplate] || Template1;
                              return (
                                <PreviewContext.Provider value={true}>
                                  <Tmp />
                                </PreviewContext.Provider>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full md:w-[45%] lg:w-[35%] bg-white p-6 overflow-y-auto flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[18px] font-bold text-[#0f172a] m-0">Template: {info.name}</h2>
                        <span className="bg-[#eff6ff] text-[#3b82f6] text-[12px] font-bold px-3 py-1 rounded-full">{info.category}</span>
                      </div>

                      <p className="text-[14px] text-[#475569] leading-relaxed mb-6">
                        {info.desc}
                      </p>

                      <h4 className="text-[15px] font-bold text-[#0f172a] mb-3">Highlights</h4>
                      <div className="flex flex-col gap-2.5 mb-6">
                        {info.highlights.map(h => (
                          <div key={h} className="flex items-center gap-2 text-[13px] text-[#475569] font-medium">
                            <CheckCircleFilled className="text-[#10b981]" /> {h}
                          </div>
                        ))}
                      </div>

                      <h4 className="text-[15px] font-bold text-[#0f172a] mb-3">Best for</h4>
                      <div className="flex items-center flex-wrap gap-2 mb-8">
                        {info.bestFor.map(bf => (
                          <span key={bf} className="bg-[#f1f5f9] text-[#0f172a] text-[12px] font-medium px-3 py-1 rounded-full">
                            {bf}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => {
                            setSelectedTemplate(previewTemplate);
                            setStep('editor');
                            setPreviewTemplate(null);
                          }}
                          className="!bg-[#1E69DA] hover:!bg-[#1554b3] !text-white !border-none !rounded-lg !w-full !h-[42px] font-semibold shadow-md transition-all text-[14px] flex items-center justify-center gap-2"
                        >
                          <FileTextOutlined /> Continue with this template
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-2 text-[#64748b] text-[13px] font-medium">
                      <InfoCircleOutlined className="text-[#3b82f6] text-[15px]" /> You can edit and customize every section after selecting this template.
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-6">
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-3">
                        <button onClick={() => setPreviewScale(Math.max(25, previewScale - 10))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b] transition-colors"><MinusOutlined className="text-[12px]" /></button>
                        <span className="text-[13px] font-medium text-[#0f172a] min-w-[36px] text-center">{previewScale}%</span>
                        <button onClick={() => setPreviewScale(Math.min(200, previewScale + 10))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b] transition-colors"><PlusOutlined className="text-[12px]" /></button>
                      </div>

                      <div className="w-[1px] h-4 bg-[#e2e8f0]"></div>

                      {/* View Mode */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setPreviewMode('desktop'); setPreviewScale(65); }} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${previewMode === 'desktop' ? 'text-[#3b82f6] bg-[#eff6ff]' : 'text-[#64748b] hover:bg-[#f1f5f9]'}`}><DesktopOutlined className="text-[15px]" /></button>
                        <button onClick={() => message.info("This feature will be available in the future")} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors text-[#64748b] hover:bg-[#f1f5f9]`}><MobileOutlined className="text-[15px]" /></button>
                      </div>

                      <div className="w-[1px] h-4 bg-[#e2e8f0]"></div>

                      {/* Fullscreen */}
                      <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#f1f5f9] text-[#64748b] transition-colors">
                        {isFullscreen ? <FullscreenExitOutlined className="text-[15px]" /> : <FullscreenOutlined className="text-[15px]" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    );
  }

  if (step === 'continue_editing') {
    const draftedTemplateIds = typeof window !== 'undefined'
      ? Object.keys(localStorage)
        .filter(k => k.startsWith('resumeDraft_'))
        .map(k => k.replace('resumeDraft_', ''))
      : [];

    const draftedTemplates = TEMPLATE_OPTIONS.filter(t => draftedTemplateIds.includes(t.id));

    return (
      <div className="flex flex-col gap-0 relative bg-[#F8FAFC] h-screen overflow-hidden">
        <StudentPageHeader
          title="Continue Editing"
          subtitle="Pick up where you left off with your saved drafts"
        />

        {/* Categories Bar */}
        <div className="bg-white border-b border-[#e2e8f0] px-4 md:px-8 py-3 flex items-center shadow-sm z-10 shrink-0 gap-6">
          <button
            onClick={() => setStep('landing')}
            className="flex items-center gap-2 text-[#475569] hover:text-[#3b82f6] transition-colors text-[14px] font-medium bg-transparent border-none shadow-none shrink-0 cursor-pointer p-0"
          >
            <ArrowLeftOutlined /> Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] hover:[&::-webkit-scrollbar-thumb]:bg-[#94a3b8]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[1600px]:grid-cols-5 min-[1920px]:grid-cols-6 gap-8 w-full mx-auto pb-10">
            {draftedTemplates.length > 0 ? draftedTemplates.map((template, index) => (
              <div
                key={template.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-[#e2e8f0] hover:border-[#1E69DA] group flex flex-col"
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setStep('editor');
                }}
              >
                <div className="h-[340px] bg-white w-full flex items-center justify-center border-b border-[#e2e8f0] overflow-hidden relative">
                  <div className="absolute inset-0 scale-[0.42] origin-top-left w-[238%] h-[238%] pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-full p-8 bg-white shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-[#f1f5f9]">
                      {(() => {
                        const Tmp = templateComponents[template.id] || Template1;
                        return (
                          <PreviewContext.Provider value={true}>
                            <Tmp />
                          </PreviewContext.Provider>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="font-semibold text-[#334155]">{template.label} - Draft</span>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-[18px] h-[18px] rounded-full border-[1.5px] border-[#cbd5e1]`}
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 text-[#64748b]">
                No drafts found. <span className="text-[#1E69DA] cursor-pointer hover:underline" onClick={() => setStep('templates_initial')}>Create a new resume</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0 relative bg-[#EFF5FB] h-screen overflow-hidden">
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



            <div className="flex items-center flex-wrap justify-end gap-3 z-10">
              <Button onClick={handleSubmit} loading={isSubmitting} className="!bg-[#1E69DA] !text-white !border !border-[#1E69DA] hover:!bg-[#1754B4] hover:!border-[#1754B4] focus:!bg-[#1754B4] focus:!border-[#1754B4] transition-all">
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full flex overflow-hidden">

          {/* Left Panel (50%) */}
          <div className="w-full md:w-[50%] shrink-0 h-full overflow-y-auto bg-white border-r border-[#e2e8f0] p-4 lg:p-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1E69DA] hover:[&::-webkit-scrollbar-thumb]:bg-[#1754B4] [&::-webkit-scrollbar-thumb]:rounded-full relative">
            <div className="flex items-center gap-3 mb-6 sticky top-0 bg-white z-20 pb-2 border-b border-gray-100">
              <Button onClick={() => {
                if (selectedTemplate) {
                  localStorage.removeItem(`resumeDraft_${selectedTemplate}`);
                }
                sessionStorage.setItem("resumeBuilderStep", "templates_initial");
                window.location.reload();
              }} className="!bg-white !text-gray-600 !border-gray-300 hover:!bg-gray-50 hover:!text-gray-800 transition-all text-[14px]">
                &lt;- Back
              </Button>
              <Button
                onClick={() => setLeftTab('details')}
                className={`transition-all ${leftTab === 'details' ? '!bg-[#1E69DA] !text-white !font-bold !border-[#1E69DA]' : '!bg-gray-50 !text-gray-600 !border-gray-200 hover:!bg-gray-100 hover:!text-gray-800'}`}
              >
                Fill in Details
              </Button>
              <Button
                onClick={() => setLeftTab('templates')}
                className={`transition-all ${leftTab === 'templates' ? '!bg-[#1E69DA] !text-white !font-bold !border-[#1E69DA]' : '!bg-gray-50 !text-gray-600 !border-gray-200 hover:!bg-gray-100 hover:!text-gray-800'}`}
              >
                Templates
              </Button>
            </div>
            {leftTab === 'details' ? (
              <div className="flex flex-col">
                <AccordionSection
                  title="Personal Information"
                  icon={<UserOutlined />}
                  isExpanded={expandedSection === "Personal Information"}
                  onToggle={() => setExpandedSection(expandedSection === "Personal Information" ? null : "Personal Information")}
                >
                  <div className="flex flex-col gap-6">
                    <BasicDetails data={basicDetails} updateField={updateBasicDetail} activeTemplate={selectedTemplate} />
                    <div className="px-4">
                      <Links links={links} updateLink={updateLink} addLink={addLink} removeLink={removeLink} />
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Professional Summary"
                  icon={<UserOutlined />}
                  isExpanded={expandedSection === "Professional Summary"}
                  onToggle={() => setExpandedSection(expandedSection === "Professional Summary" ? null : "Professional Summary")}
                >
                  <ProfessionalSummary data={basicDetails} updateField={updateBasicDetail} />
                </AccordionSection>

                <AccordionSection
                  title="Education"
                  icon={<BookOutlined />}
                  isExpanded={expandedSection === "Education"}
                  onToggle={() => setExpandedSection(expandedSection === "Education" ? null : "Education")}
                >
                  <EducationDetails educationDetails={educationDetails} updateEducationDetail={updateEducationDetail} addEducation={addEducation} removeEducation={removeEducation} onNext={() => setExpandedSection("Experience")} />
                </AccordionSection>

                <AccordionSection
                  title="Experience"
                  icon={<SolutionOutlined />}
                  isExpanded={expandedSection === "Experience"}
                  onToggle={() => setExpandedSection(expandedSection === "Experience" ? null : "Experience")}
                >
                  <ExperienceDetails experiences={experienceDetails} updateExperience={updateExperience} addExperience={addExperience} removeExperience={removeExperience} onNext={() => setExpandedSection("Internships")} />
                </AccordionSection>

                <AccordionSection
                  title="Internships"
                  icon={<CheckSquareOutlined />}
                  isExpanded={expandedSection === "Internships"}
                  onToggle={() => setExpandedSection(expandedSection === "Internships" ? null : "Internships")}
                >
                  <InternshipsDetails experiences={internships} updateExperience={updateInternship} addExperience={addInternship} removeExperience={removeInternship} onNext={() => setExpandedSection("Projects")} />
                </AccordionSection>

                <AccordionSection
                  title="Projects"
                  icon={<CodeOutlined />}
                  isExpanded={expandedSection === "Projects"}
                  onToggle={() => setExpandedSection(expandedSection === "Projects" ? null : "Projects")}
                >
                  <ProjectDetails projects={projectDetails} updateProject={updateProject} addProject={addProject} removeProject={removeProject} onNext={() => setExpandedSection("Skills")} />
                </AccordionSection>

                <AccordionSection
                  title="Skills"
                  icon={<StarOutlined />}
                  isExpanded={expandedSection === "Skills"}
                  onToggle={() => setExpandedSection(expandedSection === "Skills" ? null : "Skills")}
                >
                  <SkillDetails skills={skills} updateSkill={updateSkill} addSkill={addSkill} removeSkill={removeSkill} setSkills={setSkills} />
                </AccordionSection>



                {visibleOptionalSections.includes("Certifications") && (
                  <AccordionSection
                    title="Certifications"
                    icon={<SafetyCertificateOutlined />}
                    isExpanded={expandedSection === "Certifications"}
                    onToggle={() => setExpandedSection(expandedSection === "Certifications" ? null : "Certifications")}
                    onRemove={() => {
                      setVisibleOptionalSections(prev => prev.filter(s => s !== "Certifications"));
                    }}
                  >
                    <CertificateDetails certificates={certificates} updateCertificate={updateCertificate} addCertificate={addCertificate} removeCertificate={removeCertificate} />
                  </AccordionSection>
                )}

                {visibleOptionalSections.includes("Volunteering") && (
                  <AccordionSection
                    title="Volunteering"
                    icon={<HeartOutlined />}
                    isExpanded={expandedSection === "Volunteering"}
                    onToggle={() => setExpandedSection(expandedSection === "Volunteering" ? null : "Volunteering")}
                    onRemove={() => {
                      setVisibleOptionalSections(prev => prev.filter(s => s !== "Volunteering"));
                    }}
                  >
                    <VolunteeringDetails volunteerings={volunteerings} updateVolunteering={updateVolunteering} addVolunteering={addVolunteering} removeVolunteering={removeVolunteering} />
                  </AccordionSection>
                )}

                {visibleOptionalSections.includes("Languages") && (
                  <AccordionSection
                    title="Languages"
                    icon={<GlobalOutlined />}
                    isExpanded={expandedSection === "Languages"}
                    onToggle={() => setExpandedSection(expandedSection === "Languages" ? null : "Languages")}
                    onRemove={() => {
                      setVisibleOptionalSections(prev => prev.filter(s => s !== "Languages"));
                    }}
                  >
                    <Language languages={languages} updateLanguage={updateLanguage} addLanguage={addLanguage} removeLanguage={removeLanguage} setLanguages={setLanguages} />
                  </AccordionSection>
                )}

                {/* Add New Section Feature */}
                {/* Add New Section Feature */}
                <div className="mt-4 mb-10">
                  {true ? null : null}
                  <div className="flex flex-col gap-6">
                    {/* Top Header */}
                    <div className="flex items-center justify-between">
                      <div className="text-[26px] font-bold text-[#334155]">
                        + Add New Section
                      </div>
                      <button
                        onClick={() => setIsAddSectionOpen(false)}
                        className="text-[#64748b] hover:text-[#334155] text-[15px] font-medium flex items-center gap-2 bg-transparent border-none cursor-pointer transition-colors"
                      >
                      </button>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-[24px] border border-[#e2e8f0] flex flex-col lg:flex-row h-auto lg:h-[500px] overflow-hidden shadow-sm">
                      {/* Left sidebar - Options */}
                      <div className="w-full lg:w-[45%] xl:w-[40%] overflow-y-auto pt-4 lg:pt-6 pr-[2px] relative" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9ca3af transparent' }}>
                        <div className="flex flex-col pl-4 pr-2">
                          {[
                            { id: "Certifications", icon: <SafetyCertificateOutlined />, title: "Certificates", desc: "Education doesn't end with graduation. Show that you still keep learning to gain an edge in your field.", bullets: ["Completed Advanced React certification with 98% score.", "Certified in AWS Solutions Architecture.", "Achieved mastery in cloud deployment pipelines."] },
                            { id: "Volunteering", icon: <HeartOutlined />, title: "Volunteering", desc: "Showcase your dedication to the community and social causes.", bullets: ["Organized community food drives reaching 500+ families.", "Volunteered over 100 hours for local environmental cleanups.", "Mentored underprivileged youth in basic coding skills."] },
                            { id: "Languages", icon: <GlobalOutlined />, title: "Languages", desc: "Highlight your communication skills in different languages.", bullets: ["English - Native or Bilingual Proficiency", "Spanish - Professional Working Proficiency", "French - Limited Working Proficiency"] }
                          ].map(section => (
                            <button
                              key={section.id}
                              onMouseEnter={() => setPreviewOptionalSection(section.id)}
                              onClick={() => {
                                if (!visibleOptionalSections.includes(section.id)) {
                                  setVisibleOptionalSections(prev => [...prev, section.id]);
                                  setExpandedSection(section.id);
                                  // setIsAddSectionOpen(false); // Kept open based on user feedback
                                }
                              }}
                              className={`group flex items-center justify-between px-4 py-5 border-b border-[#f1f5f9] cursor-pointer transition-colors text-left bg-transparent ${previewOptionalSection === section.id ? 'bg-[#f8fafc]' : 'hover:bg-[#f8fafc]'}`}
                            >
                              <div className="flex items-center gap-4">
                                <span className={`text-[22px] text-[#475569]`}>{section.icon}</span>
                                <span className={`text-[17px] text-[#334155]`}>{section.title}</span>
                              </div>
                              {previewOptionalSection === section.id && !visibleOptionalSections.includes(section.id) && (
                                <PlusCircleOutlined className="text-[#ef4444] text-[18px]" />
                              )}
                            </button>
                          ))}
                        </div>
                        {/* Fake scrollbar line on the right edge */}
                        <div className="absolute right-[2px] top-6 bottom-6 w-[6px] bg-[#9ca3af] rounded-full pointer-events-none opacity-80" />
                      </div>

                      {/* Right side - Preview */}
                      <div className="w-full lg:w-[55%] xl:w-[60%] bg-[#f8fafc] p-6 lg:p-8 flex flex-col relative items-center justify-center border-t lg:border-t-0 lg:border-l border-[#f1f5f9]">
                        {(() => {
                          const activeData = [
                            { id: "Certifications", title: "Certificates", desc: "Education doesn't end with graduation. Show that you still keep learning to gain an edge in your field.", bullets: ["Completed Advanced React certification with 98% score.", "Certified in AWS Solutions Architecture.", "Achieved mastery in cloud deployment pipelines."] },
                            { id: "Volunteering", title: "Volunteering", desc: "Use action verbs to highlight your notable contributions. By doing this, you show your track record and erase any doubts about your ability.", bullets: ["Organized community food drives reaching 500+ families.", "Volunteered over 100 hours for local environmental cleanups.", "Mentored underprivileged youth in basic coding skills."] },
                            { id: "Languages", title: "Languages", desc: "Highlight your communication skills in different languages. Use accurate proficiency levels to show your fluency.", bullets: ["English - Native or Bilingual Proficiency", "Spanish - Professional Working Proficiency", "French - Limited Working Proficiency"] }
                          ].find(s => s.id === previewOptionalSection) || { title: "", desc: "", bullets: [] };

                          return (
                            <div className="w-full max-w-[420px] flex flex-col items-center animate-fadeIn h-full justify-center">
                              <h3 className="text-[19px] font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                                {activeData.title}
                                <span className="text-[13px] italic font-bold text-[#8b5cf6]">PREMIUM</span>
                              </h3>
                              <p className="text-[#475569] text-[15px] leading-relaxed text-center mb-6 px-2">
                                {activeData.desc}
                              </p>

                              {/* Mock UI for the section */}
                              <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 w-full shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-left cursor-pointer"
                                onClick={() => {
                                  if (!visibleOptionalSections.includes(previewOptionalSection)) {
                                    setVisibleOptionalSections(prev => [...prev, previewOptionalSection]);
                                    setExpandedSection(previewOptionalSection);
                                    // setIsAddSectionOpen(false); // Kept open based on user feedback
                                  }
                                }}
                              >
                                <h4 className="font-bold text-[#0f172a] text-[18px] mb-4">{activeData.title}</h4>
                                <ul className="list-disc pl-5 flex flex-col gap-2">
                                  {activeData.bullets.map((bullet, i) => (
                                    <li key={i} className="text-[#475569] text-[14px] leading-snug font-semibold">{bullet}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="absolute bottom-6 flex items-center justify-center w-full">
                          <span className="flex items-center gap-2 text-[#475569] text-[14px] cursor-pointer hover:text-[#1E69DA]">
                            <InfoCircleOutlined className="text-[18px]" /> How to list {(previewOptionalSection || "").toLowerCase()} on a resume?
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 min-[1600px]:grid-cols-3 gap-4">
                {TEMPLATE_OPTIONS.map((template, index) => {
                  const isActive = selectedTemplate === template.id;
                  const swatch = swatchFor(index);
                  return (
                    <div
                      key={template.id}
                      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border group flex flex-col ${isActive ? "border-[#1E69DA] ring-2 ring-[#1E69DA]/20" : "border-[#e2e8f0] hover:border-[#1E69DA]"}`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="h-40 bg-[#f8fafc] w-full flex items-center justify-center border-b border-[#e2e8f0] overflow-hidden relative">
                        <div className="absolute inset-0 scale-[0.2] origin-top-left w-[500%] h-[500%] pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity bg-white">
                          <div className="w-full h-full p-8">
                            {(() => {
                              const Tmp = templateComponents[template.id] || Template1;
                              return <Tmp />;
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className={`font-semibold text-[13px] ${isActive ? "text-[#1E69DA]" : "text-[#334155]"}`}>{template.label}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: swatch }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Canvas (50% Live Preview) */}
          <div className="hidden md:flex flex-1 md:w-[50%] h-full overflow-y-auto bg-[#f8fafc] p-4 lg:p-6 flex-col items-center [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1E69DA] hover:[&::-webkit-scrollbar-thumb]:bg-[#1754B4] [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="w-full max-w-[900px] flex justify-center">
              <div
                className="bg-white shadow-lg rounded-xl overflow-hidden border border-[#e2e8f0] origin-top [zoom:0.45] lg:[zoom:0.6] xl:[zoom:0.75] 2xl:[zoom:0.9] min-[1600px]:[zoom:1.05] min-[1920px]:[zoom:1.15]"
                style={{ width: "794px" }}
              >
                <div className="flex items-center justify-between px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                    <EyeOutlined /> Live Preview
                  </span>
                  <span className="text-[11px] font-medium text-[#94a3b8]">
                    {TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate)?.label || "Template"}
                  </span>
                </div>
                <ResumeEditorContext.Provider
                  value={{
                    basicDetails,
                    educationDetails,
                    workExperience: experienceDetails,
                    internshipDetails: internships,
                    projectDetails,
                    accDetails,
                    skills,
                    languages,
                    links,
                    volunteerings,
                    certificates,
                  }}
                >
                  <SelectedTemplateComponent
                    downloadImage={downloadImage}
                    setDownloadImage={setDownloadImage}
                    resumeTemplateRef={resumeTemplateRef}
                    activeSection={activeSection}
                    isGeneratingPdf={isGeneratingPdf}
                    accent={templateAccent}
                    onAccentChange={setTemplateAccent}
                  />
                </ResumeEditorContext.Provider>
              </div>
            </div>
          </div>

        </div>
      </div>
      {hiddenExportTemplate}

      {/* Submit Modal */}
      <Modal
        title="Resume Saved Successfully"
        open={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        footer={[
          <Button key="edit" onClick={() => setShowSubmitModal(false)}>
            Continue Editing
          </Button>,
          <Button
            key="download"
            type="primary"
            loading={isGeneratingPdf}
            onClick={async () => {
              const success = await processSubmit();
              if (success) {
                await handleDownloadResume();
                setShowSubmitModal(false);
              }
            }}
            className="bg-[#1E69DA]"
          >
            Submit & Download
          </Button>,
        ]}
      >
        <p>Your resume changes have been saved. Do you want to continue editing or download the resume to your device?</p>
      </Modal>

      {/* Post-Download Edit Warning Modal */}
      <Modal
        title="Unsaved Changes Detected"
        open={showDownloadWarningModal}
        onCancel={() => setShowDownloadWarningModal(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowDownloadWarningModal(false)} className="bg-[#1E69DA]">
            I Understand
          </Button>
        ]}
      >
        <p>You have made changes since your last download. These new edits will <strong>not</strong> reflect in the downloaded resume. You must download the resume again to see the latest changes.</p>
      </Modal>
    </>
  );
}

export default Form;
