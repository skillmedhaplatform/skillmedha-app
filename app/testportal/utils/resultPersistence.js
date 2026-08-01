const RESULT_STORAGE_KEY_PREFIX = "portal_test_result_";

function getResultStorageKey(testId) {
  return `${RESULT_STORAGE_KEY_PREFIX}${testId}`;
}

function persistPortalResult(payload) {
  const testId = payload?.testId || payload?.payload?.testId;

  if (!testId) return null;

  const entry = {
    ...payload,
    persistedAt: new Date().toISOString(),
  };

  try {
    const storage =
      typeof window !== "undefined"
        ? window.sessionStorage
        : globalThis.sessionStorage;

    if (storage) {
      storage.setItem(getResultStorageKey(testId), JSON.stringify(entry));
    }
  } catch (error) {
    console.error("Unable to persist test result", error);
  }

  return entry;
}

function getPersistedPortalResult(testId) {
  if (!testId) return null;

  try {
    const storage =
      typeof window !== "undefined"
        ? window.sessionStorage
        : globalThis.sessionStorage;

    if (!storage) return null;

    const rawValue = storage.getItem(getResultStorageKey(testId));
    if (!rawValue) return null;

    return JSON.parse(rawValue);
  } catch (error) {
    console.error("Unable to read persisted test result", error);
    return null;
  }
}

function clearPersistedPortalResult(testId) {
  if (!testId) return;

  try {
    const storage =
      typeof window !== "undefined"
        ? window.sessionStorage
        : globalThis.sessionStorage;

    if (storage) {
      storage.removeItem(getResultStorageKey(testId));
    }
  } catch (error) {
    console.error("Unable to clear persisted test result", error);
  }
}

function getNumericValue(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function deriveResultSummary({ response = {}, questions = [], scoreData = {} } = {}) {
  const questionList = Array.isArray(questions) ? questions : [];
  const summary = {
    finalScore: getNumericValue(scoreData?.finalScore, 0),
    correctQues: getNumericValue(scoreData?.correctQues, 0),
    incorrectQues: getNumericValue(scoreData?.incorrectQues, 0),
    unattemptedQues: Math.max(0, getNumericValue(scoreData?.unattemptedQues, 0)),
    totalTimeTaken: getNumericValue(scoreData?.totalTimeTaken, 0),
    averageTimeTaken: getNumericValue(scoreData?.averageTimeTaken, 0),
    notAnswered: getNumericValue(scoreData?.notAnswered, 0),
  };

  let derivedScore = 0;
  let derivedCorrect = 0;
  let derivedIncorrect = 0;
  let derivedNotAnswered = 0;
  let derivedUnattempted = 0;

  questionList.forEach((question) => {
    const responseEntry = response?.[question?._id];
    if (!responseEntry) {
      derivedUnattempted += 1;
      return;
    }

    const status = String(responseEntry?.status || "").toLowerCase();

    if (status === "correct") {
      derivedCorrect += 1;
      // Multiple-choice questions carry a separate bonusScore (full-marks
      // bonus for selecting every correct option) that isn't folded into
      // correctScore — drop it here and the recomputed total undercounts
      // every multi-select question, even though the per-question display
      // and the server-side scoreData.finalScore both include it correctly.
      derivedScore +=
        getNumericValue(responseEntry?.correctScore, 0) +
        getNumericValue(responseEntry?.bonusScore, 0);
    } else if (status === "incorrect") {
      derivedIncorrect += 1;
      derivedScore += getNumericValue(responseEntry?.negativeScore, 0);
    } else {
      derivedNotAnswered += 1;
    }
  });

  if (questionList.length > 0) {
    summary.correctQues = derivedCorrect || summary.correctQues;
    summary.incorrectQues = derivedIncorrect || summary.incorrectQues;
    summary.notAnswered = derivedNotAnswered || summary.notAnswered;
    summary.unattemptedQues = Math.max(0, derivedUnattempted || summary.unattemptedQues);
    summary.finalScore = derivedScore || summary.finalScore;
  }

  if (summary.finalScore < 0) {
    summary.finalScore = 0;
  }

  return summary;
}

export {
  RESULT_STORAGE_KEY_PREFIX,
  getResultStorageKey,
  persistPortalResult,
  getPersistedPortalResult,
  clearPersistedPortalResult,
  deriveResultSummary,
};
