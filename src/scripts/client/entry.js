const MEASUREMENT_ID = "G-3TJPB46KB1";

function initAnalytics() {
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

function initThemeToggle() {
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

function initSmoothScroll() {
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

			target.scrollIntoView({ behavior: "smooth" });
		});
	});

	document.querySelectorAll('a[href^="#top"]').forEach((anchor) => {
		anchor.addEventListener("click", (event) => {
			event.preventDefault();
			window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
		});
	});
}

initAnalytics();
initThemeToggle();
initSmoothScroll();
