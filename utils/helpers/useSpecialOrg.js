import { useSelector } from "react-redux";

const useSpecialOrg = () => {
  const rawStudent = useSelector((s) => s.student.student);
  const student = rawStudent?.data || rawStudent;
  const orgDetails = student?.orgDetails;
  
  const specialOrgId = process.env.NEXT_PUBLIC_SPECIAL_ORG_ID;
  let isSpecialOrg = orgDetails?.orgId === specialOrgId;
  
  // Fallback: check token directly
  if (!isSpecialOrg && typeof window !== "undefined") {
    try {
      const token = window.localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.orgId === specialOrgId) {
          isSpecialOrg = true;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return { isSpecialOrg, specialOrgId, student, orgDetails };
};

export default useSpecialOrg;
