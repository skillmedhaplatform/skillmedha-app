"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useDispatch, useSelector } from "react-redux";
import formStyles from "../../form.module.scss";
import { studentProfileSchema } from "../../formschema";
import { getUpdatedFields } from "@/universalUtils/getupdatedFields";
import { fetchAndSetPincodeDetails } from "@/redux/slices/myprofile/basicDetailsSlice";
import { CustomDropdownSelect } from "../_utils/customDropdown";
import { aiUrl } from "@/config/urls";
import { Button, Checkbox, message, Select } from "antd";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { updateStudent } from "@/redux/slices/student";
import TextEditor from "@/universalUtils/editor";
import { getLstorage } from "@/universalUtils/windowMW";

const { Option } = Select;

function initializeFormWithDefaults(schema, data = {}) {
  const result = {};
  schema.forEach((field) => {
    if (field.type === "object" && Array.isArray(field.itemFields)) {
      result[field.name] = {};
      field.itemFields.forEach((item) => {
        result[field.name][item.name] = {};
        item.fields.forEach((subField) => {
          result[field.name][item.name][subField.name] =
            data?.[field.name]?.[item.name]?.[subField.name] ?? "";
        });
      });
    } else if (field.type === "array") {
      result[field.name] = data?.[field.name] ?? [];
    } else {
      result[field.name] = data?.[field.name] ?? "";
    }
  });
  return result;
}

export default function StudentProfileForm() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [initialVal, setIntialVal] = useState({});
  const [isCurrentSameAsPermanent, setIsCurrentSameAsPermanent] =
    useState(false);

  // Initialize formData and checkbox flag whenever studentDetails changes
  useEffect(() => {
    if (studentDetails && Object.keys(studentDetails).length > 0) {
      const initialized = initializeFormWithDefaults(
        studentProfileSchema,
        studentDetails
      );
      setFormData(initialized);
      setIntialVal(initialized);

      // Initialize isCurrentSameAsPermanent from addresses.sameAsCurrent (boolean or string)
      const sameAsCurrent =
        studentDetails.addresses?.sameAsCurrent === true ||
        studentDetails.addresses?.sameAsCurrent === "yes";
      setIsCurrentSameAsPermanent(sameAsCurrent);
    } else {
      const initialized = initializeFormWithDefaults(studentProfileSchema);
      setFormData(initialized);
      setIntialVal(initialized);
      setIsCurrentSameAsPermanent(false);
    }
  }, [studentDetails]);
  const validatePhoneNumber = (value) => {
    if (!value) return "";

    // Indian phone number: +91 followed by 10 digits
    const phoneRegex = /^\+91[6-9]\d{9}$/;

    if (value.length < 13) {
      return "Phone number must be 13 characters (+91xxxxxxxxxx)";
    }

    if (!phoneRegex.test(value)) {
      return "Invalid phone format. Use +91xxxxxxxxxx (must start with 6-9)";
    }

    return "";
  };
  const [phoneError, setPhoneError] = useState("");

  // Handlers for field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "phone" || name === "alternatePhone") {
      processedValue = value.replace(/[^\d+]/g, "").slice(0, 13);
      const error = validatePhoneNumber(processedValue);
      if (name === "phone") setPhoneError(error);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    console.log(name, value);
  };

  const handleNestedChange = (parentName, itemName, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [parentName]: {
        ...prev[parentName],
        [itemName]: {
          ...prev[parentName][itemName],
          [fieldName]: value,
        },
      },
    }));

    if (fieldName === "pincode" && value.length === 6) {
      dispatch(fetchAndSetPincodeDetails({ pincode: value }))
        .then((res) => {
          const data = res?.payload;
          if (data) {
            setFormData((prev) => ({
              ...prev,
              [parentName]: {
                ...prev[parentName],
                [itemName]: {
                  ...prev[parentName][itemName],
                  cityName: data.cityName || "",
                  districtName: data.districtName || "",
                  stateName: data.stateName || "",
                },
              },
            }));
          }
        })
        .catch((err) => {
          console.error("Failed to fetch pincode details:", err);
        });
    }
  };

  const handleArrayChange = (index, key, value) => {
    const updated = [...formData.links];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setFormData((prev) => ({
      ...prev,
      links: updated,
    }));
  };

  // Add a new social profile link
  const addSocialProfile = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...(prev.links || []), { title: "", link: "" }],
    }));
  };

  // Delete a social profile link by index
  const deleteSocialProfile = (index) => {
    setFormData((prev) => {
      const updatedLinks = [...(prev.links || [])];
      updatedLinks.splice(index, 1);
      return {
        ...prev,
        links: updatedLinks,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(formData);
    if (!formData.gender || formData.gender.trim() === "") {
      message.error("Please select your gender.");
      return;
    }
    if (
      Array.isArray(formData.links) &&
      formData.links.some((l) => !l.title?.trim() || !l.link?.trim())
    ) {
      message.error("Please fill all link fields (title and link).");
      return;
    }

    const updates = getUpdatedFields(initialVal, formData);

    // console.log("Submitted updates:", updates);

    if (!studentDetails || !studentDetails._id) {
      message.error("Student ID missing, can't update.");
      return;
    }

    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: {
          _id: studentDetails?._id,
          ...updates,
        },
      })
    );

    setIsEditing(false);
  };

  const toggleEdit = () => {
    if (isEditing) {
      setFormData(initialVal);
      const sameAsCurrent =
        studentDetails?.addresses?.sameAsCurrent === true ||
        studentDetails?.addresses?.sameAsCurrent === "yes";
      setIsCurrentSameAsPermanent(sameAsCurrent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const rephraseSummary = async () => {
    const hide = message.loading("Please wait while rephrasing summary...", 0);
    try {
      const { data } = await axios.post(
        aiUrl + "/repharseSummary",
        {
          summary: formData?.professionalSummary || "",
          userType: "student",
        },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      if (data) {
        message.success("Summary Rephrased Successfully");
        setFormData((prev) => ({
          ...prev,
          professionalSummary: data,
        }));
      }
      return data;
    } catch (error) {
      message.error("Failed to rephrase summary");
      console.error(error);
    } finally {
      hide();
    }
  };

  // Helper function to render fields
  const renderField = (field) => {
    if (field.type === "object") {
      return field.itemFields.map((item, index) => {
        return (
          <div key={item.name} className={formStyles.fullWidthField} style={{ marginBottom: "1.5rem" }}>
            <h3 className="text-md font-bold text-gray-700 mb-3">{item.label}</h3>
            <div className={formStyles.dynamicFormContainer} style={{ padding: "0.5rem 0" }}>
              {item.fields.map((subField) => (
                <div key={`${item.name}-${subField.name}`} className={formStyles.formField}>
                  <label>{subField.label}</label>
                  <input
                    type="text"
                    name={subField.name}
                    placeholder={subField.placeholder || ""}
                    value={
                      formData?.[field.name]?.[item.name]?.[subField.name] ?? ""
                    }
                    onChange={(e) => {
                      let value = e.target.value;

                      if (field.maxLength && value.length > field.maxLength) {
                        value = value.slice(0, field.maxLength);
                      }

                      handleNestedChange(
                        field.name,
                        item.name,
                        subField.name,
                        value
                      );
                    }}
                    disabled={!isEditing}
                    required={subField.required}
                    className={formStyles.inputField}
                  />
                </div>
              ))}
            </div>

            {index === 0 && (
              <div style={{ marginTop: "1rem" }}>
                <Checkbox
                  checked={isCurrentSameAsPermanent}
                  disabled={!isEditing}
                  style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsCurrentSameAsPermanent(checked);
                    if (checked) {
                      setFormData((prev) => ({
                        ...prev,
                        addresses: {
                          ...prev.addresses,
                          permanentAddress: {
                            ...prev.addresses.currentAddress,
                          },
                        },
                      }));
                    }
                  }}
                >
                  Current address is same as permanent address
                </Checkbox>
              </div>
            )}
          </div>
        );
      });
    }

    if (field.type === "array") {
      return (
        <div key={field.name} className={formStyles.arrayField}>
          {(formData[field.name] || []).map((item, index) => (
            <div key={index} className={formStyles.arrayItem}>
              {field.itemFields.map((subField) => (
                <div key={subField.name} className={formStyles.formField}>
                  <label>{subField.label}</label>
                  <input
                    type={subField.type}
                    placeholder={subField.placeholder || ""}
                    value={item?.[subField.name] ?? ""}
                    onChange={(e) =>
                      handleArrayChange(index, subField.name, e.target.value)
                    }
                    disabled={!isEditing}
                    className={formStyles.inputField}
                  />
                </div>
              ))}

              {isEditing && (
                <div className={formStyles.arrayItemActions}>
                  <Button
                    type="dashed"
                    danger
                    onClick={() => deleteSocialProfile(index)}
                  >
                    Delete Link
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.name} className={formStyles.formField}>
          <label>{field.label}</label>
          <Select
            name={field.name}
            value={formData?.[field.name] ?? undefined}
            onChange={(value) =>
              handleChange({ target: { name: field.name, value } })
            }
            disabled={!isEditing || field.disable}
            className={formStyles.selectField}
            placeholder={`Select ${field.label}`}
            allowClear
            showSearch
          >
            {(field.options || []).map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </div>
      );
    }

    if (field.type === "selectandAdd") {
      return (
        <div key={field.name} className={formStyles.formField}>
          <label>{field.label}</label>
          <CustomDropdownSelect
            isEditing={isEditing}
            disabled={!isEditing || field.disable}
            placeholder={field.placeholder || ""}
            style={{ width: "100%" }}
            value={formData?.[field.name] ?? ""}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, collegeName: value }))
            }
          />
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.name} className={formStyles.fullWidthField}>
          <label>{field.label}</label>
          <div style={{ marginTop: "0.5rem" }}>
            <TextEditor
              initialContent={{ [field.name]: formData?.[field.name] || "" }}
              editorFun={(value) => {
                if (!isEditing || field.disable) return;

                try {
                  const parsedValue = JSON.parse(value);
                  handleChange({
                    target: { name: field.name, value: parsedValue },
                  });
                } catch (error) {
                  handleChange({ target: { name: field.name, value } });
                }
              }}
              name={field.name}
              readOnly={!isEditing || field.disable}
            />
          </div>

          {field.name === "professionalSummary" && isEditing && (
            <Button
              type="primary"
              onClick={rephraseSummary}
              style={{ marginTop: 12, fontWeight: '600', borderRadius: '8px' }}
              className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
            >
              Rephrase using AI
            </Button>
          )}
        </div>
      );
    }

    return (
      <div key={field.name} className={formStyles.formField}>
        <label>{field.label}</label>
        <input
          type={field.type}
          name={field.name}
          placeholder={field.placeholder || ""}
          value={formData?.[field.name] ?? ""}
          onChange={handleChange}
          disabled={!isEditing || field.disable}
          required={field.required}
          className={formStyles.inputField}
        />
        {field.name === "phone" && phoneError && (
          <span style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
            {phoneError}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card matching TPO */}
      <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <div className={formStyles.headerLeft}>
          <h1 className={formStyles.formTitle}>Basic Details</h1>
          <p className={formStyles.formSubtitle}>Update your basic details and address information below</p>
        </div>
        <div className={formStyles.editButtonContainer}>
          <Button 
            onClick={toggleEdit}
            className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
            style={{ fontWeight: '600', borderRadius: '8px', padding: '4px 16px' }}
          >
            {isEditing ? "Cancel Edit" : "Edit Details"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Card 1: About Details */}
        <div className={formStyles.formContainer}>
          <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
            <span>Personal Information</span>
            {studentDetails?.aboutVerificationType === "approved" ? (
              <span className="text-sm font-semibold text-green-500">Verified</span>
            ) : studentDetails?.aboutVerificationType === "resubmission" ? (
              <span className="text-sm font-semibold text-red-500">Re-Submit</span>
            ) : (
              <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
            )}
          </h2>
          <div className={formStyles.dynamicFormContainer}>
            {studentProfileSchema
              .filter(
                (f) =>
                  f.name !== "addresses" &&
                  f.name !== "professionalSummary" &&
                  f.type !== "array"
              )
              .map((field) => (
                <React.Fragment key={field.name}>
                  {renderField(field)}
                </React.Fragment>
              ))}
          </div>
        </div>

        {/* Card 2: Address Details */}
        {studentProfileSchema
          .filter((f) => f.name === "addresses")
          .map((field) => (
            <div key={field.name} className={formStyles.formContainer}>
              <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
                <span>Address Details</span>
                {studentDetails?.addresses?.verificationType === "approved" ? (
                  <span className="text-sm font-semibold text-green-500">Verified</span>
                ) : studentDetails?.addresses?.verificationType === "resubmission" ? (
                  <span className="text-sm font-semibold text-red-500">Re-Submit</span>
                ) : (
                  <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
                )}
              </h2>
              {renderField(field)}
            </div>
          ))}

        {/* Card 3: Summary Details */}
        {studentProfileSchema
          .filter((f) => f.name === "professionalSummary")
          .map((field) => (
            <div key={field.name} className={formStyles.formContainer}>
              <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
                <span>Professional Summary</span>
                {studentDetails?.summaryVerificationType === "approved" ? (
                  <span className="text-sm font-semibold text-green-500">Verified</span>
                ) : studentDetails?.summaryVerificationType === "resubmission" ? (
                  <span className="text-sm font-semibold text-red-500">Re-Submit</span>
                ) : (
                  <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
                )}
              </h2>
              <div className={formStyles.dynamicFormContainer} style={{ paddingBottom: 0 }}>
                {renderField(field)}
              </div>
            </div>
          ))}

        {/* Card 4: Links Section */}
        {studentProfileSchema
          .filter((f) => f.type === "array")
          .map((field) => (
            <div key={field.name} className={formStyles.formContainer}>
              <div className="border-b border-solid border-slate-100 w-full flex flex-row items-center justify-between pb-3 mb-4">
                <h2 className="text-lg font-extrabold text-[#0f172a] m-0 flex gap-2 items-center">
                  <span>Social Profiles</span>
                  <span className="text-xs font-normal text-slate-400">•</span>
                  {studentDetails?.linksVerificationType === "approved" ? (
                    <span className="text-sm font-semibold text-green-500">Verified</span>
                  ) : studentDetails?.linksVerificationType === "resubmission" ? (
                    <span className="text-sm font-semibold text-red-500">Re-Submit</span>
                  ) : (
                    <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
                  )}
                </h2>
                {isEditing && (
                  <Button
                    onClick={addSocialProfile}
                    className={formStyles.addNewBtn}
                    style={{ fontWeight: '600', borderRadius: '8px', padding: '4px 16px' }}
                  >
                    + Add Profile
                  </Button>
                )}
              </div>
              {renderField(field)}
            </div>
          ))}

        {/* Save Button */}
        {isEditing && (
          <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={phoneError}
              className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
              style={{ fontWeight: '600', borderRadius: '8px', padding: '10px 24px', height: 'auto' }}
            >
              Save Details
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
