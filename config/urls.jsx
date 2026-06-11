// ==========================================
// 1. MODERN CANONICAL EXPORTS
// Recommended for all new feature development
// ==========================================
export const gqlUrl = process.env.NEXT_PUBLIC_GQL_URL;
export const restUrl = process.env.NEXT_PUBLIC_REST_URL;
export const uploadUrl = `${process.env.NEXT_PUBLIC_REST_URL}/uploadToS3`;
export const internshipUrl = process.env.NEXT_PUBLIC_INTERNSHIP_URL;
export const aiUrl = process.env.NEXT_PUBLIC_AI_URL;
export const studentUrl = process.env.NEXT_PUBLIC_STUDENT_URL;
export const testUrl = process.env.NEXT_PUBLIC_TEST_URL;
export const assessmentGqlUrl = process.env.NEXT_PUBLIC_ASSESSMENT_GQL_URL;
export const assessmentSocketUrl = process.env.NEXT_PUBLIC_ASSESSMENT_SOCKET_URL;
export const testPortalUrl = process.env.NEXT_PUBLIC_TEST_PORTAL_URL || "/testportal";
export const assessment_proctoring_url = process.env.NEXT_PUBLIC_ASSESSMENT_PROCTORING_URL;

// ==========================================
// 2. LEGACY ALIAS MAPPINGS
// Maintained for backward compatibility 
// with older migrated portals
// ==========================================
export const internShipUrl = internshipUrl;             // Capital 'S' legacy alias
export const assessment_gql_url = assessmentGqlUrl;     // snake_case legacy alias
export const assessment_socket_url = assessmentSocketUrl; // snake_case legacy alias
export const skillmedhaTestPortal = testPortalUrl;      // Non-standard legacy alias
