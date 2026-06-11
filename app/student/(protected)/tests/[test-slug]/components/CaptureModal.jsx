import React from "react";
import { Modal, Button } from "antd";
import testPageStyles from "../test.module.scss";

export default function CaptureModal({
    captureModal,
    setCaptureModal,
    stopCamera,
    setUploadedImageUrl,
    previewing,
    uploadedImageUrl,
    videoRef,
    canvasRef,
    timer,
    verifying,
    capturePhoto,
    ShowPreview,
    retakePhoto,
    formatTime,
}) {
    return (
        <Modal
            open={captureModal}
            onCancel={() => {
                stopCamera();
                setCaptureModal(false);
                setUploadedImageUrl(null);
            }}
            footer={null}
            width={900}
            closeIcon={
                <img
                    width={"20rem"}
                    src="https://res.cloudinary.com/cliqtick/image/upload/v1722511937/sysnper/53da26962c207566fc273c8904009a36_o2mxsj.png"
                    alt="close"
                />
            }
            destroyOnHidden={true}
            centered={true}
        >
            <div className={testPageStyles.modal_cont}>
                <h2>
                    {previewing ? "Image Captured Successfully" : "Capture Image"}
                </h2>
                {previewing ? (
                    <img
                        width={"50rem"}
                        src="https://res.cloudinary.com/cliqtick/image/upload/v1724415311/download_jxlts0.png"
                        alt="Sucess Logo"
                    />
                ) : (
                    <ul>
                        <li>
                            Please click on the <strong>'Capture Snapshot'</strong>{" "}
                            button to take your photo. If the captured photo is clear
                            and neat, click on the <strong>'Continue to Test'</strong>{" "}
                            button to begin your test.
                        </li>
                        <li>
                            If you need to try again, click on <strong>'Retake'</strong>{" "}
                            to capture a new image.
                        </li>
                        <li>
                            If you cannot see your photo in the camera box, it means
                            your browser does not have permission to access your camera.
                            Please check your browser settings to{" "}
                            <strong>allow camera access.</strong>
                        </li>
                    </ul>
                )}
                <div className={testPageStyles.image_div}>
                    <span className={testPageStyles.img_span}>
                        {uploadedImageUrl?.length ? (
                            <img src={uploadedImageUrl} alt="captured Image" />
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    className={testPageStyles.capture_img}
                                />
                                <canvas
                                    ref={canvasRef}
                                    width="300"
                                    height="169"
                                    style={{ display: "none" }}
                                ></canvas>
                            </>
                        )}
                    </span>
                </div>
                <div className={testPageStyles.btns_div}>
                    {previewing ? (
                        <div className={testPageStyles.timer_div}>
                            <p>Opening Test Window in </p>
                            <p className={testPageStyles.timer}>{formatTime(timer)}</p>
                        </div>
                    ) : (
                        <>
                            <Button
                                type="primary"
                                onClick={capturePhoto}
                                disabled={verifying}
                            >
                                Capture Snapshot
                            </Button>
                            {uploadedImageUrl?.length && (
                                <Button type="primary" onClick={ShowPreview}>
                                    Continue to Start Test
                                </Button>
                            )}
                            <Button type="primary" onClick={retakePhoto}>
                                Retake
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
