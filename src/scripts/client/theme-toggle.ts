export function initThemeToggle(): void {
  if (localStorage.theme === "dark") {
    document.querySelector("html")?.classList.add("dark");
  }

  const switchThemeButton = document.getElementById("switchTheme");
  if (!switchThemeButton) {
    return;
  }

  switchThemeButton.addEventListener("click", () => {
    const htmlClasses = document.querySelector("html")?.classList;

    if (localStorage.theme === "dark") {
      htmlClasses?.remove("dark");
      localStorage.theme = "light";
      return;
    }

    htmlClasses?.add("dark");
    localStorage.theme = "dark";
  });
}
