"use client";
import React, { useState, useEffect, useRef } from "react";
import AboutStyles from "../styles/about.module.scss";
import { useDispatch, useSelector } from "react-redux";

import {
  createTests,
  getOneTests,
  updateTest,
  updateTestValues,
} from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { Alert, message, Skeleton, Tooltip, Radio } from "antd";
import { QuestionCircleOutlined, ClockCircleOutlined, StarOutlined } from "@ant-design/icons";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getLstorage, setSstorage } from "@/utils/universalUtils/windowMW";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import ChipInput from "@/utils/universalUtils/chipInput/chip";

import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import { BsUpload, BsInfoCircle, BsTrash } from "react-icons/bs";
import { FaCloudUploadAlt } from "react-icons/fa";
import { aiUrl, restUrl as skillmedhaRestUrl } from "@/utils/universalUtils/urls";

const About = () => {
  const values = useSelector((state) => state.steps.value);

  const SingleTest = useSelector((state) => state.tests.test);
  const newTest = useSelector((state) => state.tests.newTest);
  const singletestStatus = useSelector(
    (state) => state.tests.singleTestStatus.status,
  );

  const [testEvaluationvalue, setTestEvaluationvalue] = useState("Manual");

  const chipsVals = useSelector((state) => state.chipSlice);
  const [isUploadedLogo, setIsUploadedLogo] = useState(false);
  const [isUploadedLogoLoaded, setIsUploadedLogoLoaded] = useState(false);

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploadedLoaded, setIsUploadedLoaded] = useState(false);

  // thumbnail---------
  const [thumbnailImages, setThumbnailImages] = useState("");
  const [showThumbnail, setShowThumbnail] = useState();
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  // thumbnail---------
  // logo---------
  const [images, setImages] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [showLogo, setShowLogo] = useState();
  // logo---------

  useEffect(() => {
    if (SingleTest?.thumbnail?.length) {
      setShowThumbnail(true);
    } else {
      setShowThumbnail(false);
    }
  }, [SingleTest?.thumbnail]);

  useEffect(() => {
    if (SingleTest?.logo?.length) {
      setShowLogo(true);
    } else {
      setShowLogo(false);
    }
  }, [SingleTest?.logo]);

  const cropperRefs = useRef([]);
  const cropperThumbnailRefs = useRef([]);
  const { testCategory, testLanguage } = chipsVals;

  const testLanguageArr = testLanguage?.map(({ _id, ...rest }) => rest);
  const categoryArr = testCategory?.map(({ _id, ...rest }) => rest);

  useEffect(() => {
    dispatch(
      setFormValues({
        ...values,
        category: categoryArr,
        language: testLanguageArr,
      }),
    );
  }, [testCategory?.length, testLanguage?.length]);

  const dispatch = useDispatch();
  const nav = useRouter();

  const params = useParams();

  const selectedId = params["test-slug"]?.split("_id-")[1];

  useEffect(() => {
    if (selectedId && !SingleTest?._id) {
      dispatch(getOneTests({ _id: selectedId })).then((resp) => {
        if (resp?.payload) {
          dispatch(setFormValues(resp.payload));
        }
      });
    }
  }, [selectedId, SingleTest?._id, dispatch]);

  const cuurPath = usePathname();

  const sendEditorVals = (val, name) => {
    dispatch(setFormValues({ ...values, [name]: val }));
    dispatch(updateTestValues({ [name]: val }));
  };

  const handleSaveDraft = () => {
    if (params["test-slug"] == "new-test") {
      dispatch(createTests({ values, nav, cuurPath }));

      return;
    } else {
      const updatingBody = {
        title: values?.title,
        category: values?.category,
        shortDescription: values?.shortDescription,
        logo: values?.logo,
        thumbnail: values?.thumbnail,
        language: values?.language,
        testEvaluationType: values?.testEvaluationvalue,
      };

      dispatch(updateTest({ id: selectedId, updates: updatingBody }));
      // nav.replace("questionManager");
    }
  };

  const optionsTestEvaluationType = [
    {
      label: "Manual",
      value: "Manual",
    },
    {
      label: "Automatic",
      value: "Automatic",
    },
  ];

  // /////////////////////////////////////////////    Image Resizing Code ///////////////////////////////////////

  // logo ---------------------------------------------------------------------------

  const onChangeImage = (e) => {
    e.preventDefault();
    setShowLogo(false);
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImages(reader.result);
      setIsUploadedLogo(true);
      setIsUploadedLogoLoaded(true);
    };
    reader.readAsDataURL(files[0]);
  };

  const cropImage = async (e) => {
    e.preventDefault();

    const cropper = cropperRefs.current.cropper;
    const croppedCanvas = cropper.getCroppedCanvas();
    const croppedDataUrl = croppedCanvas.toDataURL();
    setImages(croppedDataUrl);

    const response = await fetch(croppedDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `cropped_image.png`, { type: "image/png" });

    const uploadResult = await uploadImageToS3(file);

    if (uploadResult?.file) {
      const addLogoUrl = uploadResult.file;
      setShowLogo(true);
      setLogoUrl(addLogoUrl);
      dispatch(setFormValues({ ...values, logo: addLogoUrl }));
    } else {
      console.error("Failed to upload file to S3");
    }
  };

  // thimbnail ---------------------------------------------------------------------------

  const onChangeThumbnail = (e) => {
    e.preventDefault();
    setShowThumbnail(false);
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnailImages(reader.result);
      setIsUploaded(true);
      setIsUploadedLoaded(true);
    };
    reader.readAsDataURL(files[0]);
  };

  const cropThumbnailImage = async (e) => {
    e.preventDefault();
    const cropper = cropperThumbnailRefs.current.cropper;
    const croppedCanvas = cropper.getCroppedCanvas();
    const croppedDataUrl = croppedCanvas.toDataURL();

    setThumbnailImages(croppedDataUrl);

    const response = await fetch(croppedDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `cropped_image.png`, { type: "image/png" });

    const uploadResult = await uploadImageToS3(file);

    if (uploadResult?.file) {
      const addThumbnailUrl = uploadResult?.file;
      setShowThumbnail(true);
      setThumbnailUrl(addThumbnailUrl);
      dispatch(setFormValues({ ...values, thumbnail: addThumbnailUrl }));
    } else {
      console.error("Failed to upload file to Cloudinary");
    }
  };
  const onDeleteThumbnail = () => {
    setShowThumbnail(false);
    setThumbnailUrl("");
    setThumbnailImages(null);
    setIsUploaded(false);
    setIsUploadedLoaded(false);
    cropperThumbnailRefs.current = null;
    dispatch(setFormValues({ ...values, thumbnail: "" }));
  };

  const onDeleteLogo = () => {
    setShowLogo(false);
    setLogoUrl("");
    setImages(null);
    setIsUploadedLogo(false);
    setIsUploadedLogoLoaded(false);
    cropperRefs.current = null;
    dispatch(setFormValues({ ...values, logo: "" }));
  };


  const uploadImageToS3 = async (imgFile) => {
    const bucketName = "skillmedha-utils";
    const OnLoad = message.loading("Uploading...");
    const formData = new FormData();
    formData.append("file", imgFile);
    setIsUploadedLoaded(false);
    setIsUploadedLogoLoaded(false);
    try {
      const { data } = await axios.post(
        skillmedhaRestUrl + "/uploadtos3?bucketName=" + bucketName,
        formData,
      );
      OnLoad();
      if (data?.file) message.success("Uploaded Successfully");
      setIsUploadedLoaded(true);
      setIsUploadedLogoLoaded(true);
      return data;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      return null;
    }
  };

  // /////////////////////////////////////////////    Image Resizing Code ///////////////////////////////////////

  const generateDesc = async () => {
    message.loading("Generating Text");
    const title = values?.title || SingleTest?.title;

    const { data } = await axios.post(aiUrl + "/generateTestDescription", {
      title: title,
    });

    if (data?.msg) {
      message.success("Description Generated");
      dispatch(setFormValues({ ...values, shortDescription: data?.msg }));
      // values.shortDescription = data?.msg
    }
  };
  // Helpers for Preview card
  const stripHtml = (html = "") => {
    return html.replace(/<[^>]*>/g, "");
  };

  const calculateTotalMarks = () => {
    if (!SingleTest?.questions?.length) return 0;
    return SingleTest.questions.reduce((total, question) => {
      let score =
        Number(question?.scoreSettings?.pointsForCorrectAns) ||
        Number(question?.scoreSettings?.PointsForEachCorrectAnswer) ||
        Number(question?.scoreSettings?.score) ||
        0;

      if (
        question?.scoreSettings?.PointsForEachCorrectAnswer &&
        question?.answer?.multipleChoice
      ) {
        const correctOptionsCount = Object.values(
          question.answer.multipleChoice
        ).filter((isCorrect) => isCorrect === true).length;

        score =
          correctOptionsCount *
          question.scoreSettings.PointsForEachCorrectAnswer;
      }

      const bonus = question?.scoreSettings?.bonusPointsForAllCorrect
        ? Number(question.scoreSettings.bonusPointsForAllCorrect)
        : 0;

      return total + score + bonus;
    }, 0);
  };

  const getDurationText = () => {
    const duration = SingleTest?.time?.testDuration?.testDuration?.duration;
    if (duration?.val1 && duration?.val2) {
      return `${String(duration.val1).padStart(2, "0")}H:${String(duration.val2).padStart(2, "0")}M`;
    }
    return "00H:30M";
  };

  // Helper to generate initials from test title
  const getInitials = (title = "") => {
    if (!title) return "T";
    const words = title.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + (words[1][0] || "")).toUpperCase();
  };

  // Helper to generate elegant gradient style for preview fallback logo
  const getGradientStyle = (title = "") => {
    const hash = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
        "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", // Blue
        "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", // Orange
        "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)", // Yellow
        "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)", // Teal
        "linear-gradient(135deg, #312e81 0%, #6366f1 100%)", // Indigo
    ];
    return gradients[hash % gradients.length];
  };

  const currentTitle = values?.title !== undefined ? values.title : SingleTest?.title || "";
  const currentCategory = values?.category && values.category.length > 0 ? values.category[0]?.name : SingleTest?.category?.[0]?.name || "";
  const currentShortDesc = values?.shortDescription ? stripHtml(values.shortDescription) : stripHtml(SingleTest?.shortDescription || "");
  const hasThumbnail = (thumbnailUrl || SingleTest?.thumbnail) && !(thumbnailUrl || SingleTest?.thumbnail).includes("20190605163315-sale-19736");

  return (
    <div className={AboutStyles.gridContainer}>
      {/* Left Column: Form Sections */}
      <div className={AboutStyles.mainForm}>
        {/* Card 1: Test Information */}
        <div className={AboutStyles.cardSection}>
          <div className={AboutStyles.sectionHeader}>
            <BsInfoCircle className={AboutStyles.sectionIcon} />
            <h3>Test Information</h3>
          </div>

          {/* Test Title */}
          <div className={AboutStyles.formGroup}>
            <div className={AboutStyles.labelRow}>
              <label>Test Title<span>*</span></label>
            </div>
            {singletestStatus === "pending" ? (
              <Skeleton.Input active={true} style={{ width: "100%", height: 40 }} />
            ) : (
              <input
                type="text"
                id="title"
                value={currentTitle}
                onChange={(e) => {
                  dispatch(setFormValues({ ...values, title: e.target.value }));
                  dispatch(updateTestValues({ title: e.target.value }));
                }}
                className={AboutStyles.inputField}
                maxLength="42"
                placeholder="Enter test title"
              />
            )}
            <span className={AboutStyles.infoText}>The Title of the test should not exceed 42 characters.</span>
          </div>

          {/* Category */}
          <div className={AboutStyles.formGroup}>
            <div className={AboutStyles.labelRow}>
              <label>Category</label>
            </div>
            <ChipInput
              type="test"
              name="category"
              keyName="testCategory"
              phVal="Enter category value and press enter"
              initialValue={SingleTest?.category}
            />
          </div>

          {/* Short Description */}
          <div className={AboutStyles.formGroup}>
            <div className={AboutStyles.labelRow}>
              <label>Short Description<span>*</span></label>
              <Tooltip title="Provide a concise summary between 250-300 characters for the banner.">
                <span className={AboutStyles.infoTooltip}><BsInfoCircle /></span>
              </Tooltip>
            </div>
            {singletestStatus === "pending" ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <div className={AboutStyles.editorWrapper}>
                <TextEditor
                  name="shortDescription"
                  editorFun={(val) => sendEditorVals(val, "shortDescription")}
                  initialContent={{
                    shortDescription: values?.shortDescription
                      ? values?.shortDescription
                      : SingleTest?.shortDescription,
                  }}
                />
              </div>
            )}
            <button className={AboutStyles.aiButton} onClick={generateDesc}>
              Generate description using AI
            </button>
          </div>
        </div>

        {/* Card 2: Media & Settings */}
        <div className={AboutStyles.cardSection}>
          <div className={AboutStyles.sectionHeader}>
            <BsInfoCircle className={AboutStyles.sectionIcon} />
            <h3>Media & Configuration</h3>
          </div>

          {/* Thumbnail */}
          <div className={AboutStyles.formGroup}>
            <div className={AboutStyles.labelRow}>
              <label>Thumbnail</label>
            </div>
            <div className={AboutStyles.uploadContainer}>
              {showThumbnail ? (
                <div className={AboutStyles.filePreviewRow}>
                  <span className={AboutStyles.fileName}>
                    {thumbnailUrl ? "new-thumbnail.png" : "aws-thumbnail.png"}
                  </span>
                  <div className={AboutStyles.actionBtns}>
                    <span className={AboutStyles.changeLabel}>
                      Change image
                      <input type="file" onChange={(e) => onChangeThumbnail(e)} />
                    </span>
                    <BsTrash className={AboutStyles.deleteBtn} onClick={onDeleteThumbnail} />
                  </div>
                </div>
              ) : (
                <div className={AboutStyles.uploadBox}>
                  <FaCloudUploadAlt className={AboutStyles.uploadIcon} />
                  <p>Drag and drop image here or <span>Choose File</span></p>
                  <input type="file" onChange={(e) => onChangeThumbnail(e)} className={AboutStyles.fileInput} />
                </div>
              )}

              {isUploaded && (
                <div className={AboutStyles.cropper_main_cont}>
                  <Cropper
                    className={AboutStyles.cropper_cont}
                    src={thumbnailImages}
                    aspectRatio={16 / 9}
                    guides={false}
                    ref={cropperThumbnailRefs}
                    viewMode={1}
                    background={false}
                    zoomOnWheel={false}
                    scalable={false}
                    movable={false}
                    initialAspectRatio={16 / 9}
                    dragMode="none"
                  />
                  <div className={AboutStyles.cropActionRow}>
                    <button onClick={(e) => cropThumbnailImage(e)}>Crop & Upload</button>
                    <button onClick={onDeleteThumbnail} className={AboutStyles.cancelCrop}>Cancel</button>
                  </div>
                </div>
              )}

              {showThumbnail && (
                <img
                  className={AboutStyles.imagePreview}
                  src={thumbnailUrl || SingleTest?.thumbnail}
                  alt="thumbnail preview"
                />
              )}
            </div>
            <span className={AboutStyles.infoText}>Recommended 800x450px, max 2MB.</span>
          </div>

          {/* Logo */}
          <div className={AboutStyles.formGroup}>
            <div className={AboutStyles.labelRow}>
              <label>Logo</label>
            </div>
            <div className={AboutStyles.uploadContainer}>
              {showLogo ? (
                <div className={AboutStyles.filePreviewRow}>
                  <span className={AboutStyles.fileName}>
                    {logoUrl ? "new-logo.png" : "aws-logo.png"}
                  </span>
                  <div className={AboutStyles.actionBtns}>
                    <span className={AboutStyles.changeLabel}>
                      Change
                      <input type="file" onChange={(e) => onChangeImage(e)} />
                    </span>
                    <BsTrash className={AboutStyles.deleteBtn} onClick={onDeleteLogo} />
                  </div>
                </div>
              ) : (
                <div className={AboutStyles.uploadBox}>
                  <FaCloudUploadAlt className={AboutStyles.uploadIcon} />
                  <p>Drag and drop image here or <span>Choose File</span></p>
                  <input type="file" onChange={(e) => onChangeImage(e)} className={AboutStyles.fileInput} />
                </div>
              )}

              {isUploadedLogo && (
                <div className={AboutStyles.cropper_main_cont}>
                  <Cropper
                    className={AboutStyles.cropper_cont}
                    src={images}
                    aspectRatio={1}
                    guides={false}
                    ref={cropperRefs}
                    viewMode={1}
                    background={false}
                    zoomOnWheel={false}
                    scalable={false}
                    movable={false}
                    initialAspectRatio={1}
                    dragMode="none"
                  />
                  <div className={AboutStyles.cropActionRow}>
                    <button onClick={(e) => cropImage(e)}>Crop & Upload</button>
                    <button onClick={onDeleteLogo} className={AboutStyles.cancelCrop}>Cancel</button>
                  </div>
                </div>
              )}

              {showLogo && (
                <img
                  className={AboutStyles.squareLogoPreview}
                  src={logoUrl || SingleTest?.logo}
                  alt="logo preview"
                />
              )}
            </div>
            <span className={AboutStyles.infoText}>Square logo, PNG with transparent background preferred.</span>
          </div>

          {/* Test Evaluation Type */}
          <div className={AboutStyles.formGroup}>
            <div className={AboutStyles.labelRow}>
              <label>Test Evaluation Type</label>
            </div>
            <div className={AboutStyles.toggleGroup}>
              <button
                className={testEvaluationvalue === "Manual" ? AboutStyles.active : ""}
                onClick={() => {
                  setTestEvaluationvalue("Manual");
                  dispatch(setFormValues({ ...values, testEvaluationType: "Manual" }));
                  dispatch(updateTestValues({ testEvaluationType: "Manual" }));
                }}
              >
                Manual
              </button>
              <button
                className={testEvaluationvalue === "Automatic" ? AboutStyles.active : ""}
                onClick={() => {
                  setTestEvaluationvalue("Automatic");
                  dispatch(setFormValues({ ...values, testEvaluationType: "Automatic" }));
                  dispatch(updateTestValues({ testEvaluationType: "Automatic" }));
                }}
              >
                Automatic
              </button>
            </div>
            <span className={AboutStyles.infoText}>
              Manual: Admin grades submissions. Automatic: Results calculated instantly.
            </span>
          </div>

          {/* Difficulty Level Dropdown */}
          <div className={AboutStyles.formGroup}>
            <div className={AboutStyles.labelRow}>
              <label>Difficulty Level</label>
            </div>
            <select
              value={values?.difficulty !== undefined ? values.difficulty : SingleTest?.difficulty || "Intermediate"}
              onChange={(e) => {
                dispatch(setFormValues({ ...values, difficulty: e.target.value }));
                dispatch(updateTestValues({ difficulty: e.target.value }));
              }}
              className={AboutStyles.difficultySelect}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Save & Discard Buttons */}
        <div className={AboutStyles.formActions}>
          <button className={AboutStyles.saveBtn} onClick={handleSaveDraft}>
            {SingleTest?._id ? "Update" : "Save"}
          </button>
          <button className={AboutStyles.discardBtn} onClick={() => router.push("/testportal_admin/myTests")}>
            Discard
          </button>
        </div>
      </div>

      {/* Right Column: Live Preview & Details Sidebar */}
      <div className={AboutStyles.sidebarCards}>
        {/* Live Preview Card */}
        <div className={AboutStyles.livePreviewCard}>
          <div className={AboutStyles.previewHeader}>
            <div className={AboutStyles.titleWrap}>
              <BsInfoCircle />
              <span>Live Preview</span>
            </div>
            <span className={AboutStyles.badge}>Candidate view</span>
          </div>
          <div className={AboutStyles.previewBody}>
            <div className={AboutStyles.previewImgCont}>
              {hasThumbnail ? (
                <img src={thumbnailUrl || SingleTest?.thumbnail} alt="test thumbnail" />
              ) : (
                <div
                  className={AboutStyles.fallbackLogo}
                  style={{ background: getGradientStyle(currentTitle) }}
                >
                  {getInitials(currentTitle)}
                </div>
              )}
            </div>
            <h4 className={AboutStyles.previewTitle}>{currentTitle || "Test Title"}</h4>
            <p className={AboutStyles.previewDesc}>{currentShortDesc || "No short description provided yet."}</p>
            <div className={AboutStyles.previewBadges}>
              <span className={AboutStyles.badgeItem}>
                <QuestionCircleOutlined />
                {SingleTest?.questions?.length || 0} Q
              </span>
              <span className={AboutStyles.badgeItem}>
                <ClockCircleOutlined />
                {getDurationText()}
              </span>
              <span className={AboutStyles.badgeItem}>
                <StarOutlined />
                {calculateTotalMarks()} Marks
              </span>
              <span className={`${AboutStyles.badgeItem} ${SingleTest?.status === "active" ? AboutStyles.activeBadge : AboutStyles.inactiveBadge}`}>
                {SingleTest?.status === "active" ? "Active" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        {/* Test Details List Card */}
        <div className={AboutStyles.testDetailsCard}>
          <div className={AboutStyles.detailsHeader}>
            <h4>Test Details</h4>
          </div>
          <div className={AboutStyles.detailsList}>
            <div className={AboutStyles.detailRow}>
              <span className={AboutStyles.detailLabel}>Questions</span>
              <span className={AboutStyles.detailVal}>{SingleTest?.questions?.length || 0}</span>
            </div>
            <div className={AboutStyles.detailRow}>
              <span className={AboutStyles.detailLabel}>Duration</span>
              <span className={AboutStyles.detailVal}>{getDurationText()}</span>
            </div>
            <div className={AboutStyles.detailRow}>
              <span className={AboutStyles.detailLabel}>Total Marks</span>
              <span className={AboutStyles.detailVal}>{calculateTotalMarks()}</span>
            </div>
            <div className={AboutStyles.detailRow}>
              <span className={AboutStyles.detailLabel}>Access</span>
              <span className={AboutStyles.detailVal}>
                {SingleTest?.access?.type === "private" ? "Restricted" : "Public"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
