export const studentProfileSchema = [
  {
    label: "First Name",
    name: "firstName",
    type: "text",
    required: true,
  },
  {
    label: "Middle Name",
    name: "middleName",
    type: "text",
  },
  {
    label: "Last Name (Surname)",
    name: "lastName",
    type: "text",
    required: true,
  },
  {
    label: "Date of Birth",
    name: "DOB",
    type: "date",
    required: true,
  },
  {
    label: "Gender",
    name: "gender",
    type: "select",
    options: ["Male", "Female", "Other", "Prefer not to mention"],
    required: true,
  },
  {
    label: "Phone",
    name: "phone",
    type: "text",
    placeholder: "+91xxxxxxxxxx",
    required: true,
    maxLength: 13,
  },
  {
    label: "Alternate Phone",
    name: "alternatePhone",
    type: "text",
    placeholder: "+91xxxxxxxxxx",
    maxLength: 13,
  },
  {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "abc@example.com",
    required: true,
    disable: true,
  },
  {
    label: "Current/Latest College",
    name: "collegeName",
    type: "selectandAdd",
    placeholder: "School of Planning and Architecture, New Delhi",
  },

  // Summary
  {
    label: "Summary",
    name: "professionalSummary",
    type: "textarea",
    placeholder: "Brief about you, skills, and experience",
  },

  // Address: Current Address and Permanent Address as arrays
  {
    label: "Addresses",
    name: "addresses",
    type: "object",
    itemFields: [
      {
        label: "Current Address",
        name: "currentAddress",
        type: "object",
        fields: [
          { label: "Door No.", name: "doorNo", type: "text" },
          { label: "Street", name: "streetName", type: "text" },
          { label: "Landmark", name: "landMark", type: "text" },
          { label: "Area", name: "areaName", type: "text" },
          {
            label: "Pincode",
            name: "pincode",
            type: "text",
            placeholder: "e.g., 530001",
          },
          { label: "City", name: "cityName", type: "text" },
          { label: "District", name: "districtName", type: "text" },
          { label: "State", name: "stateName", type: "text" },
        ],
      },
      {
        label: "Permanent Address",
        name: "permanentAddress",
        type: "object",
        fields: [
          { label: "Door No.", name: "doorNo", type: "text" },
          { label: "Street", name: "streetName", type: "text" },
          { label: "Landmark", name: "landMark", type: "text" },
          { label: "Area", name: "areaName", type: "text" },
          {
            label: "Pincode",
            name: "pincode",
            type: "text",
            placeholder: "e.g., 530001",
          },
          { label: "City", name: "cityName", type: "text" },
          { label: "District", name: "districtName", type: "text" },
          { label: "State", name: "stateName", type: "text" },
        ],
      },
    ],
  },

  // Social Media Profiles
  {
    label: "Social Media Profiles",
    name: "links",
    type: "array",
    itemFields: [
      {
        label: "Platform",
        name: "title",
        type: "text",
      },
      {
        label: "URL",
        name: "link",
        type: "url",
        placeholder: "//linkedin//",
      },
    ],
  },
];
