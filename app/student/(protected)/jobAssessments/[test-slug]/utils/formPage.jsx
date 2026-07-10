"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "antd";
import { formVals } from "@/redux/slices/assessmentsSlice/userForm";
import { CheckCircle2, XCircle } from "lucide-react";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@gmail\.com$/i;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phoneNumber);
};

const validateName = (name) => {
  return name && name.trim().length >= 3;
};

const getInputType = (label) => {
  if (label === "Email") return "email";
  if (label.includes("Phone")) return "tel";
  return "text";
};

const FormPage = ({ initialData }) => {
  const studentData = useSelector((state) => state.student.student?.data);

  const formValues = useSelector((state) => state.userForm.value);
  const dispatch = useDispatch();
  const [localFormValues, setLocalFormValues] = useState(formValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Only use formValues. Do not pre-fill with studentData.
    const initialValues = { ...formValues };

    setLocalFormValues(initialValues);
    dispatch(formVals(initialValues));
  }, [initialData, dispatch]);

  const handleChange = (e, item) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (item.label.toLowerCase().includes("email") && !validateEmail(value)) {
      newErrors[name] = "Invalid email address, please give a valid gmail.";
    } else if (item.label.includes("Phone") && !validatePhoneNumber(value)) {
      newErrors[name] = "Invalid phone number, must be exactly 10 digits";
    } else if (item.label.toLowerCase().includes("name") && !validateName(value)) {
      newErrors[name] = "give the correct name";
    } else {
      delete newErrors[name];
    }

    setLocalFormValues({ ...localFormValues, [name]: value });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
       dispatch(formVals({ ...formValues, [name]: value }));
    } else {
       // Also dispatch invalid value so state is kept but it's not strictly correct
       dispatch(formVals({ ...formValues, [name]: value }));
    }
  };

  const handlePhoneChange = (e, item) => {
    let val = e.target.value;
    
    // Remove all non-digit characters
    val = val.replace(/\D/g, '');
    
    // Handle +91 or 0 prefixes from autofill/pasting
    if (val.startsWith('91') && val.length > 10) {
      val = val.substring(2);
    } else if (val.startsWith('0') && val.length > 10) {
      val = val.substring(1);
    }
    
    // Truncate to exactly 10 digits
    val = val.substring(0, 10);
    
    e.target.value = val;
    handleChange(e, item);
  };

  return (
    <div className="flex flex-col gap-4 mt-4 w-[96%]">
      {initialData?.map((item, index) => {
        const isPhone = item?.label?.toLowerCase().includes("phone");
        return (
        <div key={index} className="flex flex-col gap-1.5 w-full">
          <div className="relative flex items-center w-full">
             {isPhone ? (
               <input
                 type="tel"
                 name={item?.label}
                 placeholder={item?.requires ? `${item?.label}*` : item?.label}
                 value={localFormValues[item?.label] || ""}
                 onChange={(e) => handlePhoneChange(e, item)}
                 required={item.requires}
                 className={`w-full p-2 pr-10 border border-solid ${errors[item?.label] ? 'border-red-500' : 'border-gray-300'} rounded-[5px] text-[16px] outline-none focus:border-[#1E69DA]`}
                 onPaste={(e) => handlePhoneChange(e, item)}
               />
             ) : (
               <input
                 type={getInputType(item?.label)}
                 name={item?.label}
                 placeholder={item?.requires ? `${item?.label}*` : item?.label}
                 value={localFormValues[item?.label] || ""}
                 onChange={(e) => handleChange(e, item)}
                 required={item.requires}
                 className={`w-full p-2 pr-10 border border-solid ${errors[item?.label] ? 'border-red-500' : 'border-gray-300'} rounded-[5px] text-[16px] outline-none focus:border-[#1E69DA]`}
                 onPaste={(e) => handleChange(e, item)}
               />
             )}
             {localFormValues[item?.label] && !errors[item?.label] && (
               <CheckCircle2 className="absolute right-3 w-5 h-5 text-green-500 z-[10] bg-white" />
             )}
          </div>
          {errors[item?.label] && (
            <div className="flex items-center gap-1.5 text-red-500 mt-0.5">
               <XCircle className="w-4 h-4" />
               <span className="text-[13px] font-medium">{errors[item?.label]}</span>
            </div>
          )}
        </div>
      )})}
    </div>
  );
};

export default FormPage;
