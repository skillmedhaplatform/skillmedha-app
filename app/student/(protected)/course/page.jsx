"use client";

import LibraryPage from "@/universalUtils/LibraryPage/LibraryPage";
import { getAllCourses, getAllCoursesOnly } from "@/redux/slices/internship";

// Selectors
const selectCourses = (state) => state.internship.allCourses?.data;
const selectPagination = (state) => state.internship.allCourses?.pagination;
const selectAllCourses = (state) => state.internship.allCoursesOnly;

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
  <LibraryPage
    title="Course Library"
    fetchAction={getAllCourses}
    getAllCoursesOnly={getAllCoursesOnly}
    dataSelector={selectCourses}
    paginationSelector={selectPagination}
    allCoursesSelector={selectAllCourses}
    getItemUrl={getCourseUrl}
    viewLabel="View Course"
    searchPlaceholder="Search courses…"
    idPrefix="course"
    renderMetaChips={renderCourseMetaChips}
    showBuyNow={true}
    showWishlist={true}
  />
);

export default CourseLibraryPage;