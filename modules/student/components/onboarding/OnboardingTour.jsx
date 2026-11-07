"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import {
  DASHBOARD_TOUR_STEPS,
  TALKTOAI_TOUR_STEPS,
  PRACTICE_ALL_TOUR_STEPS,
  PRACTICE_TECH_TOUR_STEPS,
  PRACTICE_NONTECH_TOUR_STEPS,
  PRACTICE_CODING_TOUR_STEPS,
  PRACTICE_COMPANY_TOUR_STEPS,
  RESUME_SCRATCH_TOUR_STEPS,
  RESUME_UPLOAD_TOUR_STEPS,
  RESUME_ATS_TOUR_STEPS,
  ONBOARDING_RELEASE_DATE,
  ONBOARDING_STEP_TIMER_SECONDS,
} from "./onboardingConfig";
import TourWelcomeModal from "./TourWelcomeModal";
import TourCompletionModal from "./TourCompletionModal";
import TourSpotlight from "./TourSpotlight";
import TourTooltip from "./TourTooltip";
import PracticeTestDemoModal from "./PracticeTestDemoModal";
import CodingWorkspaceDemoModal from "./CodingWorkspaceDemoModal";
import CompanyTestDemoModal from "./CompanyTestDemoModal";
import ResumeGuideSelectorModal from "./ResumeGuideSelectorModal";
import ResumeScratchDemoModal from "./ResumeScratchDemoModal";
import ResumeUploadDemoModal from "./ResumeUploadDemoModal";
import ResumeAtsDemoModal from "./ResumeAtsDemoModal";
import { updateStudent } from "@/redux/slices/student";

export default function OnboardingTour() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const student = useSelector((state) => state.student?.student);

  const [activeGuide, setActiveGuide] = useState(null); // "dashboard" | "talktoai" | "practice-all" | "practice-tech" | "practice-nontech" | "practice-coding" | "practice-company" | "resume-scratch" | "resume-upload" | "resume-ats" | null
  const [phase, setPhase] = useState("IDLE"); // "IDLE" | "WELCOME" | "STEPS" | "COMPLETION"
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isResumeSelectorOpen, setIsResumeSelectorOpen] = useState(false);

  const autoTriggerDashboardRef = useRef(false);
  const autoTriggerTalkToAiRef = useRef(false);
  const autoTriggerPracticeAllRef = useRef(false);
  const autoTriggerPracticeTechRef = useRef(false);
  const autoTriggerPracticeNonTechRef = useRef(false);
  const autoTriggerPracticeCodingRef = useRef(false);
  const autoTriggerPracticeCompanyRef = useRef(false);
  const autoTriggerResumeRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = useMemo(() => {
    switch (activeGuide) {
      case "talktoai":
        return TALKTOAI_TOUR_STEPS;
      case "practice-all":
        return PRACTICE_ALL_TOUR_STEPS;
      case "practice-tech":
        return PRACTICE_TECH_TOUR_STEPS;
      case "practice-nontech":
        return PRACTICE_NONTECH_TOUR_STEPS;
      case "practice-coding":
        return PRACTICE_CODING_TOUR_STEPS;
      case "practice-company":
        return PRACTICE_COMPANY_TOUR_STEPS;
      case "resume-scratch":
        return RESUME_SCRATCH_TOUR_STEPS;
      case "resume-upload":
        return RESUME_UPLOAD_TOUR_STEPS;
      case "resume-ats":
        return RESUME_ATS_TOUR_STEPS;
      case "dashboard":
      default:
        return DASHBOARD_TOUR_STEPS;
    }
  }, [activeGuide]);

  const currentStep = steps[currentStepIndex];

  // Broadcast step changes for Talk to AI to synchronize sample data & active buttons
  useEffect(() => {
    if (activeGuide === "talktoai" && phase === "STEPS" && currentStep) {
      window.dispatchEvent(
        new CustomEvent("talktoai-tour-step", {
          detail: {
            stepIndex: currentStepIndex,
            stepId: currentStep.id,
          },
        })
      );
    }
  }, [activeGuide, phase, currentStepIndex, currentStep]);

  // Update target bounding box for active step
  const updateTargetRect = useCallback(() => {
    if (phase !== "STEPS" || !currentStep) return;

    const targetElement = document.querySelector(currentStep.targetSelector);
    if (targetElement) {
      try {
        const bounds = targetElement.getBoundingClientRect();
        const isInViewport =
          bounds.top >= 0 &&
          bounds.left >= 0 &&
          bounds.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          bounds.right <= (window.innerWidth || document.documentElement.clientWidth);

        const needsMoreTopSpace =
          currentStep?.placement?.startsWith("top") && bounds.top < 300;

        if (!isInViewport || needsMoreTopSpace) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
      } catch {
        // Fallback gracefully
      }

      const rect = targetElement.getBoundingClientRect();
      setTargetRect({
        x: rect.x || rect.left,
        y: rect.y || rect.top,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      });
    } else {
      const timer = setTimeout(() => {
        const retryElem = document.querySelector(currentStep.targetSelector);
        if (retryElem) {
          const rect = retryElem.getBoundingClientRect();
          setTargetRect({
            x: rect.x || rect.left,
            y: rect.y || rect.top,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [phase, currentStep]);

  // Recalculate target position on step change, resize, and scroll
  useEffect(() => {
    if (phase === "STEPS") {
      updateTargetRect();
      window.addEventListener("resize", updateTargetRect);
      window.addEventListener("scroll", updateTargetRect, true);

      const scrollSettlingTimer = setTimeout(updateTargetRect, 300);

      return () => {
        clearTimeout(scrollSettlingTimer);
        window.removeEventListener("resize", updateTargetRect);
        window.removeEventListener("scroll", updateTargetRect, true);
      };
    } else {
      setTargetRect(null);
    }
  }, [phase, currentStepIndex, updateTargetRect]);

  // Handle Mark Completed & Persist (Database + localStorage)
  const markTourCompleted = useCallback(
    (guide) => {
      const g = guide || activeGuide;
      if (typeof window !== "undefined" && student?._id) {
        try {
          const storageKey =
            g === "talktoai"
              ? `sm_talktoai_guide_${student._id}`
              : g === "practice-all"
              ? `sm_practice_all_guide_${student._id}`
              : g === "practice-tech"
              ? `sm_practice_tech_guide_${student._id}`
              : g === "practice-nontech"
              ? `sm_practice_nontech_guide_${student._id}`
              : g === "practice-coding"
              ? `sm_practice_coding_guide_${student._id}`
              : g === "practice-company"
              ? `sm_practice_company_guide_${student._id}`
              : g === "resume-scratch"
              ? `sm_resume_scratch_guide_${student._id}`
              : g === "resume-upload"
              ? `sm_resume_upload_guide_${student._id}`
              : g === "resume-ats"
              ? `sm_resume_ats_guide_${student._id}`
              : `sm_tour_completed_${student._id}`;
          localStorage.setItem(storageKey, "true");
        } catch (err) {
          console.error("Failed to save guide completion to localStorage", err);
        }
      }

      if (student?._id) {
        const payload =
          g === "talktoai"
            ? { hasSeenTalkToAiGuide: true }
            : g === "practice-all"
            ? { hasSeenPracticeAllGuide: true }
            : g === "practice-tech"
            ? { hasSeenPracticeTechGuide: true }
            : g === "practice-nontech"
            ? { hasSeenPracticeNonTechGuide: true }
            : g === "practice-coding"
            ? { hasSeenPracticeCodingGuide: true }
            : g === "practice-company"
            ? { hasSeenPracticeCompanyGuide: true }
            : g === "resume-scratch"
            ? { hasSeenResumeScratchGuide: true }
            : g === "resume-upload"
            ? { hasSeenResumeUploadGuide: true }
            : g === "resume-ats"
            ? { hasSeenResumeAtsGuide: true }
            : { hasSeenOnboardingTour: true };

        dispatch(updateStudent({ aboutDetails: payload, silent: true }));
      }

      if (g === "talktoai") {
        window.dispatchEvent(new CustomEvent("talktoai-tour-end"));
      }
    },
    [dispatch, student, activeGuide]
  );

  // Broadcast overall onboarding tour status (so page elements like card popovers don't interfere)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (phase === "STEPS") {
      document.documentElement.setAttribute("data-onboarding-active", activeGuide || "true");
      document.documentElement.setAttribute("data-onboarding-step", String(currentStepIndex));
      window.dispatchEvent(
        new CustomEvent("onboarding-tour-status", {
          detail: {
            isActive: true,
            activeGuide,
            stepIndex: currentStepIndex,
            stepId: currentStep?.id,
          },
        })
      );
    } else {
      document.documentElement.removeAttribute("data-onboarding-active");
      document.documentElement.removeAttribute("data-onboarding-step");
      window.dispatchEvent(
        new CustomEvent("onboarding-tour-status", {
          detail: {
            isActive: false,
            activeGuide: null,
            stepIndex: 0,
            stepId: null,
          },
        })
      );
    }
  }, [phase, activeGuide, currentStepIndex, currentStep]);

  // Auto-Show Logic (Option A: Brand-new students on first visit)
  useEffect(() => {
    if (!mounted || !student?._id) return;

    const isNewStudent = Boolean(
      (student?.loginCount !== undefined && student?.loginCount <= 1) ||
      (student?.createdAt && new Date(student.createdAt).getTime() >= ONBOARDING_RELEASE_DATE)
    );

    // 1. Dashboard Auto-Trigger
    if (pathname === "/student/dashboard" && !autoTriggerDashboardRef.current) {
      autoTriggerDashboardRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`sm_tour_completed_${student._id}`));
      const hasCompletedInDB = Boolean(student?.hasSeenOnboardingTour);

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setActiveGuide("dashboard");
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    // 2. Talk to AI Auto-Trigger
    if (pathname === "/student/talktoai" && !autoTriggerTalkToAiRef.current) {
      autoTriggerTalkToAiRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`sm_talktoai_guide_${student._id}`));
      const hasCompletedInDB = Boolean(student?.hasSeenTalkToAiGuide);

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setActiveGuide("talktoai");
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    // 3. Practice All Auto-Trigger
    if (pathname === "/student/practice-new" && !autoTriggerPracticeAllRef.current) {
      autoTriggerPracticeAllRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`sm_practice_all_guide_${student._id}`));
      const hasCompletedInDB = Boolean(student?.hasSeenPracticeAllGuide);

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setActiveGuide("practice-all");
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    // 4. Practice Technical Auto-Trigger
    if (pathname === "/student/practice-new/technical" && !autoTriggerPracticeTechRef.current) {
      autoTriggerPracticeTechRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`sm_practice_tech_guide_${student._id}`));
      const hasCompletedInDB = Boolean(student?.hasSeenPracticeTechGuide);

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setActiveGuide("practice-tech");
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    // 5. Practice Non-Technical Auto-Trigger
    if (pathname === "/student/practice-new/nontechnical" && !autoTriggerPracticeNonTechRef.current) {
      autoTriggerPracticeNonTechRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`sm_practice_nontech_guide_${student._id}`));
      const hasCompletedInDB = Boolean(student?.hasSeenPracticeNonTechGuide);

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setActiveGuide("practice-nontech");
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    // 6. Practice Coding Auto-Trigger
    if (pathname === "/student/practice-new/coding" && !autoTriggerPracticeCodingRef.current) {
      autoTriggerPracticeCodingRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`sm_practice_coding_guide_${student._id}`));
      const hasCompletedInDB = Boolean(student?.hasSeenPracticeCodingGuide);

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setActiveGuide("practice-coding");
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    // 7. Practice Company-Wise Auto-Trigger
    if (pathname === "/student/practice-new/company-wise" && !autoTriggerPracticeCompanyRef.current) {
      autoTriggerPracticeCompanyRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`sm_practice_company_guide_${student._id}`));
      const hasCompletedInDB = Boolean(student?.hasSeenPracticeCompanyGuide);

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setActiveGuide("practice-company");
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    // 8. Resume Builder Auto-Trigger (First-time students)
    if (pathname === "/student/resumeBuilder" && !autoTriggerResumeRef.current) {
      autoTriggerResumeRef.current = true;

      const isCompletedLocally =
        typeof window !== "undefined" &&
        (Boolean(localStorage.getItem(`sm_resume_scratch_guide_${student._id}`)) ||
          Boolean(localStorage.getItem(`sm_resume_upload_guide_${student._id}`)) ||
          Boolean(localStorage.getItem(`sm_resume_ats_guide_${student._id}`)));
      const hasCompletedInDB = Boolean(
        student?.hasSeenResumeScratchGuide ||
          student?.hasSeenResumeUploadGuide ||
          student?.hasSeenResumeAtsGuide
      );

      if (isNewStudent && !hasCompletedInDB && !isCompletedLocally) {
        const timer = setTimeout(() => {
          setIsResumeSelectorOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [mounted, student, pathname]);

  // Listen for manual trigger events from guide buttons
  useEffect(() => {
    const handleOpenDashboardGuide = () => {
      setActiveGuide("dashboard");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenTalkToAiGuide = () => {
      setActiveGuide("talktoai");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenPracticeAllGuide = () => {
      setActiveGuide("practice-all");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenPracticeTechGuide = () => {
      setActiveGuide("practice-tech");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenPracticeNonTechGuide = () => {
      setActiveGuide("practice-nontech");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenPracticeCodingGuide = () => {
      setActiveGuide("practice-coding");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenPracticeCompanyGuide = () => {
      setActiveGuide("practice-company");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenResumeGuide = () => {
      setIsResumeSelectorOpen(true);
    };

    const handleOpenResumeScratchGuide = () => {
      setActiveGuide("resume-scratch");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenResumeUploadGuide = () => {
      setActiveGuide("resume-upload");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    const handleOpenResumeAtsGuide = () => {
      setActiveGuide("resume-ats");
      setCurrentStepIndex(0);
      setPhase("WELCOME");
    };

    window.addEventListener("open-dashboard-guide", handleOpenDashboardGuide);
    window.addEventListener("open-onboarding-tour", handleOpenDashboardGuide);
    window.addEventListener("open-talktoai-guide", handleOpenTalkToAiGuide);
    window.addEventListener("open-practice-all-guide", handleOpenPracticeAllGuide);
    window.addEventListener("open-practice-tech-guide", handleOpenPracticeTechGuide);
    window.addEventListener("open-practice-nontech-guide", handleOpenPracticeNonTechGuide);
    window.addEventListener("open-practice-coding-guide", handleOpenPracticeCodingGuide);
    window.addEventListener("open-practice-company-guide", handleOpenPracticeCompanyGuide);
    window.addEventListener("open-resume-guide", handleOpenResumeGuide);
    window.addEventListener("open-resume-scratch-guide", handleOpenResumeScratchGuide);
    window.addEventListener("open-resume-upload-guide", handleOpenResumeUploadGuide);
    window.addEventListener("open-resume-ats-guide", handleOpenResumeAtsGuide);

    return () => {
      window.removeEventListener("open-dashboard-guide", handleOpenDashboardGuide);
      window.removeEventListener("open-onboarding-tour", handleOpenDashboardGuide);
      window.removeEventListener("open-talktoai-guide", handleOpenTalkToAiGuide);
      window.removeEventListener("open-practice-all-guide", handleOpenPracticeAllGuide);
      window.removeEventListener("open-practice-tech-guide", handleOpenPracticeTechGuide);
      window.removeEventListener("open-practice-nontech-guide", handleOpenPracticeNonTechGuide);
      window.removeEventListener("open-practice-coding-guide", handleOpenPracticeCodingGuide);
      window.removeEventListener("open-practice-company-guide", handleOpenPracticeCompanyGuide);
      window.removeEventListener("open-resume-guide", handleOpenResumeGuide);
      window.removeEventListener("open-resume-scratch-guide", handleOpenResumeScratchGuide);
      window.removeEventListener("open-resume-upload-guide", handleOpenResumeUploadGuide);
      window.removeEventListener("open-resume-ats-guide", handleOpenResumeAtsGuide);
    };
  }, []);

  // Action handlers
  const handleNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      } else {
        setPhase("COMPLETION");
        if (activeGuide === "talktoai") {
          window.dispatchEvent(new CustomEvent("talktoai-tour-end"));
        }
        return prev;
      }
    });
  }, [steps.length, activeGuide]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleStartTour = () => {
    setCurrentStepIndex(0);
    setPhase("STEPS");
  };

  const handleSkip = () => {
    markTourCompleted();
    setPhase("IDLE");
  };

  const handleFinish = () => {
    markTourCompleted();
    setPhase("IDLE");
  };

  const handleExploreAgain = () => {
    setCurrentStepIndex(0);
    setPhase("STEPS");
  };

  // Reusable 5-second automatic progression timer for all onboarding steps (runs in background)
  useEffect(() => {
    if (phase !== "STEPS") return;

    // 5-second timer to automatically advance to the next step
    const autoAdvanceTimer = setTimeout(() => {
      handleNextStep();
    }, ONBOARDING_STEP_TIMER_SECONDS * 1000);

    return () => {
      clearTimeout(autoAdvanceTimer);
    };
  }, [phase, currentStepIndex, handleNextStep]);

  if (!mounted || (phase === "IDLE" && !isResumeSelectorOpen)) return null;

  const isTalkToAi = activeGuide === "talktoai";
  const isPracticeAll = activeGuide === "practice-all";
  const isPracticeTech = activeGuide === "practice-tech";
  const isPracticeNonTech = activeGuide === "practice-nontech";
  const isPracticeCoding = activeGuide === "practice-coding";
  const isPracticeCompany = activeGuide === "practice-company";
  const isResumeScratch = activeGuide === "resume-scratch";
  const isResumeUpload = activeGuide === "resume-upload";
  const isResumeAts = activeGuide === "resume-ats";
  const isPracticeGuide = isPracticeAll || isPracticeTech || isPracticeNonTech;
  const isResumeGuide = isResumeScratch || isResumeUpload || isResumeAts;

  return (
    <>
      {/* 0. Resume Guide Selector Modal */}
      <ResumeGuideSelectorModal
        isOpen={isResumeSelectorOpen}
        onClose={() => setIsResumeSelectorOpen(false)}
        onSelectGuide={(guideId) => {
          setIsResumeSelectorOpen(false);
          setActiveGuide(guideId);
          setCurrentStepIndex(0);
          setPhase("WELCOME");
        }}
      />

      {/* 1. Welcome Modal */}
      <TourWelcomeModal
        isOpen={phase === "WELCOME"}
        badge={
          isTalkToAi
            ? "Talk to AI Guide"
            : isPracticeAll
            ? "Practice Guide"
            : isPracticeTech
            ? "Technical Practice Guide"
            : isPracticeNonTech
            ? "Non-Technical Practice Guide"
            : isPracticeCoding
            ? "Coding Practice Guide"
            : isPracticeCompany
            ? "Company-Wise Practice Guide"
            : isResumeScratch
            ? "Create Resume Guide"
            : isResumeUpload
            ? "Upload Resume Guide"
            : isResumeAts
            ? "ATS Score Guide"
            : "Welcome to SkillMedha"
        }
        title={
          isTalkToAi
            ? "Welcome to Talk to AI!"
            : isPracticeAll
            ? "Welcome to Practice Sets!"
            : isPracticeTech
            ? "Explore Technical Practice!"
            : isPracticeNonTech
            ? "Explore Non-Technical Practice!"
            : isPracticeCoding
            ? "Explore Coding Practice!"
            : isPracticeCompany
            ? "Explore Company-Wise Practice!"
            : isResumeScratch
            ? "Create Resume from Scratch!"
            : isResumeUpload
            ? "Upload & Enhance Your Resume!"
            : isResumeAts
            ? "ATS Score Compatibility Checker!"
            : "Welcome to SkillMedha!"
        }
        description={
          isTalkToAi
            ? "Prepare and practice for real-world interviews with AI-guided questions, real-time video evaluation, and instant feedback."
            : isPracticeAll
            ? "Prepare for top companies with real-time exam patterns, Free and Premium practice sets, and full test workflows."
            : isPracticeTech
            ? "Master core Computer Science subjects including Data Structures, Algorithms, DBMS, and Operating Systems with instant solution evaluations."
            : isPracticeNonTech
            ? "Sharpen your Quantitative Aptitude, Logical Reasoning, and Verbal Ability to succeed in company placement exams."
            : isPracticeCoding
            ? "Master data structures, algorithms, and problem solving with our interactive coding environment, instant test case execution, and performance analytics."
            : isPracticeCompany
            ? "Prepare for top company recruitment drives with real-world test patterns, category section navigation, and detailed performance scorecards."
            : isResumeScratch
            ? "Learn how to select modern templates, complete form sections step-by-step, live preview customizations, and export your ATS-friendly PDF."
            : isResumeUpload
            ? "Save time by uploading your existing resume. Learn how smart AI parses your credentials into modern editable templates automatically."
            : isResumeAts
            ? "Discover how to scan your resume against target job requirements, review matching keywords, and boost your ATS score."
            : "Your learning journey starts here. Let's take a quick tour to help you explore your student dashboard."
        }
        ctaText={
          isTalkToAi
            ? "Start Talk to AI Guide"
            : isPracticeAll
            ? "Start Practice Guide"
            : isPracticeTech
            ? "Start Technical Guide"
            : isPracticeNonTech
            ? "Start Non-Technical Guide"
            : isPracticeCoding
            ? "Start Coding Guide"
            : isPracticeCompany
            ? "Start Company Guide"
            : isResumeScratch
            ? "Start Builder Guide"
            : isResumeUpload
            ? "Start Upload Guide"
            : isResumeAts
            ? "Start ATS Guide"
            : "Start Dashboard Guide"
        }
        onStartTour={handleStartTour}
        onSkip={handleSkip}
      />

      {/* 2. Interactive Spotlight Tour */}
      {phase === "STEPS" && (
        <>
          {/* Practice Test Demo Modal (visible during test interface steps 3 to 7) */}
          {isPracticeGuide && (
            <PracticeTestDemoModal
              isOpen={currentStepIndex >= 2}
              guideType={activeGuide}
              stepIndex={currentStepIndex}
            />
          )}

          {/* Coding Workspace Demo Modal (visible during steps 3 to 6: currentStepIndex >= 2) */}
          {isPracticeCoding && (
            <CodingWorkspaceDemoModal
              isOpen={currentStepIndex >= 2}
              stepIndex={currentStepIndex}
            />
          )}

          {/* Company-Wise Test Demo Modal (visible during steps 3 to 6: currentStepIndex >= 2) */}
          {isPracticeCompany && (
            <CompanyTestDemoModal
              isOpen={currentStepIndex >= 2}
              stepIndex={currentStepIndex}
            />
          )}

          {/* Resume Scratch Demo Modal (visible during steps 2 to 5: currentStepIndex >= 1) */}
          {isResumeScratch && (
            <ResumeScratchDemoModal
              isOpen={currentStepIndex >= 1}
              stepIndex={currentStepIndex}
            />
          )}

          {/* Resume Upload Demo Modal (visible during steps 2 to 4: currentStepIndex >= 1) */}
          {isResumeUpload && (
            <ResumeUploadDemoModal
              isOpen={currentStepIndex >= 1}
              stepIndex={currentStepIndex}
            />
          )}

          {/* Resume ATS Demo Modal (visible during steps 2 to 5: currentStepIndex >= 1) */}
          {isResumeAts && (
            <ResumeAtsDemoModal
              isOpen={currentStepIndex >= 1}
              stepIndex={currentStepIndex}
            />
          )}

          <TourSpotlight
            targetRect={targetRect}
            padding={currentStep?.padding !== undefined ? currentStep.padding : 2}
            borderRadius={currentStep?.borderRadius !== undefined ? currentStep.borderRadius : 12}
          />
          {currentStep && (
            <TourTooltip
              step={currentStep}
              totalSteps={steps.length}
              targetRect={targetRect}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
              onSkip={handleSkip}
            />
          )}
        </>
      )}

      {/* 3. Completion Modal */}
      <TourCompletionModal
        isOpen={phase === "COMPLETION"}
        badge={
          isTalkToAi
            ? "Talk to AI Guide Complete"
            : isPracticeAll
            ? "Practice Guide Complete"
            : isPracticeTech
            ? "Technical Practice Complete"
            : isPracticeNonTech
            ? "Non-Technical Practice Complete"
            : isPracticeCoding
            ? "Coding Practice Complete"
            : isPracticeCompany
            ? "Company Practice Complete"
            : isResumeScratch
            ? "Resume Builder Guide Complete"
            : isResumeUpload
            ? "Upload Guide Complete"
            : isResumeAts
            ? "ATS Guide Complete"
            : "Dashboard Guide Complete"
        }
        title={
          isTalkToAi
            ? "You're Ready to Practice!"
            : isPracticeAll
            ? "You're Ready to Practice!"
            : isPracticeTech
            ? "You're Ready for Technical Tests!"
            : isPracticeNonTech
            ? "You're Ready for Aptitude Tests!"
            : isPracticeCoding
            ? "You're Ready to Code!"
            : isPracticeCompany
            ? "You're Ready for Company Drives!"
            : isResumeScratch
            ? "You're Ready to Build Your Resume!"
            : isResumeUpload
            ? "You're Ready to Upload & Enhance!"
            : isResumeAts
            ? "You're Ready to Beat the ATS!"
            : "You're Ready to Learn!"
        }
        description={
          isTalkToAi
            ? "You now know how to select questions, record your responses, and get instant AI feedback. Try your first question now!"
            : isPracticeAll
            ? "You now understand practice card tiers, premium purchases, and the full practice test workflow. Start your first practice set now!"
            : isPracticeTech
            ? "You now understand technical practice cards and how to review detailed algorithmic solutions. Begin your technical practice now!"
            : isPracticeNonTech
            ? "You're ready to solve aptitude and reasoning problems with step-by-step mathematical explanations. Start practicing now!"
            : isPracticeCoding
            ? "You now understand coding problem tiers, how to write and test code across multiple languages, and review submission analytics. Start coding now!"
            : isPracticeCompany
            ? "You now understand company test tiers, category section navigation, answering questions, and reviewing your detailed test results."
            : isResumeScratch
            ? "You now know how to pick templates, complete resume sections, customize live previews, and export an ATS-friendly PDF. Start building now!"
            : isResumeUpload
            ? "You now know how to upload your existing resume, extract credentials with AI, and apply modern designs in seconds."
            : isResumeAts
            ? "You now know how to scan your resume against job descriptions, review matching keywords, and optimize for recruiter ATS systems."
            : "You've completed the dashboard tour. Start exploring and make the most of your learning journey."
        }
        ctaText={
          isTalkToAi
            ? "Start Practicing"
            : isPracticeGuide || isPracticeCoding || isPracticeCompany
            ? "Start Practicing"
            : isResumeGuide
            ? "Build Resume"
            : "Go to Dashboard"
        }
        secondaryText="Explore Again"
        onFinish={handleFinish}
        onExploreAgain={handleExploreAgain}
      />
    </>
  );
}
