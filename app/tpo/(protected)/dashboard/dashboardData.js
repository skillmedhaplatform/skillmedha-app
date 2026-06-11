import {
  FaUserGraduate,
  FaBriefcase,
  FaEnvelopeOpenText,
  FaUserTie,
  FaBuilding,
} from "react-icons/fa";

// Overall top stats with icons
export const dashboardStats = [
  {
    label: "Students",
    value: 11,
    icon: FaUserGraduate,
  },
  {
    label: "Job Profiles",
    value: 10,
    icon: FaBriefcase,
  },
  {
    label: "Placed",
    value: 0,
    icon: FaUserTie,
  },
  {
    label: "Companies",
    value: 3,
    icon: FaBuilding,
  },
];

// Top recruiters by number of students placed
export const topRecruitersByPlacement = [
  { recruiter: "Skill Medha", studentsPlaced: 4 },
  { recruiter: "Testing-2", studentsPlaced: 4 },
  { recruiter: "Testing Mech", studentsPlaced: 3 },
];

// Top recruiters by CTC
export const topRecruitersByCTC = [
  { recruiter: "Skill Medha", ctc: "8.5 L" },
  { recruiter: "Testing Mech", ctc: "7.2 L" },
  { recruiter: "Testing-2", ctc: "6.8 L" },
];

// CTC statistics
export const ctcStats = {
  averageCTC: 750000,
  highestCTC: 1200000,
  medianCTC: 720000,
};

// Department-wise placement statistics
export const departmentPlacements = [
  { department: "CSE", eligible: 5, placed: 3 },
  { department: "ECE", eligible: 4, placed: 2 },
  { department: "Mech", eligible: 3, placed: 2 },
  { department: "Civil", eligible: 2, placed: 1 },
  { department: "MBA", eligible: 2, placed: 1 },
];

// Sector-wise placement breakdown (pie chart)
export const sectorPlacements = [
  { sector: "Skill Medha", value: 33.3 },
  { sector: "Testing-2", value: 33.3 },
  { sector: "Testing Mech", value: 33.3 },
];
