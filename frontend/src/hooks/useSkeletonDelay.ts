import { useEffect, useState } from "react";

export default function useSkeletonDelay(delayMs = 380): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return loading;
}
