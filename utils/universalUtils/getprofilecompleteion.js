export function calculateProfileCompletion(student) {
  let total = 0;
  let score = 0;
  let suggestions = [];
  let fieldDetails = {};

  // 1. Basic Info (10%)
  total += 10;
  const basicFields = ["firstName", "lastName", "email", "phone", "profile"];
  const completedBasic = basicFields.filter(
    (field) => student?.[field]?.trim?.() || student?.[field]
  );

  if (completedBasic.length === 5) {
    score += 10;
    fieldDetails.basicInfo = { status: "complete", score: 10 };
  } else if (completedBasic.length >= 3) {
    score += 6; // Partial credit
    fieldDetails.basicInfo = { status: "partial", score: 6 };
    const missing = basicFields.filter((f) => !completedBasic.includes(f));
    suggestions.push(`Complete basic info: ${missing.join(", ")}`);
  } else {
    fieldDetails.basicInfo = { status: "incomplete", score: 0 };
    suggestions.push(
      "Complete your basic information (name, email, phone, profile picture)"
    );
  }

  // 2. Address (10%)
  total += 10;
  const current = student?.addresses?.currentAddress || {};
  const permanent = student?.addresses?.permanentAddress || {};

  const currentComplete =
    current?.doorNo && current?.cityName && current?.stateName;
  const permanentComplete =
    permanent?.doorNo && permanent?.cityName && permanent?.stateName;
  const currentPartial = Object.values(current).some((v) => v?.trim?.());
  const permanentPartial = Object.values(permanent).some((v) => v?.trim?.());

  if (currentComplete && permanentComplete) {
    score += 10;
    fieldDetails.address = { status: "complete", score: 10 };
  } else if (
    currentComplete ||
    permanentComplete ||
    (currentPartial && permanentPartial)
  ) {
    score += 6;
    fieldDetails.address = { status: "partial", score: 6 };
    suggestions.push("Complete both current and permanent address details");
  } else if (currentPartial || permanentPartial) {
    score += 3;
    fieldDetails.address = { status: "minimal", score: 3 };
    suggestions.push("Add complete address information");
  } else {
    fieldDetails.address = { status: "incomplete", score: 0 };
    suggestions.push("Add your current and permanent address");
  }

  // 3. Education (15%)
  total += 15;
  const validEducation =
    student?.educationDetails?.filter(
      (edu) =>
        edu?.school?.trim() &&
        edu?.board?.trim() &&
        (edu?.yearofPass || edu?.grade)
    ) || [];

  if (validEducation.length >= 2) {
    score += 15;
    fieldDetails.education = { status: "complete", score: 15 };
  } else if (validEducation.length === 1) {
    score += 10;
    fieldDetails.education = { status: "partial", score: 10 };
    suggestions.push("Add more educational qualifications for better profile");
  } else if (
    student?.educationDetails?.some((edu) => edu?.school || edu?.board)
  ) {
    score += 5;
    fieldDetails.education = { status: "minimal", score: 5 };
    suggestions.push(
      "Complete your education details with school, board, and grades"
    );
  } else {
    fieldDetails.education = { status: "incomplete", score: 0 };
    suggestions.push("Add your educational qualifications");
  }

  // 4. Experience (15%)
  total += 15;
  const validExperience =
    student?.experiences?.filter(
      (exp) => exp?.company?.trim() && exp?.role?.trim()
    ) || [];

  if (validExperience.length >= 2) {
    score += 15;
    fieldDetails.experience = { status: "complete", score: 15 };
  } else if (validExperience.length === 1) {
    score += 10;
    fieldDetails.experience = { status: "partial", score: 10 };
    suggestions.push("Add more work experience or internships");
  } else if (student?.experiences?.some((exp) => exp?.company || exp?.role)) {
    score += 5;
    fieldDetails.experience = { status: "minimal", score: 5 };
    suggestions.push(
      "Complete your experience details with company name and role"
    );
  } else {
    fieldDetails.experience = { status: "incomplete", score: 0 };
    suggestions.push("Add your work experience or internships");
  }

  // 5. Projects (10%)
  total += 10;
  const validProjects =
    student?.projects?.filter(
      (proj) => proj?.project?.trim() && proj?.description?.trim()
    ) || [];

  if (validProjects.length >= 2) {
    score += 10;
    fieldDetails.projects = { status: "complete", score: 10 };
  } else if (validProjects.length === 1) {
    score += 7;
    fieldDetails.projects = { status: "partial", score: 7 };
    suggestions.push("Add more projects to showcase your skills");
  } else if (
    student?.projects?.some((proj) => proj?.project || proj?.description)
  ) {
    score += 3;
    fieldDetails.projects = { status: "minimal", score: 3 };
    suggestions.push("Complete project details with names and descriptions");
  } else {
    fieldDetails.projects = { status: "incomplete", score: 0 };
    suggestions.push("Add projects you have worked on");
  }

  // 6. Accomplishments (5%)
  total += 5;
  const validAccomplishments =
    student?.accomplishments?.filter((acc) => acc?.accomplishment?.trim()) ||
    [];

  if (validAccomplishments.length > 0) {
    score += 5;
    fieldDetails.accomplishments = { status: "complete", score: 5 };
  } else {
    fieldDetails.accomplishments = { status: "incomplete", score: 0 };
    suggestions.push("Add your achievements and accomplishments");
  }

  // 7. Languages (5%)
  total += 5;
  const validLanguages =
    student?.languages?.filter(
      (lang) => typeof lang === "string" && lang?.trim()
    ) || [];

  if (validLanguages.length >= 2) {
    score += 5;
    fieldDetails.languages = { status: "complete", score: 5 };
  } else if (validLanguages.length === 1) {
    score += 3;
    fieldDetails.languages = { status: "partial", score: 3 };
    suggestions.push("Add more languages you know");
  } else {
    fieldDetails.languages = { status: "incomplete", score: 0 };
    suggestions.push("Add languages you can speak");
  }

  // 8. Technical Skills (10%)
  total += 10;
  const validTechnical =
    student?.technical?.filter(
      (skill) => typeof skill === "string" && skill?.trim()
    ) || [];

  if (validTechnical.length >= 3) {
    score += 10;
    fieldDetails.technical = { status: "complete", score: 10 };
  } else if (validTechnical.length >= 1) {
    score += 6;
    fieldDetails.technical = { status: "partial", score: 6 };
    suggestions.push("Add more technical skills to improve your profile");
  } else {
    fieldDetails.technical = { status: "incomplete", score: 0 };
    suggestions.push("Add your technical skills and expertise");
  }

  // 9. Professional Summary (10%)
  total += 10;
  const summary = student?.professionalSummary?.replace(/<[^>]*>/g, "")?.trim(); // Remove HTML tags

  if (summary && summary.length >= 50) {
    score += 10;
    fieldDetails.summary = { status: "complete", score: 10 };
  } else if (summary && summary.length >= 20) {
    score += 6;
    fieldDetails.summary = { status: "partial", score: 6 };
    suggestions.push(
      "Expand your professional summary (aim for 50+ characters)"
    );
  } else if (summary) {
    score += 3;
    fieldDetails.summary = { status: "minimal", score: 3 };
    suggestions.push("Write a more detailed professional summary");
  } else {
    fieldDetails.summary = { status: "incomplete", score: 0 };
    suggestions.push("Add a professional summary about yourself");
  }

  // 10. Applied Jobs / Tests (10%)
  total += 10;
  const hasAppliedJobs = student?.appliedJobs?.length > 0;
  const hasTests = student?.psychometricTestResults?.length > 0;

  if (hasAppliedJobs && hasTests) {
    score += 10;
    fieldDetails.activity = { status: "complete", score: 10 };
  } else if (hasAppliedJobs || hasTests) {
    score += 6;
    fieldDetails.activity = { status: "partial", score: 6 };
    if (!hasTests)
      suggestions.push("Take psychometric tests to improve your profile");
    if (!hasAppliedJobs)
      suggestions.push("Start applying for jobs relevant to your skills");
  } else {
    fieldDetails.activity = { status: "incomplete", score: 0 };
    suggestions.push("Apply for jobs and take assessment tests");
  }

  // Calculate final percentage
  const percentage = Math.round((score / total) * 100);

  // Return comprehensive result
  return {
    percentage,
    score,
    total,
    suggestions: suggestions?.slice(0, 5), // Top 5 suggestions
    fieldDetails,
    completionLevel: getCompletionLevel(percentage),
    nextMilestone: getNextMilestone(percentage),
  };
}

// Helper functions
function getCompletionLevel(percentage) {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 75) return "Good";
  if (percentage >= 60) return "Fair";
  if (percentage >= 40) return "Basic";
  return "Incomplete";
}

function getNextMilestone(percentage) {
  if (percentage < 50)
    return { target: 50, message: "Complete basic profile information" };
  if (percentage < 75)
    return { target: 75, message: "Add more experience and projects" };
  if (percentage < 90)
    return { target: 90, message: "Enhance with accomplishments and skills" };
  return { target: 100, message: "Perfect your profile with all details" };
}
