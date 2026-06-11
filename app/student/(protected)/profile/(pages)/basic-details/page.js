"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useDispatch, useSelector } from "react-redux";
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
          <React.Fragment key={item.name}>
            <h3 className="text-lg font-semibold text-gray-800 my-3">{item.label}</h3>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              {item.fields.map((subField) => (
                <div
                  key={`${item.name}-${subField.name}`}
                  style={{
                    flex: "1 1 45%",
                    minWidth: "40%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label className="text-gray-700 font-medium">{subField.label}</label>
                  <input
                    type={` text`}
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
                    className="w-[60%] border-[0.5px] border-solid border-gray-400 outline-none p-2 rounded-[5px] text-[16px]"
                  />
                </div>
              ))}

              {index === 0 && (
                <div style={{ fontSize: "18px" }}>
                  <Checkbox
                    checked={isCurrentSameAsPermanent}
                    disabled={!isEditing}
                    style={{ fontSize: "16px" }}
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
          </React.Fragment>
        );
      });
    }

    if (field.type === "array") {
      return (
        <div key={field.name} style={{ width: "100%" }}>
          {(formData[field.name] || []).map((item, index) => (
            <div
              key={index}
              style={{
                width: "100%",
                borderBottom: "1px solid lightgray",
                paddingBottom: "1rem",
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {field.itemFields.map((subField) => (
                <div
                  key={subField.name}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label style={{ width: "15%" }} className="text-gray-700 font-medium">{subField.label}</label>
                  <input
                    type={subField.type}
                    placeholder={subField.placeholder || ""}
                    value={item?.[subField.name] ?? ""}
                    onChange={(e) =>
                      handleArrayChange(index, subField.name, e.target.value)
                    }
                    disabled={!isEditing}
                    style={{ flex: 1, marginTop: ".5rem" }}
                    className="w-[60%] border-[0.5px] border-solid border-gray-400 outline-none p-2 rounded-[5px] text-[16px]"
                  />
                </div>
              ))}

              {isEditing && (
                <Button
                  type="dashed"
                  danger
                  style={{ marginTop: "8px", alignSelf: "flex-end" }}
                  onClick={() => deleteSocialProfile(index)}
                >
                  <MdDelete />
                </Button>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div
          key={field.name}
          style={{ width: "100%", display: "flex", alignItems: "center" }}
        >
          <label style={{ width: "20%" }} className="text-gray-700 font-medium">{field.label}</label>
          <Select
            name={field.name}
            value={formData?.[field.name] ?? undefined}
            onChange={(value) =>
              handleChange({ target: { name: field.name, value } })
            }
            disabled={!isEditing || field.disable}
            style={{ flex: 1 }}
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
        <div
          key={field.name}
          style={{ width: "100%", display: "flex", alignItems: "center" }}
        >
          <label style={{ width: "20%", display: "flex" }} className="text-gray-700 font-medium">{field.label}</label>
          <CustomDropdownSelect
            isEditing={isEditing}
            disabled={!isEditing || field.disable}
            placeholder={field.placeholder || ""}
            style={{ flex: 1 }}
            value={formData?.[field.name] ?? ""}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, collegeName: value }))
            }
          />
        </div>
      );
    }

    return (
      <div
        key={field.name}
        style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
      >
        {field.type === "textarea" ? (
          <div style={{ width: "100%" }}>
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

            {field.name === "professionalSummary" && isEditing && (
              <Button
                type="primary"
                onClick={rephraseSummary}
                style={{ marginTop: 8 }}
                className="bg-[#1E69DA] hover:bg-[#219653] border-none shadow-none text-white font-semibold"
              >
                Rephrase using AI
              </Button>
            )}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            {field?.type !== "textarea" && (
              <label
                style={{
                  width: "20%",
                  minWidth: "20%",
                  display: "flex",
                }}
              >
                <span className="text-gray-700 font-medium">{field.label}</span>
              </label>
            )}
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder || ""}
              value={formData?.[field.name] ?? ""}
              onChange={handleChange}
              disabled={!isEditing || field.disable}
              required={field.required}
              className="w-[60%] border-[0.5px] border-solid border-gray-400 outline-none p-2 rounded-[5px] text-[16px]"
              style={{ flex: 1, width: "80%" }}
            />
            {field.name === "phone" && phoneError && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {phoneError}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start justify-start w-[99.5%] relative">
      <StudentPageHeader section="Profile" title="Basic Details" />
      <div className="w-[98%] py-3 px-4 text-2xl font-[800] sticky top-0 bg-[#f5f5f5] z-[3] flex flex-row items-center justify-between border-b border-gray-200 shadow-sm rounded-t-lg">
        <p className="text-2xl font-[800] m-0 text-gray-800">Basic Details</p>
        <Button 
          type="primary" 
          htmlType="button" 
          onClick={toggleEdit}
          className="bg-[#1E69DA] hover:bg-[#219653] border-none shadow-none text-white font-semibold px-6"
        >
          {isEditing ? "Cancel Edit" : "Edit"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        {/* About Section */}
        <div className="w-[98%] py-2 px-4 flex flex-col items-start justify-start gap-4 mt-2">
          <div className="border-b border-solid border-gray-300 w-full flex flex-row items-center justify-between gap-4 pb-4 sticky top-[6.2%] bg-[#f5f5f5] z-[2] pt-1">
            <p className="text-[20px] font-bold flex gap-2 items-center m-0">
              About
              <span>-</span>
              {studentDetails?.aboutVerificationType === "approved" ? (
                <div className="text-green-500">Verified</div>
              ) : studentDetails?.aboutVerificationType === "resubmission" ? (
                <div className="text-red-500">Re-Submit</div>
              ) : (
                <div className="text-[#ffc400]">Not Verified.</div>
              )}
            </p>
          </div>

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

        {/* Address Section */}
        {studentProfileSchema
          .filter((f) => f.name === "addresses")
          .map((field) => (
            <div key={field.name} className="w-[98%] py-2 px-4 my-2 flex flex-col items-start justify-start gap-4">
              <div className="border-b border-solid border-gray-300 w-full flex flex-row items-center justify-between gap-4 pb-4 sticky top-[6.2%] bg-[#f5f5f5] z-[2] pt-1">
                <p className="text-[20px] font-bold flex gap-2 items-center m-0">
                  Address
                  <span>-</span>
                  {studentDetails?.addresses?.verificationType ===
                  "approved" ? (
                    <div className="text-green-500">Verified</div>
                  ) : studentDetails?.addresses?.verificationType ===
                    "resubmission" ? (
                    <div className="text-red-500">Re-Submit</div>
                  ) : (
                    <div className="text-[#ffc400]">Not Verified.</div>
                  )}
                </p>
              </div>
              {renderField(field)}
            </div>
          ))}

        {/* Summary Section */}
        {studentProfileSchema
          .filter((f) => f.name === "professionalSummary")
          .map((field) => (
            <div key={field.name} className="w-[98%] py-2 px-4 my-2 flex flex-col items-start justify-start gap-4">
              <div className="border-b border-solid border-gray-300 w-full flex flex-row items-center justify-between gap-4 pb-4 sticky top-[6.2%] bg-[#f5f5f5] z-[2] pt-1">
                <p className="text-[20px] font-bold flex gap-2 items-center m-0">
                  Summary
                  <span>-</span>
                  {studentDetails?.summaryVerificationType === "approved" ? (
                    <div className="text-green-500">Verified</div>
                  ) : studentDetails?.summaryVerificationType ===
                    "resubmission" ? (
                    <div className="text-red-500">Re-Submit</div>
                  ) : (
                    <div className="text-[#ffc400]">Not Verified.</div>
                  )}
                </p>
              </div>
              {renderField(field)}
            </div>
          ))}

        {/* Links Section */}
        {studentProfileSchema
          .filter((f) => f.type === "array")
          .map((field) => (
            <div key={field.name} className="w-[98%] py-2 px-4 my-2 flex flex-col items-start justify-start gap-4">
              <div className="border-b border-solid border-gray-300 w-full flex flex-row items-center justify-between gap-4 pb-4 sticky top-[6.2%] bg-[#f5f5f5] z-[2] pt-1">
                <p className="text-[20px] font-bold flex gap-2 items-center m-0">
                  Social Media Accounts & Profiles
                  <span>-</span>
                  {studentDetails?.linksVerificationType === "approved" ? (
                    <div className="text-green-500">Verified</div>
                  ) : studentDetails?.linksVerificationType ===
                    "resubmission" ? (
                    <div className="text-red-500">Re-Submit</div>
                  ) : (
                    <div className="text-[#ffc400]">Not Verified.</div>
                  )}
                </p>
                {isEditing && (
                  <Button
                    type="primary"
                    htmlType="button"
                    onClick={addSocialProfile}
                    className="bg-[#1E69DA] hover:bg-[#219653] border-none shadow-none text-white font-semibold"
                  >
                    + Add Social Profile
                  </Button>
                )}
              </div>
              {renderField(field)}
            </div>
          ))}

        {/* Save Button inside form for semantic correctness */}
        {isEditing && (
          <div className="w-[98%] p-2 flex items-end justify-end sticky bottom-0 bg-[#f5f5f5] z-[9]">
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: `${phoneError ? "#0c0c0c" : "#24A058"}`,
              }}
              className="border-0 py-2 px-4 rounded-full bg-[#1E69DA] text-white text-[16px] font-bold cursor-pointer"
              disabled={phoneError}
            >
              Save Profile
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
