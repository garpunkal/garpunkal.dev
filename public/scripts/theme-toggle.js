if (localStorage.theme === "dark") {
  document.querySelector("html")?.classList.add("dark");
}

const element = document.getElementById("switchTheme");
if (element) {
  element.addEventListener("click", () => {
    const htmlClasses = document.querySelector("html")?.classList;
    if (localStorage.theme === "dark") {
      htmlClasses?.remove("dark");
      localStorage.theme = "light";
    } else {
      htmlClasses?.add("dark");
      localStorage.theme = "dark";
    }
  });
}
