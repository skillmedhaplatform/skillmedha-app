const basePath = "/tpo/myprofile";
export const profileSidebarItems = [
  { name: "Personal Details", path: `${basePath}/personal`, disable: false },
  {
    name: "Institution Details",
    path: `${basePath}/institution`,
    disable: false,
  },
  {
    name: "Accreditations and Ranking",
    path: `${basePath}/accreditation`,
    disable: false,
  },
  {
    name: "TPO Support Team Details",
    path: `${basePath}/tpo_support_team`,
    disable: false,
  },
  // {
  //   name: "Placement Cell Social Media",
  //   path: `${basePath}/placement_cell_social_media`,
  //   disable: true,
  // },
  // {
  //   name: "Placement Cell documents",
  //   path: `${basePath}/placement_cell_documents`,
  //   disable: true,
  // },
  {
    name: "Placement Cell MOUs",
    path: `${basePath}/placement_cell_mous`,
    disable: false,
  },
];
