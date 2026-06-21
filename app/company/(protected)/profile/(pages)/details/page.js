"use client";
import React, { useState, useEffect } from "react";
import { Button, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import styles from "../../layout.module.scss";
import { useParams } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
// import { UpdateUser } from "@/redux/slices/admin/cms/userSlice";

import { handleS3Upload as uploadToS3 } from "@/utils/universalUtils/s3uploads";
import { UpdateUser } from "@/redux/slices/company/user";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { restUrl } from "@/utils/universalUtils/urls";

export default function CompanyDetailsForm() {
  const USER_DETAILS = useSelector((state) => state?.user?.singleUser || null);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    email: "",
    phone: "",
  });
  const userCreds = useSelector((state) => state?.user?.singleUser || {});
  const [initialValues, setInitialValues] = useState({});
  const [hasUserId, setHasUserId] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = getLstorage("token") || "";
    if (token && USER_DETAILS) {
      setHasUserId(true);
      setInitialValues(USER_DETAILS || {});
      initializeForm(USER_DETAILS || {});
    } else {
      // Prefill from userCreds when no USER_DETAILS
      const dataToUse = userCreds?.data || userCreds || {};
      initializeForm(dataToUse);
      setIsEditing(true);
    }
  }, [USER_DETAILS, userCreds]);

  useEffect(() => {
    const updates = getUpdatedFields(initialValues || {}, formData || {});
    setIsChanged(Object.keys(updates || {}).length > 0);
  }, [formData, initialValues]);

  const initializeForm = (userData = {}) => {
    setFormData({
      companyName: userData?.companyName || "",
      companyLogo: userData?.companyLogo || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
    });
  };

  const getUpdatedFields = (initial = {}, current = {}) => {
    const updates = {};
    Object.keys(current || {}).forEach((key) => {
      if ((initial?.[key] || "") !== (current?.[key] || "")) {
        updates[key] = current?.[key] || "";
      }
    });
    return updates;
  };

  const handleChange = (value, name = "", isFileUpload = false) => {
    if (!isEditing) return;

    const finalValue = isFileUpload ? value || "" : value?.target?.value || "";

    setFormData((prev) => ({
      ...(prev || {}),
      [name]: finalValue,
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!isEditing) return;

    const updates = getUpdatedFields(initialValues || {}, formData || {});
    dispatch(UpdateUser({ payload: updates || {}, dispatch }));
    setIsEditing(false);
    setInitialValues(formData || {});
    setIsChanged(false);
  };

  const renderInput = ({
    type = "text",
    name = "",
    placeholder = "",
    required = false,
    disabled = false,
  }) => (
    <input
      type={type}
      name={name}
      value={formData?.[name] || ""}
      placeholder={placeholder}
      required={required}
      disabled={!isEditing || disabled}
      onChange={(e) => handleChange(e, name)}
      className={`${styles?.inputField || ""} ${
        disabled ? styles?.disabledField || "" : ""
      }`}
    />
  );

  const renderImageUpload = ({ name = "" }) => (
    <div className={styles?.uploadField || ""}>
      <ImgCrop aspect={1}>
        <Upload
          listType="picture-card"
          showUploadList={false}
          disabled={!isEditing}
          customRequest={({ file, onSuccess, onError }) =>
            uploadToS3({
              file: file || null,
              restUrl: restUrl|| "",
              onUploaded: (uploadedUrl) =>
                handleChange(uploadedUrl || "", name, true),
              onSuccess: onSuccess || (() => {}),
              onError: onError || (() => {}),
            })
          }
        >
          {formData?.[name] ? (
            <img
              src={formData?.[name] || ""}
              alt="Company Logo"
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          ) : (
            <div style={{ padding: "4px 12px" }}>+ Upload Logo</div>
          )}
        </Upload>
      </ImgCrop>
    </div>
  );

  const formFields = [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      placeholder: "Enter company name",
      required: true,
    },
    {
      name: "companyLogo",
      label: "Company Logo",
      type: "upload",
      required: false,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter company email",
      required: true,
      disabled: true, // Email should not be editable
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "Enter phone number",
      required: true,
    },
  ];

  return (
    <>
      <div className={styles?.headertitleCont || ""}>
        <p className={styles?.formTitle || ""}>Company Details</p>
        {hasUserId && (
          <div className={styles?.editButtonContainer || ""}>
            <Button type="dashed" onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={styles?.dynamicFormContainer || ""}
      >
        {/* <form className={styles.dynamicFormContainer}> */}
        {(formFields || []).map((field, idx) => (
          <div
            key={idx}
            className={`${styles?.formField || ""} ${
              field?.type === "upload" ? styles?.uploadfieldmain || "" : ""
            }`}
          >
            <label>{field?.label || ""}:</label>
            {field?.type === "upload"
              ? renderImageUpload(field || {})
              : renderInput(field || {})}
          </div>
        ))}

        <div className={styles?.buttonContainer || ""}>
          <Button
            type="primary"
            htmlType="submit"
            className={styles?.saveButton || ""}
            disabled={!isChanged || !isEditing}
          >
            {hasUserId ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
}
