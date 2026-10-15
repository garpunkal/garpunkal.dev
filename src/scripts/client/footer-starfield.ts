// Matrix code rain — subtle overlay for the footer.
// Multi-directional streams (down / right / left) with subtle colors.
// Canvas is transparent each frame so the site background shows through.

// Multi-char tokens for vertical streams (down)
const TOKENS: string[] = [
	// C# keywords & constructs
	"var", "int", "bool", "void", "null", "new", "get", "set",
	"async", "await", "class", "enum", "if", "else", "for", "in",
	"return", "using", "base", "this", "true", "false", "out",
	// C# operators
	"=>", "??=", "??", "?.", "::", "&&", "||", "!=", "==",
	// TypeScript keywords
	"type", "interface", "const", "let", "fn", "ts", "as",
	"string", "number", "never", "any", "export", "import",
	// TypeScript operators
	"|", "&", "<T>", "!!", ">=", "<=", "++", "--",
	// HTML tags / attributes
	"<div", "</div>", "<span", "<a", "<h1", "<p", "/>",
	"class=", "href=", "id=", "aria-", "data-",
	// CSS rules / values
	"display:", "flex", "grid", "rem", "px", "var(--", "@media",
	"#root", ".class", ":root", "100%", "0px", "1fr",
	// Generic symbols
	"{", "}", "[", "]", "(", ")", ";", ":", ".", "//", "/*", "*/",
	"@", "#", "=", "+", "-", "*", "/", "!", "~", "^", "_",
];

// Single chars for horizontal streams (rendered rotated 90°)
const SINGLE_CHARS = "{}[]()<>/\\|;:.?!@#$=+-~`0123456789abcdefghijklmnopqrstuvwxyz";

const FONT_SIZE    = 13;  // render size (px)
const COLUMN_WIDTH = 24;  // horizontal grid spacing for vertical streams
const ROW_HEIGHT   = FONT_SIZE + 2; // vertical grid spacing for horizontal streams
const FONT_FAMILY  = "monospace";

// Colour palette (subtle overlay on footer background)
const HEAD_ALPHA   = 0.35;
const TRAIL_ALPHA  = 0.12;
const HEAD_COLOUR  = "220,240,250"; // soft white/cyan
const MID_COLOUR   = "130,195,225"; // soft muted cyan
const TAIL_COLOUR  = "80,150,185";  // deep muted blue-teal

type Direction = "down" | "right" | "left";

interface Stream {
	direction: Direction;
	lane: number;
	head: number;
	speed: number;
	progress: number;
	length: number;
	chars: string[];
	resetAt: number;
}

export function initFooterStarfield(): void {
	const rawCanvas = document.getElementById("footerParticles");
	if (!(rawCanvas instanceof HTMLCanvasElement)) return;
	const canvas: HTMLCanvasElement = rawCanvas;

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const rawCtx = canvas.getContext("2d");
	if (!rawCtx) return;
	const ctx: CanvasRenderingContext2D = rawCtx;

	const rawWrapper = canvas.parentElement;
	if (!rawWrapper) return;
	const wrapper: HTMLElement = rawWrapper;

	let streams: Stream[] = [];
	let rafId: number;
	let w = 0;
	let h = 0;
	let colCount = 0;
	let rowCount = 0;

	function randomToken(direction: Direction): string {
		if (direction === "down") {
			return TOKENS[Math.floor(Math.random() * TOKENS.length)];
		}
		return SINGLE_CHARS[Math.floor(Math.random() * SINGLE_CHARS.length)];
	}

	function streamDepth(direction: Direction): number {
		return direction === "down" ? rowCount : colCount;
	}

	function makeStream(direction: Direction, lane: number, stagger = true): Stream {
		const depth  = streamDepth(direction);
		const length = 4 + Math.floor(Math.random() * 18);
		const staggerOffset = stagger ? -Math.floor(Math.random() * depth * 2) : 0;
		return {
			direction,
			lane,
			head:     staggerOffset,
			speed:    0.07 + Math.random() * 0.18,
			progress: 0,
			length,
			chars:    Array.from({ length }, () => randomToken(direction)),
			resetAt:  depth + length + Math.floor(Math.random() * 8),
		};
	}

	function resize(): void {
		const rect = wrapper.getBoundingClientRect();
		w = rect.width;
		h = rect.height;
		canvas.width  = w * devicePixelRatio;
		canvas.height = h * devicePixelRatio;
		canvas.style.width  = `${w}px`;
		canvas.style.height = `${h}px`;
		ctx.scale(devicePixelRatio, devicePixelRatio);

		colCount = Math.floor(w / COLUMN_WIDTH);
		rowCount = Math.floor(h / ROW_HEIGHT);

		streams = [];

		// Vertical lanes (down only) — ~60% density
		for (let i = 0; i < colCount; i++) {
			if (Math.random() < 0.60) {
				streams.push(makeStream("down", i));
			}
		}

		// Horizontal lanes (right / left) — ~65% density
		for (let i = 0; i < rowCount; i++) {
			if (Math.random() < 0.65) {
				const dir = Math.random() < 0.50 ? "right" : "left";
				streams.push(makeStream(dir, i));
			}
		}
	}

	function drawChar(
		token: string,
		direction: Direction,
		lane: number,
		pos: number,
		alpha: number,
		colour: string,
	): void {
		ctx.globalAlpha = alpha;
		ctx.fillStyle   = `rgb(${colour})`;

		let px: number;
		let py: number;
		let angle = 0;

		switch (direction) {
			case "down":
				px    = lane * COLUMN_WIDTH + 2;
				py    = pos  * ROW_HEIGHT;
				angle = 0;
				break;
			case "right":
				px    = pos  * COLUMN_WIDTH;
				py    = lane * ROW_HEIGHT;
				angle = Math.PI / 2;
				break;
			case "left":
				px    = (colCount - pos) * COLUMN_WIDTH;
				py    = lane * ROW_HEIGHT;
				angle = -Math.PI / 2;
				break;
		}

		if (angle !== 0) {
			ctx.save();
			ctx.translate(px, py);
			ctx.rotate(angle);
			ctx.fillText(token, 0, 0);
			ctx.restore();
		} else {
			ctx.fillText(token, px, py);
		}
	}

	function draw(): void {
		ctx.clearRect(0, 0, w, h);
		ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`;
		ctx.textAlign = "left";

		for (const s of streams) {
			const headPos = Math.floor(s.head);

			for (let i = 0; i < s.length; i++) {
				const pos = headPos - i;
				if (pos < 0 || pos > streamDepth(s.direction)) continue;

				if (Math.random() < 0.025) {
					s.chars[i] = randomToken(s.direction);
				}

				const trailRatio = 1 - i / s.length;

				let colour: string;
				let alpha: number;

				if (i === 0) {
					colour = HEAD_COLOUR;
					alpha  = HEAD_ALPHA;
				} else if (i < 3) {
					colour = MID_COLOUR;
					alpha  = TRAIL_ALPHA * trailRatio * 1.4;
				} else {
					colour = TAIL_COLOUR;
					alpha  = TRAIL_ALPHA * trailRatio * 0.7;
				}

				drawChar(s.chars[i], s.direction, s.lane, pos, alpha, colour);
			}
		}

		ctx.globalAlpha = 1;
	}

	function update(): void {
		for (const s of streams) {
			s.progress += s.speed;
			if (s.progress >= 1) {
				s.head     += Math.floor(s.progress);
				s.progress %= 1;
			}

			if (s.head > s.resetAt) {
				Object.assign(s, makeStream(s.direction, s.lane, false));
			}
		}
	}

	function loop(): void {
		update();
		draw();
		rafId = requestAnimationFrame(loop);
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					rafId = requestAnimationFrame(loop);
				} else {
					cancelAnimationFrame(rafId);
				}
			}
		},
		{ threshold: 0 }
	);

	const ro = new ResizeObserver(() => { resize(); });

	resize();
	observer.observe(wrapper);
	ro.observe(wrapper);
}
