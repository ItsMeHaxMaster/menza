'use client';

import { useEffect, useRef } from 'react';

/**
 * Global type definitions for Cloudflare Turnstile
 * Extends the Window object to include the Turnstile API
 */
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: { sitekey: string }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Turnstile Component
 * Integrates Cloudflare Turnstile CAPTCHA widget into the application.
 * Automatically renders the widget when the Turnstile script is loaded
 * and handles cleanup on component unmount.
 */
export default function Turnstile({ siteKey }: { siteKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  /**
   * Renders the Turnstile widget when the script is loaded
   * and removes it on component unmount to prevent memory leaks
   */
  useEffect(() => {
    if (window.turnstile && containerRef.current && !widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey
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
