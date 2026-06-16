"use client";
import React, { useEffect, useState } from "react";
import styles from "./createAssessment.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
  createJobAssessment,
  getOneJobAssessment,
  resetSingleJobAssessment,
  updateJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { Button, Radio, Select, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const LEAVE_OPTIONS = Array.from({ length: 6 }, (_, i) => i + 1).map((e) => ({
  label: e,
  value: e,
}));

export default function CreateAssessment() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { jobId: jobid } = useParams();

  const ONEJOB = useSelector((state) => state.companyPlacements?.OneJob?.value);
  const singleJobAssessment = useSelector(
    (s) => s.companySkillMedhaData?.singleJobAssessment
  );

  // defaults and local state
  const DEFAULTS = {
    hrtMode: "disabled",
    maxLeaves: 2,
    snapshot: "disabled",
    liveProctoring: "disabled",
  };
  const [hrtMode, setHrtMode] = useState(DEFAULTS.hrtMode);
  const [maxLeaves, setMaxLeaves] = useState(DEFAULTS.maxLeaves);
  const [snapshot, setSnapshot] = useState(DEFAULTS.snapshot);
  const [liveProctoring, setLiveProctoring] = useState(DEFAULTS.liveProctoring);

  const resetLocal = () => {
    setHrtMode(DEFAULTS.hrtMode);
    setMaxLeaves(DEFAULTS.maxLeaves);
    setSnapshot(DEFAULTS.snapshot);
    setLiveProctoring(DEFAULTS.liveProctoring);
  };

  const aId = ONEJOB?.data?.AssessmentId || null;
  const hasValidAssessmentId = Boolean(aId && singleJobAssessment?._id === aId);

  useEffect(() => {
    if (aId) {
      dispatch(getOneJobAssessment({ id: aId }));
    } else {
      dispatch(resetSingleJobAssessment());
      resetLocal();
    }
  }, [aId, dispatch]);

  useEffect(() => {
    if (singleJobAssessment && singleJobAssessment._id) {
      setHrtMode(
        singleJobAssessment.honestRespondent?.type || DEFAULTS.hrtMode
      );
      setMaxLeaves(
        parseInt(singleJobAssessment.honestRespondent?.maxAttempts) ||
          DEFAULTS.maxLeaves
      );
      setSnapshot(
        singleJobAssessment.snapShotTechnology === "Enable"
          ? "enabled"
          : "disabled"
      );
      setLiveProctoring(
        singleJobAssessment.liveProctoring === "Enable" ? "enabled" : "disabled"
      );
    }
  }, [singleJobAssessment]);

  const handleSave = async () => {
    const payload = {
      jobId: jobid,
      honestRespondent: {
        type: hrtMode,
        maxAttempts: hrtMode === "disabled" ? null : String(maxLeaves),
      },
      snapShotTechnology: snapshot === "enabled" ? "Enable" : "Disable",
      liveProctoring: liveProctoring === "enabled" ? "Enable" : "Disable",
    };

    try {
      if (hasValidAssessmentId) {
        await dispatch(updateJobAssessment({ ...payload, aId })).unwrap();
      } else {
        const created = await dispatch(createJobAssessment(payload)).unwrap();
        await dispatch(GetOneJob({ jobid }));
        if (created?.insertedId) {
          await dispatch(getOneJobAssessment({ id: created.insertedId }));
        }
      }
      router.push(`/company/myjobs/${jobid}/createjob/startPage`);
    } catch (err) {
      message.error(typeof err === "string" ? err : "Operation failed");
    }
  };

  return (
    <div className={styles.mainCont}>
      <p>Assessment Proctoring Configuration</p>

      {/* HRT Section */}
      <div className={styles.hrtSection}>
        <div className={styles.configHeader}>
          <p className={styles.configTitle}>HRT</p>
          <Radio.Group
            value={hrtMode}
            onChange={(e) => setHrtMode(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="disabled">Disable</Radio.Button>
            <Radio.Button value="Enable Warnings Only">
              Enable Warnings Only
            </Radio.Button>
            <Radio.Button value="Enable Warnings and test block">
              Enable Warnings and test block
            </Radio.Button>
          </Radio.Group>
        </div>

        <div className={styles.configContent}>
          <p className={styles.contentDescription}>
            To increase test results reliability, activate a mechanism that
            monitors browser tab movements. If any movement or tab switching is
            detected, the mechanism issues warnings or blocks the test,
            according to the settings of your choice.
          </p>

          <div className={styles.infoSection}>
            <div className={styles.infoHeader}>
              <InfoCircleOutlined />
              <p>Leaving test page accidentally</p>
            </div>

            <div className={styles.infoContent}>
              <p>
                If Honest Respondent Technology is activated, respondents
                receive a notification on the test start page. They are advised
                to disable system notifications, close applications running in
                the background and focus on taking the test.
              </p>
              <p>
                It may happen, however, that a respondent leaves the test tab
                unintentionally. This can be caused by changing the volume,
                clicking outside the test tab or switching the taskbar on. If
                the test is taken on a mobile device, any notifications or calls
                may also trigger a warning.
              </p>
            </div>
          </div>

          <div className={styles.maxLeavesSection}>
            <div className={styles.maxLeavesHeader}>
              <p>
                Maximum number of times a respondent can leave the test page
              </p>
              <InfoCircleOutlined />
              <p>We recommend using value greater than or equal to 2.</p>
            </div>
            <Select
              value={maxLeaves}
              onChange={(v) => setMaxLeaves(v)}
              disabled={hrtMode === "disabled"}
              className={styles.maxLeavesSelect}
              options={LEAVE_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* User Snapshot Section */}
      <div className={styles.snapshotSection}>
        <div className={styles.configHeader}>
          <p className={styles.configTitle}>User Snapshot</p>
          <Radio.Group
            value={snapshot}
            onChange={(e) => setSnapshot(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="disabled">Disable</Radio.Button>
            <Radio.Button value="enabled">Enable</Radio.Button>
          </Radio.Group>
        </div>

        <div className={styles.configContent}>
          <p className={styles.contentDescription}>
            To enhance the integrity of the online exam process, enable the
            Student Snapshot mechanism, which captures a photo of the student
            before they begin their test. This feature ensures that the identity
            of the test-taker is verified and documented.
          </p>

          <div className={styles.infoSection}>
            <div className={styles.infoHeader}>
              <InfoCircleOutlined />
              <p>Taking the Snapshot</p>
            </div>

            <div className={styles.infoContent}>
              <p>
                When the Student Snapshot Technology is activated, students are
                prompted to take a clear and neat photo using their
                device&apos;s camera before they can proceed to the exam. If the
                photo is not satisfactory, they have the option to retake it
                until it meets the required standards.
              </p>
              <p>
                In cases where the camera is not accessible or the photo cannot
                be seen in the camera box, the system notifies the student that
                their browser does not have permission to access the camera,
                guiding them to enable it.
              </p>
              <p>
                <strong>Importance of Clear Identification:</strong> The
                captured photo is stored securely and can be reviewed by the
                admin to ensure that the correct individual is taking the test.
                This added layer of security helps prevent impersonation and
                maintains the authenticity of the exam process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Proctoring Section */}
      <div className={styles.proctoringSection}>
        <div className={styles.configHeader}>
          <p className={styles.configTitle}>Candidate Test Live Proctoring</p>
          <Radio.Group
            value={liveProctoring}
            onChange={(e) => setLiveProctoring(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="disabled">Disable</Radio.Button>
            <Radio.Button value="enabled">Enable</Radio.Button>
          </Radio.Group>
        </div>

        <div className={styles.configContent}>
          <p className={styles.contentDescription}>
            Upgrade the integrity of your online exams with Facial Recognition
            Technology, a robust security feature that continuously verifies the
            identity of the test-taker throughout the examination process. This
            technology uses advanced AI algorithms to analyze and match the
            student&apos;s facial features, ensuring that the person taking the
            test is the same as the one registered.
          </p>

          <div className={styles.infoSection}>
            <div className={styles.infoHeader}>
              <InfoCircleOutlined />
              <p>How Facial Recognition Works</p>
            </div>

            <div className={styles.infoContent}>
              <p>
                When Facial Recognition is enabled, the system prompts students
                to allow camera access at the start of the test. After a clear
                reference image of the student is captured, the system
                continuously monitors and verifies their face at regular
                intervals throughout the test. If the face does not match the
                reference image or if the student leaves the camera&apos;s field
                of view, an alert is generated.
              </p>
              <p>
                <strong>Guidance for Camera Accessibility:</strong> If the
                student&apos;s device camera is inaccessible or the system
                cannot detect the student&apos;s face, a notification will
                prompt the student to enable camera permissions in their
                browser. Additionally, students are informed to position
                themselves properly in front of the camera to ensure a clear and
                uninterrupted view of their face.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button type="primary" onClick={handleSave}>
        {hasValidAssessmentId ? "Update Configuration" : "Save Configuration"}
      </Button>
    </div>
  );
}
