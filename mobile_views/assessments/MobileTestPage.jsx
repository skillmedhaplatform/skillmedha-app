"use client";
import React from "react";
import { Button, Checkbox, Skeleton } from "antd";
import { IoMdArrowRoundBack } from "react-icons/io";
import SocketComp from "@/app/student/(protected)/tests/[test-slug]/socket";
import FormPage from "@/app/student/(protected)/tests/[test-slug]/utils/formPage";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import styles from "./mobileTestPage.module.scss";

export default function MobileTestPage({
  testData,
  hasTestDataLoaded,
  instructionsHtml,
  checkbox,
  setCheckBox,
  handleStartClick,
  nav,
}) {
  return (
    <div className={styles.mobileContainer}>
      <SocketComp />
      
      {/* 1. Header (sticky-safe, non-scrolling or top of layout) */}
      <div className={styles.header}>
        <Button
          icon={<IoMdArrowRoundBack />}
          type="text"
          onClick={() => nav.push("/student/tests")}
          className={styles.backBtn}
        />
        <h1 className={styles.title}>{testData?.title || "Test Details"}</h1>
      </div>

      {/* 2. Scrollable content area */}
      <div className={styles.scrollArea}>
        {!hasTestDataLoaded ? (
          <div className={styles.loader}>
            <Skeleton avatar paragraph={{ rows: 8 }} />
          </div>
        ) : (
          <>
            {instructionsHtml && (
              <div
                dangerouslySetInnerHTML={{ __html: instructionsHtml }}
                className={styles.instructions}
              />
            )}

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Honest Respondent Technology</h3>
              <h4 className={styles.infoSubtitle}>Focus on your test only!</h4>
              <p>
                The test is secured with Honest Respondent Technology.
                Don&apos;t click outside the test tab area. Every browser tab
                movement is recorded.
              </p>
              <p>
                We recommend disabling background programs, chats and system
                notifications before the test, as they can trigger a test block.
              </p>
            </div>

            {testData?.startPage?.formRequirements && (
              <div className={styles.formCard}>
                <h3 className={styles.infoTitle}>Test Start Form</h3>
                <FormPage initialData={testData.startPage.formRequirements} />
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Sticky Bottom Panel (Checkbox + Start Test button - non-scrolling) */}
      <div className={styles.stickyBottom}>
        {testData?.startPage?.consetForm && (
          <div className={styles.consentRow}>
            <Checkbox
              checked={checkbox}
              onChange={() => setCheckBox(!checkbox)}
              className={styles.consentCheckbox}
            />
            <span
              dangerouslySetInnerHTML={{
                __html:
                  typeof testData.startPage.consetForm === "string"
                    ? parseIfJson(testData.startPage.consetForm)
                    : testData.startPage.consetForm,
              }}
              className={styles.consentText}
            />
          </div>
        )}

        <Button
          type="primary"
          size="large"
          block
          onClick={handleStartClick}
          className={styles.startBtn}
        >
          Start the Test
        </Button>
      </div>
    </div>
  );
}
