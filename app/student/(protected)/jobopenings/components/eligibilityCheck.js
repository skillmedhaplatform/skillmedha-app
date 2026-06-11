import educationDegreeOptions from "@/universalUtils/educationData";

function convertGradeToPercentage(grade, gradingSystem) {
  if (!grade) return 0;
  if (gradingSystem === "percentage") return parseFloat(grade);
  if (gradingSystem === "cgpa") {
    return parseFloat(grade) * 10; // assuming CGPA out of 10
  }
  return parseFloat(grade);
}

function normalizeDegreeLabel(studentType) {
  if (!studentType) return null;
  const normalizedType = studentType.trim().toLowerCase();

  // Direct mapping for your data format
  const directMappings = {
    "10th / secondary education": "10th (Secondary School)",
    "senior secondary / diploma / iti": "12th (Higher Secondary)",
    degree: "Bachelor of Technology (BTech)", // This needs more logic based on degreeName
  };

  if (directMappings[normalizedType]) {
    return directMappings[normalizedType];
  }

  // Enhanced mapping rules to handle your data
  const mappingRules = [
    { keywords: ["10th", "secondary"], label: "10th (Secondary School)" },
    {
      keywords: ["12th", "higher secondary", "senior secondary"],
      label: "12th (Higher Secondary)",
    },
    { keywords: ["diploma"], label: "Diploma (Polytechnic)" },
    { keywords: ["iti"], label: "ITI (Industrial Training Institute)" },
    {
      keywords: ["b.tech", "btech", "bachelor of technology"],
      label: "Bachelor of Technology (BTech)",
    },
    {
      keywords: ["b.e", "be", "bachelor of engineering"],
      label: "Bachelor of Engineering (BE)",
    },
    {
      keywords: ["b.sc", "bsc", "bachelor of science"],
      label: "Bachelor of Science (BSc)",
    },
    {
      keywords: ["b.a", "ba", "bachelor of arts"],
      label: "Bachelor of Arts (BA)",
    },
    {
      keywords: ["b.com", "bcom", "bachelor of commerce"],
      label: "Bachelor of Commerce (BCom)",
    },
  ];

  for (const rule of mappingRules) {
    if (rule.keywords.some((kw) => normalizedType.includes(kw))) {
      return rule.label;
    }
  }
  return studentType;
}

function extractDepartmentFromEducation(edu) {
  // Handle different data formats
  if (edu.department) return edu.department.toLowerCase();
  if (edu.stream) {
    // Extract department from stream like "DME-Diploma in Mechanical Engineering"
    if (edu.stream.includes("Mechanical")) return "mechanical engineering";
    if (edu.stream.includes("Computer Science") || edu.stream.includes("CSMB"))
      return "computer science";
    return edu.stream.toLowerCase();
  }
  if (edu.degreeName) {
    // Extract from degreeName like "B.Tech / B.E. (Bachelor of Technology/Engineering) -Computer Science"
    if (edu.degreeName.includes("Computer Science")) return "computer science";
    if (edu.degreeName.includes("Mechanical")) return "mechanical engineering";
  }
  return "";
}

function matchesDepartment(studentDept, jobDept) {
  if (!studentDept || !jobDept) return true; // If either is empty, consider it a match

  const studentDeptNorm = studentDept.toLowerCase();
  const jobDeptNorm = jobDept.toLowerCase();

  // Exact match
  if (studentDeptNorm === jobDeptNorm) return true;

  // Partial matches for common variations
  const deptMappings = {
    "computer science": ["cse", "cs", "computer science", "csmb"],
    "mechanical engineering": [
      "mechanical",
      "mech",
      "dme",
      "mechanical engineering",
    ],
    "electrical engineering": ["eee", "electrical", "ece", "electronics"],
  };

  for (const [standard, variations] of Object.entries(deptMappings)) {
    if (
      variations.some((v) => studentDeptNorm.includes(v)) &&
      variations.some((v) => jobDeptNorm.includes(v))
    ) {
      return true;
    }
  }

  return false;
}

export function getEligibilityStatus(student, job) {
  if (!student || !job || !Array.isArray(student.educationDetails)) {
    return {
      eligible: false,
      reason:
        "We couldn't verify your eligibility due to incomplete profile information. Please ensure your education details are properly filled.",
    };
  }

  const failureReasons = [];
  let hasMatchingEducation = false;

  for (const edu of student.educationDetails) {
    let normalizedDegree = normalizeDegreeLabel(edu.type);

    // Special handling for "Senior Secondary / Diploma / ITI"
    if (edu.type === "Senior Secondary / Diploma / ITI") {
      if (edu.stream && edu.stream.toLowerCase().includes("diploma")) {
        normalizedDegree = "Diploma (Polytechnic)";
      } else {
        normalizedDegree = "12th (Higher Secondary)";
      }
    }

    // Special handling for "Degree"
    if (edu.type === "Degree" && edu.degreeName) {
      if (
        edu.degreeName.includes("B.Tech") ||
        edu.degreeName.includes("Bachelor of Technology")
      ) {
        normalizedDegree = "Bachelor of Technology (BTech)";
      }
    }

    if (!normalizedDegree) {
      failureReasons.push(
        `We couldn't recognize "${edu.type}" as a valid education qualification.`
      );
      continue;
    }

    const studentDept = extractDepartmentFromEducation(edu);

    // Check if this education matches any job's applicable courses
    const jobCourseMatch = job.applicableCourses.find((course) => {
      const degreeMatch =
        course.degree.toLowerCase() === normalizedDegree.toLowerCase();
      if (!degreeMatch) return false;

      // If job course has department requirement, check it
      if (course.department) {
        return matchesDepartment(studentDept, course.department);
      }

      return true; // No department requirement
    });

    if (!jobCourseMatch) {
      continue; // This education doesn't match job requirements, try next one
    }

    hasMatchingEducation = true;

    // Find eligibility criteria for this degree
    const criteria = job.eligibilityCriteria.find(
      (c) => c.educationLevel.toLowerCase() === normalizedDegree.toLowerCase()
    );

    if (!criteria) {
      // If no specific criteria for this degree, student might still be eligible through other qualifications
      continue;
    }

    const studentGrade = convertGradeToPercentage(edu.grade, edu.gradingSystem);
    const minMarks = parseFloat(criteria.minMarksPercentage);

    if (studentGrade >= minMarks) {
      return {
        eligible: true,
        reason:
          "Great! You meet all the eligibility requirements for this position.",
      };
    } else {
      failureReasons.push(
        `Your ${normalizedDegree} score of ${studentGrade}% is below the minimum requirement of ${minMarks}% for this position.`
      );
    }
  }

  // If we found matching education but failed criteria
  if (hasMatchingEducation && failureReasons.length > 0) {
    const detailedReason =
      failureReasons.length === 1
        ? failureReasons[0]
        : `Unfortunately, you don't meet the eligibility criteria: ${failureReasons.join(
            " Additionally, "
          )}`;

    return {
      eligible: false,
      reason: detailedReason,
    };
  }

  // No matching education found
  return {
    eligible: false,
    reason:
      "Your educational background doesn't match the requirements for this job position.",
  };
}
