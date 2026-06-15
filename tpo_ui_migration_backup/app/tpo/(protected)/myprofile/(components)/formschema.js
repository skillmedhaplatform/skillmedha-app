export const formSchemas = {
  personal: {
    title: "Personal Details",
    fields: [
      { label: "First Name", name: "firstName", type: "text", required: true },
      { label: "Middle Name", name: "middleName", type: "text" },
      {
        label: "Last Name (Surname)",
        name: "lastName",
        type: "text",
        required: true,
      },
      {
        label: "Gender",
        name: "gender",
        type: "select",
        options: ["Male", "Female", "Other"],
        required: true,
      },
      {
        label: "Phone",
        name: "phone",
        type: "tel",
        placeholder: "+91 xxx xxx xxxx",
        required: true,
      },
      {
        label: "Alternate Phone",
        name: "alternatePhone",
        type: "tel",
        placeholder: "+91 xxx xxx xxxx",
      },
      {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "abc@example.com",
        required: true,
        disabled: true,
      },
      {
        label: "TPO Logo",
        name: "tpoLogo",
        type: "ImageUpload",
      },
      {
        label: "Official Designation",
        name: "designation",
        type: "text",
        placeholder:
          "TPO / Assistant Professor & TPO / Dean – Training & Placements",
        required: true,
      },
      {
        label: "Qualification",
        name: "qualification",
        type: "text",
        placeholder:
          "B.Tech / M.Tech / MBA / PhD (mention all degrees with branches & universities)",
        required: true,
      },
      {
        label: "Awards / Recognitions",
        name: "awards",
        type: "text",
        placeholder: "TPO of the Year, Academic Excellence, etc.",
      },
    ],
  },

  institution: {
    title: "Institutional Details",
    fields: [
      {
        label: "Institution Name",
        name: "institutionName",
        type: "text",
        placeholder: "As per AICTE/UGC records",
        required: true,
      },
      {
        label: "Year of Establishment",
        name: "establishedYear",
        type: "number",
        required: true,
      },
      {
        label: "College Code / Affiliation Code",
        name: "collegeCode",
        type: "text",
        placeholder: "JNTUK / AICTE / AU, etc.",
      },
      {
        label: "Institution Type",
        name: "institutionType",
        type: "select",
        options: ["Govt", "Pvt", "Autonomous", "Deemed", "University"],
        required: true,
      },
      {
        label: "Affiliation & University",
        name: "affiliation",
        type: "text",
        placeholder: "e.g., Affiliated to JNTUK, Kakinada",
      },
      {
        label: "Address",
        name: "address",
        type: "text",
        placeholder: "With PIN code (Complete)",
        required: true,
      },
      {
        label: "Contact Number",
        name: "contactNumber",
        type: "tel",
        placeholder: "General office",
        required: true,
      },
      {
        label: "College Website",
        name: "website",
        type: "url",
        placeholder: "https://www.figma.com/",
      },
      {
        label: "Principal / Director Name",
        name: "principalName",
        type: "text",
        placeholder: "Mr. / Mrs. / Ms.",
        required: true,
      },
      {
        label: "Principal / Director Contact Number",
        name: "principalContact",
        type: "tel",
        placeholder: "xxxxxxxxxx",
        required: true,
      },
      {
        label: "Principal / Director Email ID",
        name: "principalEmail",
        type: "email",
        placeholder: "abc@example.com",
        required: true,
      },
      {
        label: "Institution Logo",
        name: "institutionLogo",
        type: "ImageUpload",
        required: true,
      },
      {
        label: "Courses (UG)",
        name: "ugCourses",
        type: "array",
        itemFields: [
          {
            label: "Name of Department",
            name: "departmentName",
            type: "text",
            placeholder: "e.g., Affiliated to JNTUK, Kakinada",
          },
          {
            label: "Address Year of Start",
            name: "yearOfStart",
            type: "text",
            placeholder: "With PIN code (Complete)",
          },
          {
            label: "Intake",
            name: "intake",
            type: "number",
            placeholder: "e.g., 120",
          },
          {
            label: "Current Final Years",
            name: "finalYears",
            type: "number",
            placeholder: "e.g., 100",
          },
        ],
      },
      {
        label: "Courses (PG)",
        name: "pgCourses",
        type: "array",
        itemFields: [
          {
            label: "Name of Department",
            name: "departmentName",
            type: "text",
            placeholder: "e.g., Affiliated to JNTUK, Kakinada",
          },
          {
            label: "Address Year of Start",
            name: "yearOfStart",
            type: "text",
            placeholder: "With PIN code (Complete)",
          },
          {
            label: "Intake",
            name: "intake",
            type: "number",
            placeholder: "e.g., 120",
          },
          {
            label: "Current Final Years",
            name: "finalYears",
            type: "number",
            placeholder: "e.g., 100",
          },
        ],
      },
    ],
  },

  accreditation: {
    title: "Accreditation and Ranking",
    fields: [
      {
        label: "NAAC Grade & Cycle",
        name: "naacGradeCycle",
        type: "text",
        placeholder: "As per AICTE/UGC records",
      },
      {
        label: "NBA Accreditation Status",
        name: "nbaStatus",
        type: "text",
        placeholder: "1999",
      },
      {
        label: "NIRF / ARIIA Ranking",
        name: "nirfRanking",
        type: "text",
        placeholder: "JNTUK / AICTE / AU, etc.",
      },
    ],
  },
  tpo_support_team: {
    title: "TPO Support Team Details",
    fields: [
      {
        label: "Placement Office",
        name: "placementOffice",
        type: "group",
        fields: [
          {
            label: "Name",
            name: "name",
            type: "text",
            placeholder: "Student Name",
            required: true,
          },
          {
            label: "Contact",
            name: "contact",
            type: "tel",
            placeholder: "+91 xxx xxx xxxx",
            required: true,
          },
          {
            label: "Email",
            name: "email",
            type: "email",
            placeholder: "abc@example.com",
            required: true,
          },
        ],
      },
      {
        label: "Departments",
        name: "departments",
        type: "array",
        itemFields: [
          {
            label: "Department Name",
            name: "departmentName",
            type: "text",
            required: true,
          },
          {
            label: "Name of Faculty Coordinator",
            name: "facultyCoordinatorName",
            type: "text",
            placeholder: "e.g., Affiliated to JNTUK, Kakinada",
            required: true,
          },
          {
            label: "Faculty Coordinator Contact",
            name: "facultyCoordinatorContact",
            type: "tel",
            placeholder: "+91 xxx xxx xxxx",
            required: true,
          },
          {
            label: "Name of Student Coordinator",
            name: "studentCoordinatorName",
            type: "text",
            placeholder: "With PIN code (Complete)",
            required: true,
          },
          {
            label: "Student Coordinator Contact",
            name: "studentCoordinatorContact",
            type: "tel",
            placeholder: "+91 xxx xxx xxxx",
            required: true,
          },
          {
            label: "Branch",
            name: "branch",
            type: "select",
            options: ["CSE", "ECE", "EEE", "ME", "CE", "IT", "Others"],
            required: true,
          },
          {
            label: "Current Year",
            name: "currentYear",
            type: "select",
            options: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
            required: true,
          },
        ],
      },
    ],
  },

  placement_cell_social_media: {
    title: "Placement Cell Social Media",
  },
  placement_cell_documents: {
    title: "Placement Cell Documents",
  },
  placement_cell_mous: {
    title: "Placement Cell MOUs",
    fields: [
      {
        label: "Company",
        name: "mous",
        type: "array",
        itemFields: [
          {
            label: "Name of the Company",
            name: "companyName",
            type: "text",
            placeholder: "e.g., Affiliated to JNTUK, Kakinada",
            required: true,
          },
          {
            label: "Upload MOU",
            name: "mouFile",
            type: "FileUpload",
            required: true,
          },
        ],
      },
    ],
  },
};
