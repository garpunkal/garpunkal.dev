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

function initSkillCloudShuffle() {
	const skillCloud = document.getElementById("skillCloud");
	if (!skillCloud) {
		return;
	}

	// re-shuffle on every load so the cloud layout isn't static per build
	const items = Array.from(skillCloud.children);
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}

	items.forEach((item) => skillCloud.appendChild(item));
}

initAnalytics();
initThemeToggle();
initSmoothScroll();
initSkillCloudShuffle();
