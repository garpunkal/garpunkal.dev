
import { initVectorCanvas } from "./vector-canvas.ts";

const MEASUREMENT_ID = "G-3TJPB46KB1";
let analyticsLoaded = false;

function initAnalytics() {
	if (analyticsLoaded) return;
	analyticsLoaded = true;

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

	document.addEventListener("click", (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const switchThemeButton = target.closest("#switchTheme, [data-switch-theme]");
		if (!switchThemeButton) return;

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

function deferAnalytics() {
	const events = ["pointerdown", "keydown", "scroll", "touchstart"];
	const onFirstInteraction = () => {
		for (const evt of events) {
			window.removeEventListener(evt, onFirstInteraction);
		}
		initAnalytics();
	};
	for (const evt of events) {
		window.addEventListener(evt, onFirstInteraction, { once: true, passive: true });
	}
}

function initProjectDrips() {
	const DRIP_COUNT = 40;
	const BASE_DRIP_CLASS =
		"h-full scale-x-150 scale-y-0 transition-[scale] ease-[cubic-bezier(0.65,0,0.35,1)] duration-[var(--dur,300ms)] delay-[var(--del,0ms)]";

	function hydrateDrips(container) {
		if (container.dataset.hydrated) return;
		container.dataset.hydrated = "true";

		const colorClass = container.dataset.dripColor || "bg-ocean dark:bg-mirage";
		const frag = document.createDocumentFragment();
		const elements = [];

		for (let i = 0; i < DRIP_COUNT; i++) {
			const delay = (Math.random() * 150).toFixed(1);
			const duration = (200 + Math.random() * 120).toFixed(1);
			const grow = (0.4 + Math.random() * 1.8).toFixed(2);
			const originClass = Math.random() < 0.5 ? "origin-bottom" : "origin-top";

			const div = document.createElement("div");
			div.className = `${BASE_DRIP_CLASS} ${originClass} ${colorClass}`;
			div.style.cssText = `flex-grow:${grow};flex-basis:0%;--dur:${duration}ms;--del:${delay}ms;`;
			frag.appendChild(div);
			elements.push(div);
		}

		container.appendChild(frag);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				for (let i = 0; i < elements.length; i++) {
					elements[i].classList.add("group-hover:scale-y-100");
				}
			});
		});
	}

	document.addEventListener(
		"pointerenter",
		(e) => {
			if (!(e.target instanceof Element)) return;
			const group = e.target.closest(".group");
			if (!group) return;
			const container = group.querySelector("[data-drip-container]");
			if (container && !container.dataset.hydrated) {
				hydrateDrips(container);
			}
		},
		true
	);
}

function initExperienceTimelines() {
	const timelines = document.querySelectorAll("[data-experience-timeline]");
	const MARKER_CENTER_OFFSET = 30.4;

	const positionRail = (timeline) => {
		const rail = timeline.querySelector("[data-experience-rail]");
		const entries = timeline.querySelectorAll(":scope > li");

		if (!rail || entries.length === 0) return;

		const firstEntry = entries[0];
		const lastEntry = entries[entries.length - 1];

		const top = firstEntry.offsetTop + MARKER_CENTER_OFFSET;
		const bottom = lastEntry.offsetTop + MARKER_CENTER_OFFSET;

		rail.style.bottom = "auto";
		rail.style.top = `${top}px`;
		rail.style.height = `${Math.max(0, bottom - top)}px`;
	};

	for (const timeline of timelines) {
		let rafId = 0;
		const update = () => {
			if (rafId) return;
			rafId = requestAnimationFrame(() => {
				rafId = 0;
				positionRail(timeline);
			});
		};
		new ResizeObserver(update).observe(timeline);
	}
}

function initSkillMarquees() {
	function measureLabel(label) {
		if (label.hasAttribute("data-overflows")) {
			label.removeAttribute("data-overflows");
			label.style.removeProperty("--marquee-dist");
			label.style.removeProperty("--marquee-dur");
		}

		const overflow = label.scrollWidth - label.clientWidth;
		if (overflow > 2) {
			const scrollDist = overflow + 6;
			label.dataset.overflows = "true";
			label.style.setProperty("--marquee-dist", `-${Math.ceil(scrollDist)}px`);
			const dur = Math.max(1.8, Math.min(5, scrollDist / 38 + 0.8));
			label.style.setProperty("--marquee-dur", `${dur.toFixed(2)}s`);
		}
		label.dataset.measured = "true";
	}

	function updateSkillMarquees() {
		const allLabels = Array.from(document.querySelectorAll("[data-skill-label]"));
		const labels = allLabels.filter((label) => !label.closest(".group:hover"));
		if (labels.length === 0) return;

		for (let i = 0; i < labels.length; i++) {
			const label = labels[i];
			if (label.hasAttribute("data-overflows")) {
				label.removeAttribute("data-overflows");
				label.style.removeProperty("--marquee-dist");
				label.style.removeProperty("--marquee-dur");
			}
		}

		const overflows = new Array(labels.length);
		for (let i = 0; i < labels.length; i++) {
			const label = labels[i];
			overflows[i] = label.scrollWidth - label.clientWidth;
		}

		for (let i = 0; i < labels.length; i++) {
			const label = labels[i];
			const overflow = overflows[i];
			if (overflow > 2) {
				const scrollDist = overflow + 6;
				const dur = Math.max(1.8, Math.min(5, scrollDist / 38 + 0.8));
				label.dataset.overflows = "true";
				label.style.setProperty("--marquee-dist", `-${Math.ceil(scrollDist)}px`);
				label.style.setProperty("--marquee-dur", `${dur.toFixed(2)}s`);
			}
			label.dataset.measured = "true";
		}
	}

	let rafId = 0;
	const scheduleUpdate = () => {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			updateSkillMarquees();
		});
	};

	if (document.fonts?.ready) {
		document.fonts.ready.then(scheduleUpdate);
	} else if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", scheduleUpdate);
	} else {
		scheduleUpdate();
	}

	let resizeTimer;
	window.addEventListener(
		"resize",
		() => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(scheduleUpdate, 150);
		},
		{ passive: true }
	);

	document.addEventListener(
		"pointerenter",
		(e) => {
			if (!(e.target instanceof Element)) return;
			const group = e.target.closest(".group");
			if (!group) return;
			const label = group.querySelector("[data-skill-label]");
			if (label && !label.dataset.measured) {
				measureLabel(label);
			}
		},
		true
	);
}

deferAnalytics();
initThemeToggle();
initSmoothScroll();
initProjectDrips();
initExperienceTimelines();
initSkillMarquees();
initVectorCanvas();
