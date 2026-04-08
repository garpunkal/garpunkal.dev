const MEASUREMENT_ID = "G-3TJPB46KB1";

export function initAnalytics() {
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(analyticsScript);

  window.dataLayer = window.dataLayer || [];

  const gtag = (...args) => {
    window.dataLayer.push(args);
  };

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID);
}

initAnalytics();
