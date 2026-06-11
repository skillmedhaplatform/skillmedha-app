"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "antd";
import { formVals } from "@/redux/slices/assessmentsSlice/userForm";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phoneNumber) => {
  // const phoneRegex = /^(\+?[1-9]\d{1,14}|0\d{9,14})$/;
  const phoneRegex = /^(0\d{10}|\d{10})$/;
  return phoneRegex.test(phoneNumber);
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
    const initialValues = { ...formValues };

    initialData?.forEach((item) => {
      if (item.label === "Email" && studentData?.email) {
        initialValues["Email"] = studentData?.email;
      } else if (item.label.includes("Phone") && studentData?.phone) {
        initialValues[item.label] = studentData?.phone;
      } else if (item.label === "Full Name" && studentData?.userName) {
        initialValues["Full Name"] = studentData?.userName;
      } else if (studentData && studentData[item?.label]) {
        initialValues[item.label] = studentData[item?.label];
      }
    });

    setLocalFormValues(initialValues);
    dispatch(formVals(initialValues));
  }, [studentData, initialData, dispatch]);

  const handleChange = (e, item) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (item.label === "Email" && !validateEmail(value)) {
      newErrors[name] = "Invalid email address";
    } else if (item.label.includes("Phone") && !validatePhoneNumber(value)) {
      newErrors[name] = "Invalid phone number";
    } else {
      delete newErrors[name];
      dispatch(formVals({ ...formValues, [name]: value }));
    }

    setLocalFormValues({ ...localFormValues, [name]: value });
    setErrors(newErrors);
  };

  return (
    <div className="flex flex-col gap-4 mt-4 w-[96%]">
      {initialData?.map((item, index) => (
        <div key={index} className="flex flex-col gap-2">
          <input
            type={getInputType(item?.label)}
            name={item?.label}
            placeholder={item?.requires ? `${item?.label}*` : item?.label}
            value={localFormValues[item?.label] || ""}
            onChange={(e) => handleChange(e, item)}
            required={item.requires}
            className="w-full p-2 border border-solid border-gray-300 rounded-[5px] text-[16px]"
            onPaste={(e) => handleChange(e, item)}
          />
          {errors[item?.label] && (
            <Alert
              message={errors[item?.label]}
              type="error"
              showIcon
              className="mt-2"
              closable
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FormPage;
