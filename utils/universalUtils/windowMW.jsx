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
    let val = window.localStorage[name];

    // Unified login fallback: token is now in cookies, not localStorage
    if (name === "token" && !val && typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      if (match) {
        val = match[2];
        // Sync it to localStorage so other parts of the app don't have to check cookies
        window.localStorage.setItem("token", val);
      }
    }

    return val;
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

export const refreshWindow = () => {
  if (typeof window !== "undefined") window.location.reload();
};
export const getWindow = () => {
  if (typeof window !== "undefined") return window;
};

export const renderHtml = (text) => {
  const newText = text.split("```html").join("");
  return <div dangerouslySetInnerHTML={{ __html: newText }}></div>;
};

export const parseIfJson = (val) => {
  if (!val) return "";
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
};

export const cleanTestCaseText = (val) => {
  if (val === null || val === undefined) return "";
  let text = typeof val === "object" ? JSON.stringify(val) : String(val);
  text = text.replace(/^"|"$/g, "");
  if (!/<[a-z][\s\S]*>/i.test(text) && !/&[a-z0-9]+;/i.test(text)) {
    return text.trim();
  }
  text = text
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\u00a0/g, " ");

  return text.trim();
};
