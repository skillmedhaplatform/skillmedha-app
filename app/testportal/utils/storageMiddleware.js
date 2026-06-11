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

export const renderHtml = (text) => {
  const newText = text.split("```html").join("");
  return (
    <div
      dangerouslySetInnerHTML={{ __html: newText }}
      style={{ height: "18rem" }}
    ></div>
  );
};
