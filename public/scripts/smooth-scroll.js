document.querySelectorAll('a[href^="#projects"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    if (href) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  });
});

document.querySelectorAll('a[href^="#top"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });
});
