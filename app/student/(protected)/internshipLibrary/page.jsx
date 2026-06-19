"use client";

import LibraryPage from "@/universalUtils/LibraryPage/LibraryPage";
import { getAllInternships, getAllInternshipsOnly } from "@/redux/slices/internship";

const selectInternships = (state) => state.internship.allInternships?.data;
const selectPagination = (state) => state.internship.allInternships?.pagination;
const selectAllInternships = (state) => state.internship.allInternshipsOnly;

const getInternshipUrl = (internship) => {
  const title = internship?.title?.split(" ")?.join("");
  return `/student/learning-internship?title=${title}&id=${internship?._id}&orgId=${internship?.sourceOrgId}`;
};

const renderInternshipMetaChips = (internship) =>
  internship?.difficulty ? (
    <span
      key="difficulty"
      style={{
        fontSize: 12,
        color: "black",
        background: "white",
        border: "1px solid rgba(159,176,195,0.22)",
        padding: "4px 8px",
        borderRadius: 999,
      }}
    >
      {internship.difficulty}
    </span>
  ) : null;

const InternshipLibraryPage = () => (
  <LibraryPage
    title="Internship Library"
    fetchAction={getAllInternships}
    getAllCoursesOnly={getAllInternshipsOnly}
    dataSelector={selectInternships}
    paginationSelector={selectPagination}
    allCoursesSelector={selectAllInternships}
    getItemUrl={getInternshipUrl}
    viewLabel="View Internship"
    searchPlaceholder="Search internships…"
    idPrefix="internship"
    renderMetaChips={renderInternshipMetaChips}
  />
);

export default InternshipLibraryPage;