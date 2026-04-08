const MEASUREMENT_ID = "G-3TJPB46KB1";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export function initAnalytics(): void {
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(analyticsScript);

  window.dataLayer = window.dataLayer || [];

  const gtag = (...args: unknown[]) => {
    window.dataLayer.push(args);
  };

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID);
}
