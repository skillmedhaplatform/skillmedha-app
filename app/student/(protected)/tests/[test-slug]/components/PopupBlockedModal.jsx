import React from "react";
import { Modal, Button } from "antd";
import Image from "next/image";
import testPageStyles from "../test.module.scss";

export default function PopupBlockedModal({
    popupBlocked,
    setPopupBlocked,
    setUploadedImageUrl,
    setIsOpenCamera,
    stopCamera,
    setVerifying,
    setPreviewing,
}) {
    return (
        <Modal
            open={popupBlocked}
            title="Popup was Blocked"
            mask={{ closable: false }}
            keyboard={false}
            closable={false}
            footer={[
                <Button
                    key="ok"
                    type="primary"
                    onClick={() => {
                        setPopupBlocked(false);
                        setUploadedImageUrl(null);
                        setIsOpenCamera(false);
                        stopCamera();
                        setVerifying(false);
                        setPreviewing(false);
                    }}
                >
                    OK
                </Button>,
            ]}
            width={800}
            centered={true}
        >
            <div className={testPageStyles.modal_main_cont}>
                <div className={testPageStyles.div_1}>
                    <div className={testPageStyles.modal_img_div}>
                        <Image
                            src="https://res.cloudinary.com/cliqtick/image/upload/v1726215056/sysnper/Screenshot_2024-09-13_133438_ivkkzb.png"
                            alt="Instructions"
                            fill
                            objectFit="cover"
                        />
                    </div>
                    <div className={testPageStyles.content}>
                        <p>
                            It looks like your browser has blocked a pop-up window. To
                            ensure smooth navigation and access to all features, please
                            click on the pop-up block icon in the browser's address bar.
                        </p>
                    </div>
                </div>
                <div className={testPageStyles.div_2}>
                    <div className={testPageStyles.modal_img_div_1}>
                        <Image
                            src="https://res.cloudinary.com/cliqtick/image/upload/v1726215056/sysnper/Screenshot_2024-09-13_133512_sxzhxz.png"
                            alt="Instructions"
                            fill
                            objectFit="cover"
                        />
                    </div>
                    <div className={testPageStyles.content}>
                        <p>
                            To proceed, please select Always allow pop-ups and
                            redirects.
                        </p>
                    </div>
                </div>

                <div className={testPageStyles.div_3}>
                    <div className={testPageStyles.modal_img_div_1}>
                        <Image
                            src="https://res.cloudinary.com/cliqtick/image/upload/v1726215056/sysnper/Screenshot_2024-09-13_133542_t7dmxf.png"
                            alt="Instructions"
                            fill
                            objectFit="cover"
                        />
                    </div>
                    <div className={testPageStyles.content}>
                        <p>
                            Click 'Done'. This will ensure that pop-ups required for the
                            sites functionality are not blocked.Please Start the test
                            again
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
