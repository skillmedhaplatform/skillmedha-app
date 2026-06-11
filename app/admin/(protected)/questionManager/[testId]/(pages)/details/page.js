"use client";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
  Input,
  Upload,
  Select,
  Button,
  message,
  Divider,
  Space,
  Tooltip,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import styles from "../../form.module.scss";
import {
  addSkill,
  updateSkill,
  clearAddSkillState,
  getOneSKill,
} from "@/redux/slices/admin/cms/skillsSlice";
import { getSstorage } from "@/utils/windowMW";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

export default function Page() {
  const params = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const isNewSkill = params?.testId === "newSkill";
  const { canAccess, getPermissionMessage } = usePermissions();

  const ReduxState = useSelector((state) => ({
    SKILL: state.skill.skill?.value?.data,
    addSkillState: state.skill.addSkill,
    updateSkillState: state.skill.updateSkill, // Add this for update state
  }));

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isNewSkill && params?.testId) {
      dispatch(getOneSKill({ skillId: params.testId }));
    }
  }, [isNewSkill, params?.testId, dispatch]);

  useEffect(() => {
    if (isNewSkill) {
      setFormData({
        title: "",
        description: "",
      });
    } else {
      if (ReduxState.SKILL) {
        setFormData({
          title: ReduxState.SKILL.title || "",
          description: ReduxState.SKILL.description || "",
        });
      }
    }
  }, [isNewSkill, ReduxState.SKILL]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Please input the skill title!";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long!";
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description =
        "Description must be at least 10 characters long!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isNewSkill) {
      if (!canAccess(PERMISSION_VALUES.CREATE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
        return;
      }
    } else {
      if (!canAccess(PERMISSION_VALUES.EDIT)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }
    }
    if (validateForm()) {
      try {
        const submitData = {
          title: formData.title,
          description: formData.description || undefined,
        };

        let result;

        if (isNewSkill) {
          result = await dispatch(addSkill(submitData));
        } else {
          result = await dispatch(
            updateSkill({
              skillId: params?.testId,
              skillData: submitData,
            })
          );
        }

        const isSuccess = isNewSkill
          ? addSkill.fulfilled.match(result)
          : updateSkill.fulfilled.match(result);

        if (isSuccess) {
          message.success(
            isNewSkill
              ? "Skill added successfully!"
              : "Skill updated successfully!"
          );

          if (isNewSkill) {
            setFormData({
              title: "",
              description: "",
            });
          }

          setErrors({});
          dispatch(clearAddSkillState());

          router.push(
            `/admin/questionManager/${
              getSstorage("localSkillId") || params?.testId
            }/questionManager/questionsList`
          );
        } else {
          const isRejected = isNewSkill
            ? addSkill.rejected.match(result)
            : updateSkill.rejected.match(result);

          if (isRejected) {
            message.error(
              result.payload ||
                `Failed to ${isNewSkill ? "add" : "update"} skill`
            );
            dispatch(clearAddSkillState());
          }
        }
      } catch (error) {
        console.error("Error with skill:", error);
        message.error("An unexpected error occurred");
        dispatch(clearAddSkillState());
      }
    }
  };

  // Get the current operation state
  const currentOperationState = isNewSkill
    ? ReduxState.addSkillState
    : ReduxState.updateSkillState;

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.formContainer}>
        {/* Skill Title */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Skill Title *</label>
          <Input
            placeholder={
              isNewSkill ? "Enter skill title" : "Update skill title"
            }
            size="large"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            status={errors.title ? "error" : ""}
          />
          {errors.title && (
            <span className={styles.errorText}>{errors.title}</span>
          )}
        </div>

        {/* Skill Description */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <Input.TextArea
            placeholder={
              isNewSkill
                ? "Enter skill description (optional)"
                : "Update skill description"
            }
            size="large"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            status={errors.description ? "error" : ""}
            rows={4}
          />
          {formData.description.length > 0 &&
            formData.description.length < 10 && (
              <span className={styles.errorText}>
                {10 - formData.description.length} more characters required
              </span>
            )}
        </div>
      </div>

      {/* Submit Button */}
      <div className={styles.formGroupButton}>
        <Tooltip
          title={
            !isNewSkill
              ? !canAccess(PERMISSION_VALUES.EDIT)
                ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                : ""
              : !canAccess(PERMISSION_VALUES.CREATE)
              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
              : ""
          }
        >
          <span>
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={currentOperationState?.status === "pending"}
              disabled={
                currentOperationState?.status === "pending" ||
                (isNewSkill
                  ? !canAccess(PERMISSION_VALUES.CREATE)
                  : !canAccess(PERMISSION_VALUES.EDIT))
              }
              style={{ width: "100%" }}
            >
              {currentOperationState?.status === "pending"
                ? isNewSkill
                  ? "Adding Skill..."
                  : "Updating Skill..."
                : isNewSkill
                ? "Add Skill"
                : "Update Skill"}
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
