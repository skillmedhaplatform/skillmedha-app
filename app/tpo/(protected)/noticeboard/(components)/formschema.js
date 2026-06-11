export const targetGroupOptions = [
  { label: "Students by Passing Year", value: "STU_BATCH" },
  { label: "Students by Department", value: "STU_DEPT" },
  {
    label: "Students by Passing Year & Department",
    value: "STU_BATCH_DEPT",
  },
  {
    label: "All Students",
    value: "STU_ALL",
  },
];

export const FormFields = [
  { label: "Title", name: "title", type: "text", required: true },
  {
    label: "Type",
    name: "type",
    type: "select",
    required: true,
    options: ["Placement", "Internship", "Workshop"],
  },
  { label: "Message", name: "message", type: "textarea", required: true },
  {
    label: "Target Group",
    name: "targetGroupCode",
    type: "select",
    required: true,
    options: targetGroupOptions,
  },
  {
    label: "Attachments",
    name: "attachments",
    type: "upload",
    required: false,
  },
  {
    label: "Valid From",
    name: "startDate",
    type: "date",
    required: true,
  },
  {
    label: "Valid To",
    name: "endDate",
    type: "date",
    required: true,
  },
  {
    label: "Priority",
    name: "priority",
    type: "select",
    required: false,
    options: ["High", "Medium", "Low"],
  },
  {
    label: "Send email Notifications",
    name: "emailNotification",
    type: "radio",
    required: true,
  },
];
