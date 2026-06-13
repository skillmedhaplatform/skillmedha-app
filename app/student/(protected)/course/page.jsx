"use client";

import LibraryPage from "@/universalUtils/LibraryPage/LibraryPage";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { getAllCourses } from "@/redux/slices/internship";

// Stable module-level selectors (avoids new reference on every render)
const selectCourses = (state) => state.internship.allCourses?.data;
const selectPagination = (state) => state.internship.allCourses?.pagination;

const getCourseUrl = (course) => {
  const title = course?.title?.split(" ")?.join("");
  return `/student/learning-course?title=${title}&id=${course?._id}&orgId=${course?.sourceOrgId}`;
};

const renderCourseMetaChips = (course) => {
  const duration = course?.duration || course?.courseIncludes?.videoDuration;
  return duration ? (
    <span
      key="duration"
      style={{
        fontSize: 12,
        color: "black",
        background: "white",
        border: "1px solid rgba(159,176,195,0.22)",
        padding: "4px 8px",
        borderRadius: 999,
      }}
    >
      {duration}
    </span>
  ) : null;
};

const CourseLibraryPage = () => (
  <>
    <StudentPageHeader section="Learning" title="Course Library" />
    <LibraryPage
      title="Course Library"
      showBuyNow={true} 
      fetchAction={getAllCourses}
      dataSelector={selectCourses}
      paginationSelector={selectPagination}
      getItemUrl={getCourseUrl}
      viewLabel="View Course"
      searchPlaceholder="Search courses…"
      idPrefix="course"
      renderMetaChips={renderCourseMetaChips}
    />
  </>
);

export default CourseLibraryPage;
