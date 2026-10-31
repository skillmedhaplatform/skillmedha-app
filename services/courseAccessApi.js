import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";

// API calls for admin-configured course access (Free / Premium / Bundle-only,
// visibility) and course bundles. Errors are re-thrown with the server's
// message so callers can show it directly.

const api = axios.create({ baseURL: restUrl });

// Students and CMS admins keep their tokens under different keys; a browser
// can hold both, so each side must send its own.
const studentToken = () => getLstorage("token");
const adminToken = () => getLstorage("jwtToken") || getLstorage("token");

const request = (getToken) => async (method, url, { data, params } = {}) => {
  try {
    const res = await api.request({
      method,
      url,
      data,
      params,
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  } catch (error) {
    const body = error.response?.data || {};
    const err = new Error(body.err || body.error || body.message || error.message);
    err.status = error.response?.status;
    err.code = body.code;
    err.details = body;
    throw err;
  }
};

const call = request(studentToken);
const adminCall = request(adminToken);

// ─── Student ──────────────────────────────────────────────────────────────────

/** { courses: [{ courseId, access, visible, entitlement, bundles, ... }], bundles: [...] } */
export const fetchCourseCatalog = async () => (await call("get", "/course-catalog")).data;

/** The student's own course and bundle purchases, newest first. */
export const fetchMyCoursePurchases = async () => (await call("get", "/my-course-purchases")).data;

export const createCourseBundleOrder = async (bundleId) =>
  call("post", "/payment/course/createOrder", { data: { bundleId } });

export const verifyCourseBundlePayment = async (response) =>
  call("post", "/payment/course/verify", {
    data: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    },
  });

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminFetchCourseConfigs = async () => (await adminCall("get", "/course-access")).data;

export const adminSaveCourseConfig = async (courseId, config) =>
  (await adminCall("put", `/course-access/${courseId}`, { data: config })).data;

/** Saves many courses at once: [{ courseId, ...config }]. */
export const adminSaveCourseConfigsBulk = async (courses) => adminCall("put", "/course-access", { data: { courses } });

export const adminFetchCourseBundles = async () => (await adminCall("get", "/course-bundles")).data;

export const adminCreateCourseBundle = async (bundle) =>
  (await adminCall("post", "/course-bundles", { data: bundle })).data;

export const adminUpdateCourseBundle = async (id, bundle) =>
  (await adminCall("put", `/course-bundles/${id}`, { data: bundle })).data;

export const adminDeleteCourseBundle = async (id) => adminCall("delete", `/course-bundles/${id}`);

export const adminFetchCourseStats = async () => (await adminCall("get", "/course-access/stats")).data;
