import { useEffect } from "react";

export default function useInterval(callback, delay) {
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}
