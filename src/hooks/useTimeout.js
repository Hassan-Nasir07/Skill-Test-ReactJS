import { useEffect } from "react";

export default function useTimeout(callback, delay) {
  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(callback, delay);
    return () => clearTimeout(id);
  }, [callback, delay]);
}
