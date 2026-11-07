import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";

// API calls for Free / Premium / Pro membership plans. Errors are re-thrown with
// the server's message so callers can show it directly.

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
    throw err;
  }
};

const call = request(studentToken);
const adminCall = request(adminToken);

// ─── Student ──────────────────────────────────────────────────────────────────

/** { enabled, current, plans: [{ key, name, features, options: [...] }], history } */
export const fetchMembership = async () => (await call("get", "/membership")).data;

export const createMembershipOrder = async (planKey, days) =>
  call("post", "/payment/membership/createOrder", { data: { planKey, days } });

export const verifyMembershipPayment = async (response) =>
  call("post", "/payment/membership/verify", {
    data: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    },
  });

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminFetchPlans = async () => (await adminCall("get", "/membership-plans")).data;

export const adminSavePlan = async (key, plan) => (await adminCall("put", `/membership-plans/${key}`, { data: plan })).data;

/** { courses: [...], practiceSets: [...] } with each item's minPlan. */
export const adminFetchPlanContent = async () => (await adminCall("get", "/membership-content")).data;

/** items: [{ itemType, itemId }]; minPlan: "premium" | "pro" | null. */
export const adminSavePlanContent = async (items, minPlan) =>
  adminCall("put", "/membership-content", { data: { items, minPlan } });

export const adminFetchMembers = async (params) => adminCall("get", "/memberships", { params });

export const adminExtendMembership = async (id, days) =>
  (await adminCall("put", `/memberships/${id}/extend`, { data: { days } })).data;

export const adminRevokeMembership = async (id) => adminCall("delete", `/memberships/${id}`);

export const adminFetchMembershipStats = async () => (await adminCall("get", "/membership-stats")).data;
