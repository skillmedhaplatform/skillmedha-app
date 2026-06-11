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
  return (
    <div className={AboutStyles.form}>
        <div className={AboutStyles.TitleCon}>
          <div className={AboutStyles.Title}>Test Title*</div>

          <div className={AboutStyles.Title_div}>
            {singletestStatus === "pending" ? (
              <Skeleton.Input active={true} style={{ width: "100%" }} />
            ) : (
              <input
                type="text"
                id="title"
                value={values?.title !== undefined ? values.title : SingleTest?.title || ""}
                onChange={(e) => {
                  dispatch(setFormValues({ ...values, title: e.target.value }));
                  dispatch(updateTestValues({ title: e.target.value }));
                }}
                className={AboutStyles.form__field__input}
                maxLength="42"
              />
            )}

            <div>
              <BsInfoCircle
                size={15}
                color="#555"
                style={{ marginRight: "5px" }}
              />
              The Title of the test should not be more than 42 characters.
            </div>
          </div>
        </div>

        <div className={AboutStyles.categoryCon}>
          <div className={AboutStyles.Title}>Category</div>
          <div className={AboutStyles.categoryConRig}>
            <ChipInput
              type="test"
              name="category"
              keyName="testCategory"
              phVal="Enter category value and press enter"
              initialValue={SingleTest?.category}
            />
          </div>
        </div>

        <div className={AboutStyles.editorCon}>
          <div className={AboutStyles.Title}>
            Short Description*
            <div>
              <BsInfoCircle
                size={15}
                color="#555"
                style={{ marginRight: "5px" }}
              />
              Please provide a concise description of the course for the webpage
              banner. This description should be between 250-300 characters.
            </div>
          </div>

          <div className={AboutStyles.editorInp}>
            {singletestStatus === "pending" ? (
              <Skeleton
                paragraph={{
                  rows: 3,
                }}
                active={true}
              />
            ) : (
              <TextEditor
                name="shortDescription"
                editorFun={(val) => sendEditorVals(val, "shortDescription")}
                initialContent={{
                  shortDescription: values?.shortDescription
                    ? values?.shortDescription
                    : SingleTest?.shortDescription,
                }}
              />
            )}
          </div>
          <button className={AboutStyles.aiButton} onClick={generateDesc}>
            Generate description using AI
          </button>
        </div>

        <div className={AboutStyles.imageCon}>
          <div className={AboutStyles.Title}>Thumbnail</div>

          <div className={AboutStyles.flexTypes}>
            {showThumbnail ? (
              <div className={AboutStyles.image_div}>
                <Tooltip placement="topLeft" title="Reselect File">
                  <input
                    type="file"
                    onChange={(e) => onChangeThumbnail(e)}
                    className={AboutStyles.reselect_thumbnailinput}
                  />
                </Tooltip>

                <img
                  className={AboutStyles.thumbnail}
                  src={thumbnailUrl || SingleTest?.thumbnail}
                  alt="thumbnail"
                />
              </div>
            ) : (
              <label htmlFor="">
                <div className={AboutStyles.cropper_input_cont}>
                  <div className={AboutStyles.fileInput_cont}>
                    {/* <BsUpload className={AboutStyles.Uploadicon} /> */}

                    <div className={AboutStyles.Uploadicon}>
                      <FaCloudUploadAlt size={40} color="#ccc" />
                      <p>
                        Drag and drop image here or <span>Choose File</span>
                      </p>
                    </div>
                    <Tooltip placement="topLeft" title="select File">
                      <input
                        type="file"
                        onChange={(e) => onChangeThumbnail(e)}
                        className={`${AboutStyles.fileInput} ${isUploaded ? AboutStyles.hidden : ""
                          }`}
                      />
                    </Tooltip>
                  </div>

                  {isUploaded && (
                    <div
                      className={`${AboutStyles.cropper_main_cont} ${isUploaded ? AboutStyles.show : AboutStyles.hidden
                        }`}
                    >
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
                    </div>
                  )}
                </div>
              </label>
            )}

            {isUploadedLoaded && (
              <div className={AboutStyles.uplaod_delete_btn}>
                <button onClick={(e) => cropThumbnailImage(e)}>Upload</button>
                <BsTrash
                  className={AboutStyles.delete_btn}
                  onClick={onDeleteThumbnail}
                  size={20}
                  color="red"
                />
              </div>
            )}
          </div>
        </div>

        <div className={AboutStyles.imageCon}>
          <div className={AboutStyles.Title}>Logo</div>

          <div className={AboutStyles.flexTypes}>
            {showLogo ? (
              <div className={AboutStyles.logoimg_div}>
                <Tooltip placement="topLeft" title="Reselect File">
                  <input
                    type="file"
                    onChange={(e) => onChangeImage(e)}
                    className={AboutStyles.reselect_input}
                  />
                </Tooltip>
                <img
                  src={logoUrl || SingleTest?.logo}
                  alt="logo"
                  className={AboutStyles.logo}
                />
              </div>
            ) : (
              <label htmlFor="">
                <div className={AboutStyles.cropper_input_cont}>
                  <div className={AboutStyles.fileInput_cont}>
                    {/* <BsUpload className={AboutStyles.Uploadicon} /> */}
                    <div className={AboutStyles.Uploadicon}>
                      <FaCloudUploadAlt size={40} color="#ccc" />
                      <p>
                        Drag and drop your image here or{" "}
                        <span>Choose File</span>
                      </p>
                    </div>
                    <Tooltip placement="topLeft" title="select File">
                      <input
                        type="file"
                        onChange={(e) => onChangeImage(e)}
                        className={`${AboutStyles.fileInput} ${isUploadedLogo ? AboutStyles.hidden : ""
                          }`}
                      />
                    </Tooltip>
                  </div>
                  {isUploadedLogo && (
                    <div
                      className={`${AboutStyles.cropper_main_cont} ${isUploadedLogo ? AboutStyles.show : AboutStyles.hidden
                        }`}
                    >
                      <Cropper
                        className={AboutStyles.cropper_cont}
                        src={images}
                        aspectRatio={1080 / 1080}
                        guides={false}
                        ref={cropperRefs}
                        viewMode={1}
                        background={false}
                        zoomOnWheel={false}
                        scalable={false}
                        movable={false}
                        initialAspectRatio={16 / 9}
                        dragMode="none"
                      />
                    </div>
                  )}
                </div>
              </label>
            )}
            {isUploadedLogoLoaded && (
              <div className={AboutStyles.uplaod_delete_btn}>
                <button onClick={(e) => cropImage(e)}>Upload</button>
                <BsTrash
                  className={AboutStyles.delete_btn}
                  onClick={onDeleteLogo}
                  size={20}
                  color="red"
                />
              </div>
            )}
          </div>
        </div>
        <div className={AboutStyles.TestEvaluationType}>
          <div className={AboutStyles.Title}>Test Evaluation Type</div>

          <div className={AboutStyles.Title_div}>
            <Radio.Group
              options={optionsTestEvaluationType}
              onChange={(e) => {
                setTestEvaluationvalue(e.target.value);
                dispatch(
                  setFormValues({
                    ...values,
                    testEvaluationType: e.target.value,
                  }),
                );
                dispatch(
                  updateTestValues({ testEvaluationType: e.target.value }),
                );
              }}
              className={AboutStyles.radioGroup}
              value={testEvaluationvalue}
              optionType="button"
              buttonStyle="solid"
            />
          </div>
        </div>

        <button
          type="submit"
          className={AboutStyles.submitButton}
          onClick={handleSaveDraft}
        >
          {SingleTest?._id ? "Update" : "Save"}
        </button>
      </div>
  );
};

export default About;
