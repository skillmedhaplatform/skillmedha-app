import { redirect } from "next/navigation";



const StudentPage = async ({ params }) => {
  const { departId, studentId } = await params;
  redirect(`/tpo/allstudents/${departId}/${studentId}/basic-details`);
};
export default StudentPage;
