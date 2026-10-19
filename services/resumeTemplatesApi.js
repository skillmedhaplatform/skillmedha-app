import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";

// API calls for the admin-configured resume template catalogue (templates,
// bundles, purchases). Errors are re-thrown with the server's message so
// callers can show it directly.

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

export const fetchResumeCatalog = async () => (await call("get", "/resume-catalog")).data;

/** Resolves to { allowed: true } or { allowed: false, code, message, details }. */
export const authorizeResumeTemplate = async (templateKey) => {
  try {
    const res = await call("post", `/resume-templates/${templateKey}/authorize`);
    return { allowed: true, ...res.data };
  } catch (err) {
    if (err.status === 402 || err.status === 404) {
      return { allowed: false, code: err.code, message: err.message, details: err.details };
    }
    throw err;
  }
};

export const createResumeOrder = async ({ itemType, itemId }) =>
  call("post", "/payment/catalog/createOrder", { data: { itemType, itemId } });

export const verifyResumePayment = async (response) =>
  call("post", "/payment/catalog/verify", {
    data: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    },
  });

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminFetchTemplateConfigs = async () => (await adminCall("get", "/resume-templates")).data;

export const adminSaveTemplateConfig = async (templateKey, config) =>
  (await adminCall("put", `/resume-templates/${templateKey}`, { data: config })).data;

/** Saves many templates at once: [{ templateKey, ...config }]. */
export const adminSaveTemplateConfigsBulk = async (templates) =>
  adminCall("put", "/resume-templates", { data: { templates } });

export const adminFetchBundles = async () => (await adminCall("get", "/resume-bundles")).data;

export const adminCreateBundle = async (bundle) =>
  (await adminCall("post", "/resume-bundles", { data: bundle })).data;

export const adminUpdateBundle = async (id, bundle) =>
  (await adminCall("put", `/resume-bundles/${id}`, { data: bundle })).data;

export const adminDeleteBundle = async (id) => adminCall("delete", `/resume-bundles/${id}`);

export const adminFetchStats = async () => (await adminCall("get", "/resume-templates/stats")).data;

export const adminFetchPurchases = async (params) => adminCall("get", "/resume-templates/purchases", { params });

export const adminFetchAuditLog = async (entityId) =>
  (await adminCall("get", "/resume-templates/audit", { params: entityId ? { entityId } : {} })).data;
