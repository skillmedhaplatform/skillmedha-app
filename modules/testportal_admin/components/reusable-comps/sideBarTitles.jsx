import { clearLstorageVals } from "@/utils/universalUtils/windowMW";
import {
  HiOutlineDocumentText,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineArrowLeft,
  HiOutlineHome,
} from "react-icons/hi2";

export const sideBarTitles = [
  {
    name: "TPO Dashboard",
    path: "/tpo/dashboard",
    icon: <HiOutlineHome size={22} />,
    isExternal: true,
  },
  {
    name: "My Tests",
    path: "myTests",
    icon: <HiOutlineDocumentText size={22} />,
  },
  {
    name: "Question Bank",
    path: "question-bank",
    icon: <HiOutlineCube size={22} />,
  },
  // {
  //   name: "Website & Branding",
  //   path: "website-and-branding",
  //   icon: <FaGlobe size={20} />,
  // },
  // {
  //   name: "Integrations",
  //   path: "integrations",
  //   icon: <FaPlug size={20} />,
  // },
  {
    name: "Results Database",
    path: "results-database",
    icon: <HiOutlineChartBar size={22} />,
  },
  {
    name: "Students",
    path: "users",
    icon: <HiOutlineUsers size={22} />,
  },
  // {
  //   name: "Manual Evaluation",
  //   path: "manual_evaluation",
  //   icon: <FaClipboardCheck size={20} />,
  // },
];

export const LoginRoutes = [
  {
    name: "Help ",
    path: "help",
    image: <HiOutlineQuestionMarkCircle size={22} />,
  },
  {
    name: "Singn out ",
    path: "signout",
    func: clearLstorageVals,
    image: <HiOutlineArrowLeftOnRectangle size={22} />,
  },
  {
    name: "Collapse ",
    path: "collapse",
    image: <HiOutlineArrowLeft size={22} />,
  },
];

export const widths = {
  collapsed: "3%",
  expanded: "15%",
};
