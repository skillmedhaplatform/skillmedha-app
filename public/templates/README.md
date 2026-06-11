# Excel Templates for Bulk Question Upload

This directory contains Excel (`.xlsx`) templates for uploading practice questions in bulk. Excel format is used for better compatibility and ease of use for content creators.

## Available Templates

### 1. **all_questions_template.xlsx**

Combined template with examples of all question types. Use this if you want to upload mixed question types.

### 2. **text_questions_template.xlsx**

Template for text-based questions (open-ended answers).

### 3. **single_choice_template.xlsx**

Template for single choice (radio button) questions.

### 4. **multiple_choice_template.xlsx**

Template for multiple choice (checkbox) questions.

### 5. **true_false_template.xlsx**

Template for true/false questions.

### 6. **coding_questions_template.xlsx**

Template for coding questions with test cases.

---

## Field Descriptions

### Common Fields (Required for all question types)

| Field             | Description                       | Example                                                                     |
| ----------------- | --------------------------------- | --------------------------------------------------------------------------- |
| **Question Type** | Type of question                  | `Text`, `Single Choice`, `Multiple Choice`, `True/False`, `Coding Question` |
| **Question Text** | The question content              | `What is the capital of France?`                                            |
| **Explanation**   | Answer explanation                | `The capital of France is Paris...`                                         |
| **Score Points**  | Points awarded for correct answer | `5`                                                                         |

### Choice Questions (Single Choice & Multiple Choice)

| Field                          | Description                   | Example                               |
| ------------------------------ | ----------------------------- | ------------------------------------- |
| **Option 1-4**                 | Answer options                | `Paris`, `London`, `Berlin`, `Madrid` |
| **Correct Answer** (Single)    | Index of correct option (1-4) | `1`                                   |
| **Correct Answers** (Multiple) | Comma-separated indices       | `1,3,4`                               |

### True/False Questions

| Field              | Description       | Example |
| ------------------ | ----------------- | ------- |
| **Correct Answer** | `true` or `false` | `true`  |

### Coding Questions

| Field               | Description              | Example          |
| ------------------- | ------------------------ | ---------------- |
| **Test Cases JSON** | JSON array of test cases | See format below |

#### Test Cases JSON Format

```json
[
  {
    "input": "2, 3",
    "expectedOutput": "5",
    "explanation": "2 + 3 = 5"
  },
  {
    "input": "10, 20",
    "expectedOutput": "30",
    "explanation": "10 + 20 = 30"
  }
]
```

**Important:** When entering JSON in CSV, use double quotes (`""`) to escape quotes inside the JSON string.

---

## How to Use

1. **Download** the appropriate template
2. **Fill in** your questions following the examples
3. **Save** the Excel file (`.xlsx` format)
4. **Upload** via the bulk upload interface

## Tips

- ✅ Keep one question per row
- ✅ Use UTF-8 encoding to support special characters
- ✅ For empty fields, leave them blank (don't use "N/A" or "-")
- ✅ For Multiple Choice, use comma-separated indices (e.g., `1,2,4`)
- ✅ For Coding questions, ensure JSON is properly formatted
- ❌ Don't include extra columns
- ❌ Don't skip required fields
- ❌ Don't use line breaks within cells

## Validation Rules

### Text Questions

- Question Text: Required, non-empty
- Explanation: Required, non-empty
- Score Points: Required, must be > 0

### Single Choice

- All Text question rules apply
- At least 2 options required
- Correct Answer: Must be a valid option index (1-4)

### Multiple Choice

- All Text question rules apply
- At least 2 options required
- Correct Answers: Comma-separated indices, at least one required

### True/False

- All Text question rules apply
- Correct Answer: Must be exactly `true` or `false` (lowercase)

### Coding Question

- All Text question rules apply
- Test Cases JSON: Must be valid JSON array
- At least 1 test case required
- Each test case must have: `input`, `expectedOutput`, `explanation`

---

## Example Workflow

1. Open `all_questions_template.xlsx` in Excel or Google Sheets
2. Delete example rows (keep the header row)
3. Add your questions following the format
4. Save the file (Excel will save as `.xlsx` automatically)
5. Upload via the admin panel
6. Review validation results
7. Confirm upload

---

## Need Help?

If you encounter issues:

- Check that your Excel file follows the exact column structure
- Verify all required fields are filled
- Ensure JSON formatting is correct for coding questions
- Check that option indices are valid (1-4)
- Make sure Score Points is a positive number
- Don't add extra columns or modify the header row

For technical support, contact your system administrator.