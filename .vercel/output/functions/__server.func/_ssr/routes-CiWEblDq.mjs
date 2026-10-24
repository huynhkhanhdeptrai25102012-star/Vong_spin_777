import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CiWEblDq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STUDENTS = [
	"Ngọc",
	"Đạt",
	"Minh Quân",
	"Hải",
	"Mạnh",
	"Nguyễn Nhi",
	"Đông Quân",
	"Phát",
	"Thư",
	"Bích",
	"An",
	"Hoàng",
	"Kim Khánh",
	"Hân",
	"Dương",
	"Kim Chi",
	"Bằng",
	"Tài"
];
var STORAGE_KEY = "may-chon-777-v1";
var FACE = 120;
function shuffle(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[next[i], next[j]] = [next[j], next[i]];
	}
	return next;
}
function pickDistinct(pool, count) {
	return shuffle(pool).slice(0, Math.min(count, pool.length));
}
function buildStrip(pool, finalName, length) {
	const src = pool.length > 0 ? pool : [finalName];
	const strip = [];
	for (let i = 0; i < length - 1; i++) strip.push(src[Math.floor(Math.random() * src.length)]);
	strip.push(finalName);
	return strip;
}
function wait(ms) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms);
	});
}
function Reel({ label, register }) {
	const innerRef = (0, import_react.useRef)(null);
	const [faces, setFaces] = (0, import_react.useState)(["—"]);
	const [blur, setBlur] = (0, import_react.useState)(false);
	const [job, setJob] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		register({ spinTo: (pool, name, ms) => new Promise((resolve) => {
			const strip = buildStrip(pool, name, 32);
			setBlur(true);
			setFaces(strip);
			setJob({
				id: Date.now() + Math.random(),
				ms,
				len: strip.length,
				resolve
			});
		}) });
	}, [register]);
	(0, import_react.useEffect)(() => {
		if (!job || !innerRef.current) return;
		const el = innerRef.current;
		const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 180 : job.ms;
		el.style.transition = "none";
		el.style.transform = "translateY(0)";
		el.offsetHeight;
		el.style.transition = `transform ${ms}ms cubic-bezier(0.12, 0.74, 0.16, 1)`;
		el.style.transform = `translateY(-${(job.len - 1) * FACE}px)`;
		const timer = window.setTimeout(() => {
			setBlur(false);
			job.resolve();
		}, ms + 40);
		return () => window.clearTimeout(timer);
	}, [job]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-1 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "reel-window relative overflow-hidden rounded-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: innerRef,
				className: `reel-strip ${blur ? "is-blur" : ""}`,
				children: faces.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "reel-face",
					children: name
				}, `${job?.id ?? "s"}-${index}`))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brass/70" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-center text-xs tracking-[0.18em] text-brass uppercase",
			children: label
		})]
	});
}
function SlotMachine() {
	const [gone, setGone] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [trio, setTrio] = (0, import_react.useState)([]);
	const [winner, setWinner] = (0, import_react.useState)(null);
	const [called, setCalled] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const audioRef = (0, import_react.useRef)(null);
	const reelApis = (0, import_react.useRef)([
		null,
		null,
		null
	]);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed.gone)) setGone(parsed.gone.filter((n) => STUDENTS.includes(n)));
				if (Array.isArray(parsed.called)) setCalled(parsed.called);
			}
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			gone,
			called
		}));
	}, [
		gone,
		called,
		ready
	]);
	const remaining = STUDENTS.filter((name) => !gone.includes(name));
	const reg0 = (0, import_react.useCallback)((api) => {
		reelApis.current[0] = api;
	}, []);
	const reg1 = (0, import_react.useCallback)((api) => {
		reelApis.current[1] = api;
	}, []);
	const reg2 = (0, import_react.useCallback)((api) => {
		reelApis.current[2] = api;
	}, []);
	function startSound() {
		const audio = audioRef.current;
		if (!audio) return;
		audio.loop = true;
		audio.currentTime = 0;
		audio.play().catch(() => void 0);
	}
	function stopSound() {
		const audio = audioRef.current;
		if (!audio) return;
		audio.loop = false;
		audio.pause();
		audio.currentTime = 0;
	}
	async function spinAll(pool, finals, times) {
		const apis = reelApis.current;
		await Promise.all(finals.map((name, index) => apis[index].spinTo(pool, name, times[index])));
	}
	async function pull() {
		if (busy || remaining.length === 0) return;
		setBusy(true);
		setWinner(null);
		startSound();
		const drawn = pickDistinct([...remaining], 3);
		while (drawn.length < 3) drawn.push(drawn[drawn.length - 1] ?? remaining[0]);
		const finals = drawn;
		setTrio(finals);
		setPhase("trio");
		await spinAll([...remaining], finals, [
			1700,
			2200,
			2750
		]);
		await wait(1300);
		const chosen = finals[Math.floor(Math.random() * 3)];
		setPhase("decide");
		await spinAll(finals, [
			chosen,
			chosen,
			chosen
		], [
			1400,
			1850,
			2400
		]);
		stopSound();
		setWinner(chosen);
		setPhase("done");
		setGone((prev) => prev.includes(chosen) ? prev : [...prev, chosen]);
		setCalled((prev) => [...prev, chosen]);
		setBusy(false);
	}
	function dismiss() {
		setWinner(null);
		setTrio([]);
		setPhase("idle");
	}
	function resetAll() {
		if (busy) return;
		setGone([]);
		setCalled([]);
		setWinner(null);
		setTrio([]);
		setPhase("idle");
		localStorage.removeItem(STORAGE_KEY);
	}
	const status = phase === "trio" ? "Ba tên vừa dừng. Máy đang chọn một người." : phase === "decide" ? "Đang chốt một tên." : phase === "done" ? "Đã chốt. Cả ba cửa sổ là người được gọi." : remaining.length === 0 ? "Đã gọi hết lớp." : "Gạt cần để quay ba tên, rồi máy tự chọn một người.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "stage flex min-h-screen flex-col items-center px-4 py-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				ref: audioRef,
				src: "/spin.mp3",
				preload: "auto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-8 max-w-xl text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.42em] text-brass uppercase",
						children: "Buổi thuyết trình"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-5xl font-semibold tracking-tight text-cream sm:text-6xl",
						children: "777"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Máy chọn người lên trả lời"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "cabinet relative w-full max-w-xl rounded-3xl border border-brass/40 p-4 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 rounded-xl border border-brass/50 bg-wood/80 px-4 py-3 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg tracking-[0.28em] text-brass",
							children: "LUCKY DRAW"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-stretch gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid min-w-0 flex-1 grid-cols-3 gap-2 sm:gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reel, {
									label: "Một",
									register: reg0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reel, {
									label: "Hai",
									register: reg1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reel, {
									label: "Ba",
									register: reg2
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-label": "Gạt cần",
							disabled: busy || remaining.length === 0,
							onClick: () => void pull(),
							className: "hidden w-14 shrink-0 flex-col items-center justify-end pb-8 disabled:opacity-40 sm:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-16 w-2 rounded-full bg-gradient-to-b from-cream-dim to-brass-deep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lever-knob -mt-1 size-11 rounded-full" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy || remaining.length === 0,
						onClick: () => void pull(),
						className: "mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-brass text-base font-semibold tracking-[0.2em] text-ink uppercase disabled:opacity-40",
						children: busy ? "Đang quay" : remaining.length === 0 ? "Hết người" : "Gạt cần"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 min-h-10 text-center text-sm text-cream-dim",
						children: status
					}),
					trio.length > 0 && phase !== "idle" && !winner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap justify-center gap-2",
						children: trio.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full border border-brass/40 px-3 py-1 text-sm text-cream",
							children: name
						}, `${name}-${index}`))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-8 flex w-full max-w-xl items-center justify-between text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Còn ",
					remaining.length,
					" người"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: resetAll,
					className: "underline decoration-brass/50 underline-offset-4",
					children: "Đặt lại"
				})]
			}),
			called.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 max-w-xl text-center text-xs tracking-wide text-muted",
				children: ["Đã gọi: ", called.join(" · ")]
			}),
			winner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-20 flex items-end justify-center bg-ink/70 p-4 sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "announce w-full max-w-md rounded-2xl px-6 py-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.32em] text-burgundy uppercase",
							children: "Mời lên trả lời"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-5xl leading-none font-semibold",
							children: winner
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-sm text-ink/70",
							children: [
								"Được chọn từ ",
								Array.from(new Set(trio)).join(", "),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: dismiss,
							className: "mt-6 h-12 w-full rounded-xl bg-ink text-sm font-semibold tracking-[0.16em] text-cream uppercase",
							children: "Đóng bảng"
						})
					]
				})
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotMachine, {});
}
//#endregion
export { Home as component };
