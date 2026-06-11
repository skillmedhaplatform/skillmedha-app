import { clearLstorageVals } from "@/utils/universalUtils/windowMW";
import {
  FaListAlt,
  FaDatabase,
  FaUserGraduate,
  FaQuestionCircle,
  FaSignOutAlt,
  FaArrowLeft,
} from "react-icons/fa";

export const sideBarTitles = [
  {
    name: "My Tests",
    path: "myTests",
    icon: <FaListAlt size={20} />,
  },
  {
    name: "Question Bank",
    path: "question-bank",
    icon: <FaDatabase size={20} />,
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
    icon: <FaDatabase size={20} />,
  },
  {
    name: "Students",
    path: "users",
    icon: <FaUserGraduate size={20} />,
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
    image: <FaQuestionCircle size={20} />,
  },
  {
    name: "Singn out ",
    path: "signout",
    func: clearLstorageVals,
    image: <FaSignOutAlt size={20} />,
  },
  {
    name: "Collapse ",
    path: "collapse",
    image: <FaArrowLeft size={20} />,
  },
];

export const widths = {
  collapsed: "3%",
  expanded: "15%",
};
