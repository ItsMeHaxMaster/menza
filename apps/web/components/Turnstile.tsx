'use client';

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: { sitekey: string }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export default function Turnstile({ siteKey }: { siteKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (window.turnstile && containerRef.current && !widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
      });
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return <div ref={containerRef} className="turnstile" />;
}