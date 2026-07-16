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
import {
  FileTextOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  EyeOutlined,
} from "@ant-design/icons";

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
    setIsGeneratingPdf(true);
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
        formData.append("bucketName", "skillmedha-student-docs");
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
    } finally {
      setIsGeneratingPdf(false);
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
  const [activeSection, setActiveSection] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
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

  const isMobile = useResponsive();

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
      />
    </div>
  );

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

            <div className="flex items-center flex-wrap justify-end gap-3">
              <Button onClick={() => setIsEditing(!isEditing)} className="!bg-transparent !text-white !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">
                {isEditing ? "Disable Editing" : "Edit Details"}
              </Button>
              {isEditing && (
                <Button onClick={handleSubmit} className="!bg-transparent !text-white !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all">
                  Submit
                </Button>
              )}
              <Button onClick={handleDownloadResume} loading={isGeneratingPdf} className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !text-white !border-none shadow-sm hover:!brightness-110 focus:!brightness-110 transition-all">
                Download Resume
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full flex overflow-hidden">

          {/* Left Sidebar */}
          <div className="w-[280px] shrink-0 bg-white border-r border-[#e2e8f0] p-3 flex flex-col gap-3 overflow-y-auto hidden lg:flex [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1E69DA] hover:[&::-webkit-scrollbar-thumb]:bg-[#1754B4] [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex items-center gap-2 pb-2 border-b border-[#e2e8f0]">
              <UnorderedListOutlined className="text-[#1E69DA] text-[13px]" />
              <span className="text-[12px] font-bold text-[#334155] tracking-wider uppercase">Sections</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#334155] text-[13px] font-semibold">
                  <FileTextOutlined className="text-[#1E69DA]" /> Template
                </span>
                <span className="text-[11px] uppercase tracking-wide text-[#94a3b8]">{TEMPLATE_OPTIONS.length} options</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[190px] overflow-y-auto pr-1 -mr-1 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-thumb]:rounded-full">
                {TEMPLATE_OPTIONS.map((template, index) => {
                  const isActive = selectedTemplate === template.id;
                  const swatch = swatchFor(index);
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      title={template.label}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${isActive ? "border-[#1E69DA] bg-[#eff6ff] text-[#1E69DA] shadow-sm" : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#1E69DA] hover:bg-[#f8fbff] hover:text-[#1E69DA]"}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: swatch }} />
                      {template.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-[#334155] text-[13px] font-semibold">
                  <CheckCircleOutlined className="text-[#1E69DA]" /> Profile complete
                </span>
                <span className="text-[#1E69DA] font-bold text-[14px]">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-[6px] rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#1E69DA] to-[#5694F0] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-1.5 flex flex-col gap-1">
              {availableSections.map((item) => (
                <div
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`group px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer border flex justify-between items-center transition-all ${activeSection === item ? '!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !text-white !border-transparent shadow-sm' : '!bg-transparent !border-transparent text-[#64748b] hover:!bg-white hover:!text-[#1E69DA] hover:!border-[#1E69DA] hover:shadow-sm'}`}
                >
                  {item}
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSection === item ? 'bg-white' : 'bg-[#cbd5e1] group-hover:!bg-[#1E69DA]'}`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Canvas (Scrolling Editor) */}
          <div className="flex-1 h-full overflow-y-auto bg-[#f8fafc] p-4 lg:p-6 relative [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1E69DA] hover:[&::-webkit-scrollbar-thumb]:bg-[#1754B4] [&::-webkit-scrollbar-thumb]:rounded-full" onClick={(e) => {
            // Only clear active section if clicking outside the sidebar navigation
            if (!e.target.closest('.group.px-4.py-2\\.5')) {
              setActiveSection(null);
            }
          }}>
            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-4">

              {/* If not editing, show Template. If editing, show forms. */}
              {!isEditing ? (
                <div
                  className="bg-white shadow-lg rounded-xl overflow-hidden border border-[#e2e8f0] mx-auto"
                  style={{ width: "794px", maxWidth: "100%" }}
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                      <EyeOutlined /> Live Preview
                    </span>
                    <span className="text-[11px] font-medium text-[#94a3b8]">
                      {TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate)?.label || "Template"}
                    </span>
                  </div>
                  <SelectedTemplateComponent
                    downloadImage={downloadImage}
                    setDownloadImage={setDownloadImage}
                    resumeTemplateRef={resumeTemplateRef}
                    activeSection={activeSection}
                    isGeneratingPdf={isGeneratingPdf}
                  />
                </div>
              ) : (
                <>
                  <div ref={(el) => sectionRefs.current["Basic Details"] = el} data-section-name="Basic Details" className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden [&_>div]:!border-none [&_>div]:!shadow-none [&_>div]:!bg-transparent">
                    <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 font-semibold text-[#071631] text-[15px]">Basic Details</div>
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
      {hiddenExportTemplate}
    </>
  );
}

export default Form;
