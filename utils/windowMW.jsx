import {
  HiOutlineSquares2X2,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlinePresentationChartBar,
  HiOutlineNewspaper,
  HiOutlineBriefcase,
  HiOutlineClipboardDocumentCheck,
  HiOutlineLightBulb,
  HiOutlineVideoCamera,
  HiOutlineCreditCard,
} from "react-icons/hi2";

export const setSstorage = (name, val) => {
  if (typeof window !== "undefined") window.sessionStorage.setItem(name, val);
};

export const getSstorage = (name) => {
  if (typeof window !== "undefined") {
    return window.sessionStorage[name];
  }
};

export const setLstorage = (name, val) => {
  if (typeof window !== "undefined") window.localStorage.setItem(name, val);
};

export const getLstorage = (name) => {
  if (typeof window !== "undefined") {
    return window.localStorage[name];
  }
};

export const clearSstorageVals = () => {
  if (typeof window !== "undefined") window.sessionStorage.clear();
};

export const clearLstorageVals = () => {
  if (typeof window !== "undefined") window.localStorage.clear();
};

export const deleteSstorageVal = (name) => {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(name);
};

export const deleteLstorageVal = (name) => {
  if (typeof window !== "undefined") window.localStorage.removeItem(name);
};

// Encode (like btoa)
export const encrypt = (value) => {
  try {
    return typeof value === "string"
      ? btoa(value)
      : btoa(JSON.stringify(value)); // supports objects too
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};

// Decode (like atob)
export const decrypt = (encodedValue) => {
  try {
    const decoded = atob(encodedValue);
    try {
      // try to parse back to object if possible
      return JSON.parse(decoded);
    } catch {
      return decoded; // if it's plain text
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

export const sideBarTitles = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <HiOutlineSquares2X2 size={22} />,
  },
  {
    name: "Colleges & Students",
    path: "/admin/colleges",
    icon: <HiOutlineAcademicCap size={22} />,
  },
  {
    name: "Companies",
    path: "/admin/companies",
    icon: <HiOutlineBuildingOffice2 size={22} />,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <HiOutlineUsers size={22} />,
  },
  {
    name: "Course Library",
    path: "/admin/course",
    icon: <HiOutlineBookOpen size={22} />,
  },
  {
    name: "Workshops",
    path: "/admin/workshops",
    icon: <HiOutlinePresentationChartBar size={22} />,
  },
  {
    name: "Website NewsFlash",
    path: "/admin/website-newsflash",
    icon: <HiOutlineNewspaper size={22} />,
  },
  {
    name: "Internship Library",
    path: "/admin/internship",
    icon: <HiOutlineBriefcase size={22} />,
  },
  {
    name: "Practice Questions",
    path: "/admin/practice",
    icon: <HiOutlineClipboardDocumentCheck size={22} />,
  },
  {
    name: "Skill Library",
    path: "/admin/questionManager",
    icon: <HiOutlineLightBulb size={22} />,
  },
  {
    name: "Live Lectures",
    path: "/admin/liveLect",
    icon: <HiOutlineVideoCamera size={22} />,
  },
  {
    name: "Payment Integration",
    path: "/admin/payment",
    icon: <HiOutlineCreditCard size={22} />,
  },
];
export const parseIfJson = (text) => {
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};
