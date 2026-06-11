"use client";

// Deep equality check replacement for lodash.isequal
function isEqual(val1, val2) {
  if (val1 === val2) return true;

  if (typeof val1 !== typeof val2) return false;

  if (typeof val1 === "object" && val1 !== null && val2 !== null) {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key) || !isEqual(val1[key], val2[key])) {
        return false;
      }
    }

    return true;
  }

  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;

    for (let i = 0; i < val1.length; i++) {
      if (!isEqual(val1[i], val2[i])) return false;
    }

    return true;
  }

  return false;
}

// Utility function to get only updated fields
export const getUpdatedFields = (original = {}, current = {}) => {
  const updated = {};
  Object.keys(current).forEach((key) => {
    if (!isEqual(current[key], original[key])) {
      updated[key] = current[key];
    }
  });
  return updated;
};
