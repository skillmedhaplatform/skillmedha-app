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
  },
  {
    name: "Colleges & Students",
    path: "/admin/colleges",
    // children: [
    //   {
    //     name: "TPO",
    //     path: "/admin/tpo",
    //   },
    //   {
    //     name: "Departments",
    //     path: "/admin/departments",
    //   },
    // ],
  },
  {
    name: "Companies",
    path: "/admin/companies",
    // children: [
    //   {
    //     name: "Hr",
    //     path: "/admin/hr",
    //   },
    //   {
    //     name: "Jobs",
    //     path: "/admin/jobs",
    //   },
    // ],
  },
  {
    name: "Users",
    path: "/admin/users",
  },
  {
    name: "Course Library",
    path: "/admin/course",
  },
  {
    name: "Workshops",
    path: "/admin/workshops",
  },
  {
    name: "Website NewsFlash",
    path: "/admin/website-newsflash",
  },
  {
    name: "Internship Library",
    path: "/admin/internship",
  },
  {
    name: "Practice Questions",
    path: "/admin/practice",
  },
  {
    name: "Skill Library",
    path: "/admin/questionManager",
  },
  {
    name: "Live Lectures",
    path: "/admin/liveLect",
  },
  {
    name: "Payment Integration",
    path: "/admin/payment",
  },
];
export const parseIfJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};
