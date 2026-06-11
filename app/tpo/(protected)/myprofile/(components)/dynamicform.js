"use client";
import React, { useEffect, useState } from "react";
import { Button, Select, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import styles from "../form.module.scss";
import { useParams } from "next/navigation";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { useDispatch, useSelector } from "react-redux";
import { UpdateUser } from "@/redux/slices/tpo/userSlice";
import { getUpdatedFields, getUpdateKey } from "./functions";
import { handleS3Upload as uploadToS3 } from "@/utils/universalUtils/s3uploads";
import { restUrl } from "@/utils/universalUtils/urls";

const { Option } = Select;

const DynamicForm = ({ schema }) => {
  const USER_DETAILS = useSelector(
    (state) => state.user.UserDetails?.value?.data
  );
  const { form } = useParams();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [hasUserId, setHasUserId] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    const id = getLstorage("userId");
    if (id && USER_DETAILS) {
      setHasUserId(true);
      setInitialValues(USER_DETAILS);
      initializeForm(USER_DETAILS);
    } else {
      initializeForm();
      setIsEditing(true);
    }
    setFormReady(true);
  }, [USER_DETAILS]);

  useEffect(() => {
    const updateKey = getUpdateKey(form);
    const structuredData = updateKey ? { [updateKey]: formData } : formData;
    const updates = getUpdatedFields(initialValues, structuredData);
    setIsChanged(Object.keys(updates).length > 0);
  }, [formData, initialValues, form]);

  const initializeForm = (userData = {}) => {
    const updateKey = getUpdateKey(form);
    const relevantData = updateKey ? userData[updateKey] || {} : userData;
    const initial = {};
    schema?.fields?.forEach((field) => {
      let value = relevantData[field.name];
      if (field.type === "array") {
        initial[field.name] = Array.isArray(value) ? value : [{}];
      } else if (field.type === "group") {
        initial[field.name] = {};
        field.fields.forEach((subField) => {
          initial[field.name][subField.name] =
            value && value[subField.name] !== undefined
              ? value[subField.name]
              : "";
        });
      } else {
        initial[field.name] = value !== undefined ? value : "";
      }
    });
    setFormData(initial);
  };

  const handleChange = (
    value,
    name,
    index,
    arrayName,
    isAntSelect = false,
    groupName = null,
    type = "text"
  ) => {
    if (!isEditing) return;

    let finalValue = isAntSelect ? value : value.target.value;

    if (!isAntSelect && type === "tel") {
      finalValue = finalValue.replace(/\D/g, "").slice(0, 10);
    }

    if (groupName) {
      setFormData((prev) => ({
        ...prev,
        [groupName]: {
          ...prev[groupName],
          [name]: finalValue,
        },
      }));
    } else if (arrayName && Array.isArray(formData[arrayName])) {
      const updated = formData[arrayName].map((item) => ({ ...item }));
      updated[index][name] = finalValue;
      setFormData((prev) => ({ ...prev, [arrayName]: updated }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleAddArrayItem = (arrayName) => {
    if (!isEditing) return;
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), {}],
    }));
  };

  const handleRemoveArrayItem = (arrayName, index) => {
    if (!isEditing) return;
    const updated = [...formData[arrayName]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [arrayName]: updated }));
  };

  // ========== RENDER FIELD METHODS ========== //

  const renderField = (field) => {
    switch (field.type) {
      case "array":
        return renderArrayField(field);
      case "select":
        return renderSelect(field);
      case "ImageUpload":
      case "upload":
        return renderImageUpload(field);
      case "FileUpload":
        return renderFileUpload(field);
      case "group":
        return renderGroupField(field);
      default:
        return renderInput(field);
    }
  };

  const renderInput = ({ type, name, placeholder, required, disabled }) => (
    <input
      type={type}
      name={name}
      value={formData[name] ?? ""}
      required={required}
      disabled={disabled || !isEditing}
      onChange={(e) => handleChange(e, name, null, null, false, null, type)}
      className={styles.inputField}
    />
  );

  const renderSelect = ({ name, options, disabled }) => (
    <Select
      className={styles.selectField}
      placeholder="Select"
      value={formData[name] || undefined}
      onChange={(value) => handleChange(value, name, null, null, true)}
      disabled={disabled || !isEditing}
      allowClear
    >
      {options?.map((opt, idx) => (
        <Option key={idx} value={opt}>
          {opt}
        </Option>
      ))}
    </Select>
  );

  const renderImageUpload = ({ name }) => {
    const aspectRatio = name === "tpoLogo" ? 1 : 16 / 9;
    return (
      <div className={styles.uploadField}>
        <ImgCrop aspect={aspectRatio}>
          <Upload
            listType="picture-card"
            showUploadList={false}
            disabled={!isEditing}
            customRequest={({ file, onSuccess, onError }) =>
              uploadToS3({
                file,
                restUrl,
                onUploaded: (uploadedUrl) =>
                  setFormData((prev) => ({
                    ...prev,
                    [name]: uploadedUrl,
                  })),
                onSuccess,
                onError,
              })
            }
          >
            {formData[name] ? (
              <img
                src={formData[name]}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ) : (
              <div style={{ padding: "4px 12px" }}>+ Upload</div>
            )}
          </Upload>
        </ImgCrop>
      </div>
    );
  };

  const renderFileUpload = ({ name }) => {
    // Allow uploading any file, show its name and allow removal
    const fileList = formData[name]
      ? [
        {
          uid: "-1",
          name: formData[name].split("/").pop(),
          status: "done",
          url: formData[name],
        },
      ]
      : [];

    return (
      <div className={styles.uploadField}>
        <Upload
          beforeUpload={(file) => {
            uploadToS3({
              file,
              restUrl,
              onUploaded: (uploadedUrl) =>
                setFormData((prev) => ({
                  ...prev,
                  [name]: uploadedUrl,
                })),
            });
            return false; // prevent auto upload
          }}
          fileList={fileList}
          onRemove={() => {
            setFormData((prev) => ({
              ...prev,
              [name]: "",
            }));
          }}
          showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
          disabled={!isEditing}
        >
          {!formData[name] && (
            <Button disabled={!isEditing} type="dashed">
              Click to Upload
            </Button>
          )}
        </Upload>
      </div>
    );
  };

  const renderArrayField = ({ name: arrayName, label, itemFields }) => {
    const items = formData[arrayName] || [];

    return (
      <div key={arrayName} className={styles.arrayField}>
        <h3 className={styles.ArraySubtitle}>{label}</h3>
        {items.map((item, idx) => (
          <div key={idx} className={styles.arrayItem}>
            {itemFields.map((subField, subIdx) => (
              <div key={subIdx} className={styles.formField}>
                <label>{subField.label}:</label>

                {/* Handle selects */}
                {subField.type === "select" ? (
                  <Select
                    placeholder="Select"
                    className={styles.selectField}
                    value={item[subField.name] || undefined}
                    onChange={(value) =>
                      handleChange(value, subField.name, idx, arrayName, true)
                    }
                    disabled={subField.disabled || !isEditing}
                    allowClear
                  >
                    {subField.options?.map((opt, j) => (
                      <Option key={j} value={opt}>
                        {opt}
                      </Option>
                    ))}
                  </Select>
                ) : subField.type === "ImageUpload" ||
                  subField.type === "upload" ? (
                  // For ImageUpload in array subfields
                  <div>
                    {renderImageUploadForArray(arrayName, idx, subField)}
                  </div>
                ) : subField.type === "FileUpload" ? (
                  <div>
                    {renderFileUploadForArray(arrayName, idx, subField)}
                  </div>
                ) : (
                  <input
                    type={subField.type}
                    value={item[subField.name] || ""}
                    onChange={(e) =>
                      handleChange(
                        e,
                        subField.name,
                        idx,
                        arrayName,
                        false,
                        null,
                        subField.type
                      )
                    }
                    className={styles.inputField}
                    disabled={!isEditing}
                    required={subField.required}
                  />
                )}
              </div>
            ))}
            <div className={styles.arrayItemActions}>
              <Button
                danger
                type="dashed"
                onClick={() => handleRemoveArrayItem(arrayName, idx)}
                disabled={!isEditing}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="primary"
          onClick={() => handleAddArrayItem(arrayName)}
          disabled={!isEditing}
        >
          Add New {label.replace(/Courses\s\((.+?)\)/, "$1 Department")}
        </Button>
      </div>
    );
  };

  // Custom renderers for uploads inside array fields (to pass correct state keys)
  const renderImageUploadForArray = (arrayName, index, field) => {
    const fieldKey = field.name;
    const currentUrl = formData[arrayName]?.[index]?.[fieldKey] || "";
    const aspectRatio = fieldKey === "tpoLogo" ? 1 : 16 / 9;

    return (
      <div className={styles.uploadField}>
        <ImgCrop aspect={aspectRatio}>
          <Upload
            listType="picture-card"
            showUploadList={false}
            disabled={!isEditing}
            customRequest={({ file, onSuccess, onError }) =>
              uploadToS3({
                file,
                restUrl,
                onUploaded: (uploadedUrl) => {
                  // Update nested array field url
                  setFormData((prev) => {
                    const updatedItems = [...(prev[arrayName] || [])];
                    updatedItems[index] = {
                      ...updatedItems[index],
                      [fieldKey]: uploadedUrl,
                    };
                    return {
                      ...prev,
                      [arrayName]: updatedItems,
                    };
                  });
                  onSuccess && onSuccess();
                },
                onError,
              })
            }
          >
            {currentUrl ? (
              <img
                src={currentUrl}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ) : (
              <div style={{ padding: "4px 12px" }}>+ Upload</div>
            )}
          </Upload>
        </ImgCrop>
      </div>
    );
  };

  const renderFileUploadForArray = (arrayName, index, field) => {
    const fieldKey = field.name;
    const fileUrl = formData[arrayName]?.[index]?.[fieldKey] || "";
    const fileList = fileUrl
      ? [
        {
          uid: "-1",
          name: fileUrl.split("/").pop(),
          status: "done",
          url: fileUrl,
        },
      ]
      : [];

    return (
      <div className={styles.uploadField}>
        <Upload
          beforeUpload={(file) => {
            uploadToS3({
              file,
              restUrl,
              onUploaded: (uploadedUrl) => {
                setFormData((prev) => {
                  const updatedItems = [...(prev[arrayName] || [])];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    [fieldKey]: uploadedUrl,
                  };
                  return {
                    ...prev,
                    [arrayName]: updatedItems,
                  };
                });
              },
            });
            return false;
          }}
          fileList={fileList}
          onRemove={() => {
            setFormData((prev) => {
              const updatedItems = [...(prev[arrayName] || [])];
              if (updatedItems[index]) {
                updatedItems[index][fieldKey] = "";
              }
              return {
                ...prev,
                [arrayName]: updatedItems,
              };
            });
          }}
          showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
          disabled={!isEditing}
        >
          {!fileUrl && (
            <Button disabled={!isEditing} type="dashed">
              Click to Upload
            </Button>
          )}
        </Upload>
      </div>
    );
  };

  const renderGroupField = ({ name: groupName, label, fields }) => {
    const groupData = formData[groupName] || {};

    return (
      <div
        key={groupName}
        className={styles.groupField}
        style={{ width: "100%" }}
      >
        <h3 className={styles.ArraySubtitle}>{label}</h3>
        {fields.map((field, idx) => (
          <div key={idx} className={styles.formField} style={{ width: "100%" }}>
            <label>{field.label}:</label>
            {field.type === "select" ? (
              <Select
                placeholder="Select"
                className={styles.selectField}
                value={groupData[field.name] || undefined}
                onChange={(value) =>
                  handleChange(value, field.name, null, null, true, groupName)
                }
                disabled={field.disabled || !isEditing}
                allowClear
              >
                {field.options?.map((opt, j) => (
                  <Option key={j} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            ) : (
              <input
                type={field.type}
                value={groupData[field.name] || ""}
                onChange={(e) =>
                  handleChange(
                    e,
                    field.name,
                    null,
                    null,
                    false,
                    groupName,
                    field.type
                  )
                }
                className={styles.inputField}
                disabled={!isEditing}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // ========= Submit Handler ========= //

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditing) return;
    const updateKey = getUpdateKey(form);
    const structuredData = updateKey ? { [updateKey]: formData } : formData;
    const updates = getUpdatedFields(initialValues, structuredData);

    dispatch(UpdateUser({ payload: updates, dispatch }));

    setIsEditing(false);
    setInitialValues(structuredData);
    setIsChanged(false);
  };

  // ======= RENDER FORM ======= //

  if (!formReady) {
    return (
      <div style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: "16px",
            alignItems: "center",
          }}>
            <div style={{
              height: "20px",
              borderRadius: "6px",
              background: "#f1f5f9",
              animation: "formShimmer 1.5s infinite",
              animationDelay: `${i * 0.05}s`,
            }}/>
            <div style={{
              height: "40px",
              borderRadius: "8px",
              background: "#f1f5f9",
              animation: "formShimmer 1.5s infinite",
              animationDelay: `${i * 0.08}s`,
            }}/>
          </div>
        ))}
        <style>{`
          @keyframes formShimmer {
            0%   { opacity: 1; }
            50%  { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className={styles.headertitleCont}>
        <h1 className={styles.formTitle}>{schema?.title}</h1>
        {hasUserId && (
          <div className={styles.editButtonContainer}>
            <Button type="dashed" onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className={styles.dynamicFormContainer}>
        {schema?.fields?.map((field, idx) => (
          <div
            key={idx}
            className={`${styles.formField} ${field?.type === "ImageUpload" && styles.uploadfieldmain
              }`}
          >
            {field.type !== "array" && field.type !== "group" && (
              <label>{field.label}:</label>
            )}
            {renderField(field)}
          </div>
        ))}

        <div className={styles.buttonContainer}>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.saveButton}
            disabled={!isChanged || !isEditing}
          >
            {hasUserId ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default DynamicForm;
