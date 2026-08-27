import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_TRACKER, URL_UPDATE_DELAY } from "../constants/tracker";
import { decodeTrackerHash, encodeTrackerState } from "../utils/trackerCodec";

function readInitialTracker() {
  try {
    return { tracker: decodeTrackerHash(window.location.hash) ?? { ...EMPTY_TRACKER }, error: "" };
  } catch (error) {
    return { tracker: { ...EMPTY_TRACKER }, error: error.message };
  }
}

function isEmptyTracker(tracker) {
  return tracker.monthlyIncome === null && tracker.targetSavings === null && tracker.expenses.length === 0;
}

export function useUrlTrackerState() {
  const [initial] = useState(readInitialTracker);
  const [tracker, setTrackerState] = useState(initial.tracker);
  const [decodeError, setDecodeError] = useState(initial.error);
  const timerRef = useRef();

  const writeUrl = useCallback((nextTracker) => {
    const hash = encodeTrackerState(nextTracker);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${hash}`);
    return window.location.href;
  }, []);

  useEffect(() => {
    if (decodeError) return undefined;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (isEmptyTracker(tracker)) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      } else {
        writeUrl(tracker);
      }
    }, URL_UPDATE_DELAY);
    return () => window.clearTimeout(timerRef.current);
  }, [tracker, decodeError, writeUrl]);

  useEffect(() => {
    const handleHashChange = () => {
      try {
        const decoded = decodeTrackerHash(window.location.hash);
        if (decoded) setTrackerState(decoded);
        setDecodeError("");
      } catch (error) {
        setDecodeError(error.message);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const setTracker = useCallback((update) => {
    setDecodeError("");
    setTrackerState(update);
  }, []);

  const resetTracker = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setDecodeError("");
    setTrackerState({ ...EMPTY_TRACKER });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  return { tracker, setTracker, decodeError, resetTracker, writeUrl };
}
