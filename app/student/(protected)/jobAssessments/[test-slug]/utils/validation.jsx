// validationUtils.js

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phoneNumber) => {
  // const phoneRegex = /^(\+?[1-9]\d{1,14}|0\d{9,14})$/;
  const phoneRegex = /^(0\d{10}|\d{10})$/;
  return phoneRegex.test(phoneNumber);
};

export const validateForm = (formValues, requiredFields) => {
  const allRequiredFieldsFilled = requiredFields?.every(
    (fieldLabel) => formValues[fieldLabel]
  );

  if (!allRequiredFieldsFilled) {
    return {
      isValid: false,
      message: "Please fill in all required fields.",
    };
  }

  const emailField = requiredFields?.find((label) =>
    label.toLowerCase().includes("email")
  );
  if (emailField && !validateEmail(formValues[emailField])) {
    return {
      isValid: false,
      message: "Please enter a valid email address.",
    };
  }

  const phoneField = requiredFields.find((label) =>
    label.toLowerCase().includes("phone")
  );
  if (phoneField && !validatePhoneNumber(formValues[phoneField])) {
    return {
      isValid: false,
      message: "Please enter a valid phone number.",
    };
  }

  return { isValid: true };
};
