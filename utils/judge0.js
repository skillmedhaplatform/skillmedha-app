import axios from "axios";

const apis = {
  mi: "0384295621msheb61f4751e1b41ap10acc0jsn96fa40b5dc6d",
};

const BASE_URL = "https://compiler.skillmedha.com";

const encode = (str) => {
  if (!str) return "";
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch {
    return btoa(unescape(encodeURIComponent(str)));
  }
};

const decode = (str) => {
  if (!str) return "";
  try {
    return decodeURIComponent(
      atob(str).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch {
    try { return atob(str); } catch { return str; }
  }
};

export const postSubmission = async (language_id, source_code, stdin) => {
  const res = await axios.request({
    method: "POST",
    url: `${BASE_URL}/submissions/`,
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": "e05dac791e06052efacb1f9132323070",
      "X-RapidAPI-Key": apis.mi,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    data: { language_id, source_code: encode(source_code), stdin: encode(stdin) },
  });
  return res.data.token;
};

export const pollResult = async (token) => {
  const opts = {
    method: "GET",
    url: `${BASE_URL}/submissions/${token}`,
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "X-Auth-Token": "e05dac791e06052efacb1f9132323070",
      "X-RapidAPI-Key": apis.mi,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
  };
  for (let i = 0; i < 15; i++) {
    const res = await axios.request(opts);
    const sid = res.data?.status?.id ?? res.data?.status_id;
    if (sid > 2) return res.data;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { status: { id: -1, description: "Timed out" }, stdout: "", stderr: "Execution timed out.", compile_output: "" };
};

// Returns { output, statusId, statusName, success, time, memory }
export const executeCode = async (language_id, code, stdin) => {
  const token = await postSubmission(language_id, code, stdin);
  if (!token) throw new Error("No submission token returned");
  const res = await pollResult(token);
  const statusId = res?.status?.id ?? res?.status_id;
  const statusName = res?.status?.description || "Unknown";
  const stdout = decode(res.stdout || "");
  const compileOut = decode(res.compile_output || "");
  const stderr = decode(res.stderr || "");
  const time = res.time || "0";
  const memory = res.memory || 0;

  let output = "";
  if (statusId === 3) output = stdout || "(no output)";
  else if (statusId === 6) output = compileOut || "Compilation error";
  else if (statusId === 5) output = "Time Limit Exceeded";
  else output = stderr || compileOut || stdout || "Unknown error";
  return { output, statusId, statusName, success: statusId === 3, time, memory, expectedOutput: stdout };
};
