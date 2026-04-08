export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#projects"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();

      const clickedAnchor = event.currentTarget;
      const href = clickedAnchor?.getAttribute("href");
      if (!href) {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  document.querySelectorAll('a[href^="#top"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  });
}

initSmoothScroll();
