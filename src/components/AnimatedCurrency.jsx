import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../utils/currency";

export function AnimatedCurrency({ value }) {
  const target = Number.isFinite(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      displayRef.current = target;
      setDisplayValue(target);
      return undefined;
    }

    const startValue = displayRef.current;
    const difference = target - startValue;
    if (difference === 0) return undefined;

    const startTime = performance.now();
    const duration = 650;
    let frameId;
    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + difference * eased);
      displayRef.current = nextValue;
      setDisplayValue(nextValue);
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return (
    <>
      <span aria-hidden="true">{formatCurrency(displayValue)}</span>
      <span className="sr-only">{formatCurrency(target)}</span>
    </>
  );
}
