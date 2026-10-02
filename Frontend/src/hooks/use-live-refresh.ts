import { useEffect } from "react";
import { AppState } from "react-native";

// Refresh mounted screens only while the app is active. Cancel work on unmount.
export function useLiveRefresh(
  refresh: (signal: AbortSignal) => Promise<void>,
  immediate = false,
  refreshKey = 0,
) {
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;

    const run = async () => {
      if (controller.signal.aborted || pending ||
          AppState.currentState === "background" || AppState.currentState === "inactive") return;

      pending = true;
      try {
        await refresh(controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Error refreshing university data:", error);
      } finally {
        pending = false;
      }
    };

    if (immediate) void Promise.resolve().then(run);
    const interval = setInterval(run, 15_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void run();
    });

    return () => {
      controller.abort();
      clearInterval(interval);
      subscription.remove();
    };
  }, [refresh, immediate, refreshKey]);
}
