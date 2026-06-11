import { FaGlobe, FaKey, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import CommercialPage from "../components/commercial";
import GroupPassword from "../components/group";
import PrivateComponent from "../components/private";
import PublicComponent from "../components/public";
import TrainingComponent from "../components/training";

export const headTitles = [
  // {
  //   name: "Public Link",
  //   comp: <PublicComponent />,
  //   message: "Anyone who has a link will be able to take the test",
  //   image: <FaGlobe size={20} />,
  //   type: "public",
  // },
  {
    name: "Private Access Code",
    comp: <PrivateComponent />,
    message: "Anyone who has access code will be able to take the test",
    image: <FaKey size={20} />,
    type: "private",
  },
  // {
  //   name: "Commercial",
  //   comp: <CommercialPage />,
  //   message: "",
  //   image: <FaMoneyBillWave size={20} />,
  //   type: "commercial",
  // },
  // {
  //     name : "Group Password",
  //     comp : <GroupPassword />,
  //     message:"",
  //     image: <FaUsers size={20} />,
  //     type : "group"
  // },
];
