export const gqlUrl = process.env.NEXT_PUBLIC_GQL_URL;
// export const gqlUrl = "http://localhost:2001";
// export const gqlUrl = "https://gql.skillmedha.com";

// export const restUrl = "http://localhost:2000";
export const restUrl = process.env.NEXT_PUBLIC_REST_URL;
export const testUrl = process.env.NEXT_PUBLIC_REST_URL + "/assessments";


// export const studentUrl = "http://localhost:2004";
export const studentUrl = process.env.NEXT_PUBLIC_STUDENT_URL;
// export const studentUrl = "https://st.skillmedha.com";

// export const internShipUrl = "http://localhost:2006";
export const internShipUrl = process.env.NEXT_PUBLIC_INTERNSHIP_URL;
// export const internShipUrl = "https://internship.skillmedha.com";
export const internshipUrl = internShipUrl;

export const aiUrl = process.env.NEXT_PUBLIC_AI_URL;
// export const aiUrl = "https://ai.skillmedha.com";
// export const aiUrl = "http://localhost:3005";

export const assessment_gql_url = process.env.NEXT_PUBLIC_ASSESSMENT_GQL_URL;
// export const assessment_gql_url = "https://assessments.gql.skillmedha.com";
// export const assessment_gql_url = "http://localhost:1111";

export const assessment_socket_url =
  process.env.NEXT_PUBLIC_ASSESSMENT_SOCKET_URL;
// export const assessment_socket_url = "https://assessment.socket.skillmedha.com";
// export const assessment_socket_url = "http://localhost:2222";

export const assessment_proctoring_url =
  process.env.NEXT_PUBLIC_ASSESSMENT_PROCTORING_URL;
// export const assessment_proctoring_url = "https://assessments.proct.skillmedha.com";

// export const skillmedhaTestPortal = "http://localhost:1112";
export const skillmedhaTestPortal = process.env.NEXT_PUBLIC_TEST_PORTAL_URL;
// export const skillmedhaTestPortal = "https://assessments.skillmedha.com";
export const questionUrl = process.env.NEXT_PUBLIC_QUESTION_URL || "http://localhost:2010";
export const assessmentServer = process.env.NEXT_PUBLIC_ASSESSMENT_SERVER_URL;
export const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;

export const proctoringServerUrl = assessment_proctoring_url;
export const socketServerUrl = assessment_socket_url;
