import { useEffect, useState } from "react";
import * as Network from "expo-network";

export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!cancelled) {
          setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
        }
      } catch {
        if (!cancelled) setIsOnline(true); // assume online if check fails
      }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { isOnline };
}
