import {
  HiOutlineSquares2X2,
  HiOutlineChatBubbleLeftRight,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentCheck,
  HiOutlineQuestionMarkCircle,
  HiOutlineTrophy,
} from "react-icons/hi2";

export const sideBarTitles = [
  {
    name: "Dashboard",
    slug: "dashboard",
    path: "/student/dashboard",
    icon: <HiOutlineSquares2X2 size={22} />,
  },

  {
    name: "Talk To AI",
    slug: "talktoai",
    path: "/student/talktoai",
    icon: <HiOutlineChatBubbleLeftRight size={22} />,
  },
  {
    name: "Practice",
    slug: "practice",
    path: "/student/practice-new",
    icon: <HiOutlineAcademicCap size={22} />,
  },
  {
    name: "Resume Builder",
    slug: "resumebuilder",
    path: "/student/resumeBuilder",
    icon: <HiOutlineDocumentText size={22} />,
    disable: false,
  },
  {
    name: "Job Openings",
    slug: "jobopenings",
    path: "/student/jobopenings",
    icon: <HiOutlineBriefcase size={22} />,
  },
  {
    name: "Internship Library",
    slug: "internshiplibrary",
    path: "/student/internshipLibrary",
    icon: <HiOutlineBuildingOffice2 size={22} />,
  },
  {
    name: "Courses Library",
    slug: "courseslibrary",
    path: "/student/course",
    icon: <HiOutlineBookOpen size={22} />,
  },
  {
    name: "My Assessments",
    slug: "myassessments",
    path: "/student/tests",
    icon: <HiOutlineClipboardDocumentCheck size={22} />,
  },
  {
    name: "Test Results",
    slug: "testresults",
    path: "/student/testResults",
    icon: <HiOutlineTrophy size={22} />,
  },
  {
    name: "Help",
    slug: "help",
    path: "/student/help",
    icon: <HiOutlineQuestionMarkCircle size={22} />,
  },
];
