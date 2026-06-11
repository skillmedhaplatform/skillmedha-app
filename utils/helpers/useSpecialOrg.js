import { useSelector } from "react-redux";

const useSpecialOrg = () => {
  const rawStudent = useSelector((s) => s.student.student);
  const student = rawStudent?.data || rawStudent;
  const orgDetails = student?.orgDetails;
  
  const specialOrgId = process.env.NEXT_PUBLIC_SPECIAL_ORG_ID;
  const isSpecialOrg = orgDetails?.orgId === specialOrgId;

  return { isSpecialOrg, specialOrgId, student, orgDetails };
};

export default useSpecialOrg;
