import { useCallback, useEffect, useRef, useState } from "react";

const STUDENTS = [
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
  "Tài",
] as const;

const STORAGE_KEY = "may-chon-777-v1";
const FACE = 120;
const SPIN_MS = 5750;

type Phase = "idle" | "trio" | "decide" | "done";

function shuffle<T>(list: readonly T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function pickDistinct(pool: string[], count: number): string[] {
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

function buildStrip(pool: string[], finalName: string, length: number): string[] {
  const src = pool.length > 0 ? pool : [finalName];
  const strip: string[] = [];
  for (let i = 0; i < length - 1; i++) {
    strip.push(src[Math.floor(Math.random() * src.length)]!);
  }
  strip.push(finalName);
  return strip;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type SpinJob = {
  id: number;
  ms: number;
  len: number;
  resolve: () => void;
};

function Reel({
  label,
  register,
}: {
  label: string;
  register: (api: { spinTo: (pool: string[], name: string, ms: number) => Promise<void> }) => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [faces, setFaces] = useState<string[]>(["—"]);
  const [blur, setBlur] = useState(false);
  const [job, setJob] = useState<SpinJob | null>(null);

  useEffect(() => {
    register({
      spinTo: (pool, name, ms) =>
        new Promise<void>((resolve) => {
          const strip = buildStrip(pool, name, 48);
          setBlur(true);
          setFaces(strip);
          setJob({ id: Date.now() + Math.random(), ms, len: strip.length, resolve });
        }),
    });
  }, [register]);

  useEffect(() => {
    if (!job || !innerRef.current) return;
    const el = innerRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? 180 : job.ms;
    el.style.transition = "none";
    el.style.transform = "translateY(0)";
    void el.offsetHeight;
    el.style.transition = `transform ${ms}ms cubic-bezier(0.12, 0.74, 0.16, 1)`;
    el.style.transform = `translateY(-${(job.len - 1) * FACE}px)`;
    const timer = window.setTimeout(() => {
      setBlur(false);
      job.resolve();
    }, ms + 40);
    return () => window.clearTimeout(timer);
  }, [job]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="reel-window relative overflow-hidden rounded-md">
        <div
          ref={innerRef}
          className={`reel-strip ${blur ? "is-blur" : ""}`}
        >
          {faces.map((name, index) => (
            <div className="reel-face" key={`${job?.id ?? "s"}-${index}`}>
              {name}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brass/70" />
      </div>
      <p className="text-center text-xs tracking-[0.18em] text-brass uppercase">{label}</p>
    </div>
  );
}

export function SlotMachine() {
  const [gone, setGone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [trio, setTrio] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [called, setCalled] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winRef = useRef<HTMLAudioElement | null>(null);
  const reelApis = useRef<
    Array<{ spinTo: (pool: string[], name: string, ms: number) => Promise<void> } | null>
  >([null, null, null]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { gone?: string[]; called?: string[] };
        if (Array.isArray(parsed.gone)) {
          setGone(parsed.gone.filter((n) => (STUDENTS as readonly string[]).includes(n)));
        }
        if (Array.isArray(parsed.called)) setCalled(parsed.called);
      }
    } catch {
      /* ignore broken storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ gone, called }));
  }, [gone, called, ready]);

  const remaining = STUDENTS.filter((name) => !gone.includes(name));

  const reg0 = useCallback((api: { spinTo: (pool: string[], name: string, ms: number) => Promise<void> }) => {
    reelApis.current[0] = api;
  }, []);
  const reg1 = useCallback((api: { spinTo: (pool: string[], name: string, ms: number) => Promise<void> }) => {
    reelApis.current[1] = api;
  }, []);
  const reg2 = useCallback((api: { spinTo: (pool: string[], name: string, ms: number) => Promise<void> }) => {
    reelApis.current[2] = api;
  }, []);

  function playSpin() {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve();
    audio.loop = false;
    audio.currentTime = 0;
    return new Promise<void>((resolve) => {
      const finish = () => {
        audio.removeEventListener("ended", finish);
        resolve();
      };
      audio.addEventListener("ended", finish);
      void audio.play().catch(() => finish());
    });
  }

  function playWin() {
    const audio = winRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }

  async function spinAll(pool: string[], finals: [string, string, string], times: [number, number, number]) {
    const apis = reelApis.current;
    await Promise.all(
      finals.map((name, index) => apis[index]!.spinTo(pool, name, times[index])),
    );
  }

  async function pull() {
    if (busy || remaining.length === 0) return;
    setBusy(true);
    setWinner(null);

    const drawn = pickDistinct([...remaining], 3);
    while (drawn.length < 3) drawn.push(drawn[drawn.length - 1] ?? remaining[0]!);
    const finals = drawn as [string, string, string];
    setTrio(finals);
    setPhase("trio");

    await Promise.all([
      spinAll([...remaining], finals, [4300, 5050, SPIN_MS]),
      playSpin(),
    ]);
    await wait(700);

    const chosen = finals[Math.floor(Math.random() * 3)]!;
    setPhase("decide");
    await Promise.all([
      spinAll(finals, [chosen, chosen, chosen], [4300, 5050, SPIN_MS]),
      playSpin(),
    ]);

    playWin();
    setWinner(chosen);
    setPhase("done");
    setGone((prev) => (prev.includes(chosen) ? prev : [...prev, chosen]));
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

  const status =
    phase === "trio"
      ? "Ba tên vừa dừng. Máy đang chọn một người."
      : phase === "decide"
        ? "Đang chốt một tên."
        : phase === "done"
          ? "Đã chốt. Cả ba cửa sổ là người được gọi."
          : remaining.length === 0
            ? "Đã gọi hết lớp."
            : "Gạt cần để quay ba tên, rồi máy tự chọn một người.";

  return (
    <main className="stage flex min-h-screen flex-col items-center px-4 py-8 sm:py-12">
      <audio ref={audioRef} src="/spin.mp3" preload="auto" />
      <audio ref={winRef} src="/win.mp3" preload="auto" />

      <header className="mb-6 flex max-w-xl flex-col items-center text-center">
        <img src="/nhom2.jpg" alt="Nhóm 2" className="mb-3 h-20 w-auto rounded-md object-contain" />
        <p className="text-xs tracking-[0.42em] text-brass uppercase">Buổi thuyết trình</p>
        <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight text-cream sm:text-6xl">
          777
        </h1>
        <p className="mt-2 text-sm text-muted">Máy chọn người lên trả lời</p>
      </header>

      <section className="cabinet relative w-full max-w-xl rounded-[1.75rem] border-2 border-brass p-3 sm:p-5">
        <div className="marquee mb-4 rounded-xl border border-brass/70 px-4 py-3 text-center">
          <p className="font-display text-lg tracking-[0.28em] text-brass">LUCKY DRAW</p>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="reel-bay grid min-w-0 flex-1 grid-cols-3 gap-2 rounded-xl p-2 sm:gap-3 sm:p-3">
            <Reel label="Một" register={reg0} />
            <Reel label="Hai" register={reg1} />
            <Reel label="Ba" register={reg2} />
          </div>

          <button
            type="button"
            aria-label="Gạt cần"
            disabled={busy || remaining.length === 0}
            onClick={() => void pull()}
            className="hidden w-14 shrink-0 flex-col items-center justify-end pb-8 disabled:opacity-40 sm:flex"
          >
            <span className="h-16 w-2 rounded-full bg-gradient-to-b from-cream-dim to-brass-deep" />
            <span className="lever-knob -mt-1 size-11 rounded-full" />
          </button>
        </div>

        <button
          type="button"
          disabled={busy || remaining.length === 0}
          onClick={() => void pull()}
          className="mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-brass text-base font-semibold tracking-[0.2em] text-ink uppercase disabled:opacity-40"
        >
          {busy ? "Đang quay" : remaining.length === 0 ? "Hết người" : "Gạt cần"}
        </button>

        <p className="mt-4 min-h-10 text-center text-sm text-cream-dim">{status}</p>

        {trio.length > 0 && phase !== "idle" && !winner && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {trio.map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="rounded-full border border-brass/40 px-3 py-1 text-sm text-cream"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-8 flex w-full max-w-xl items-center justify-between text-sm text-muted">
        <p>Còn {remaining.length} người</p>
        <button type="button" onClick={resetAll} className="underline decoration-brass/50 underline-offset-4">
          Đặt lại
        </button>
      </footer>

      {called.length > 0 && (
        <p className="mt-3 max-w-xl text-center text-xs tracking-wide text-muted">
          Đã gọi: {called.join(" · ")}
        </p>
      )}

      {winner && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/70 p-4 pb-20 sm:items-center">
          <div className="announce w-full max-w-md rounded-2xl px-6 py-8 text-center">
            <p className="text-xs tracking-[0.32em] text-burgundy uppercase">Mời lên trả lời</p>
            <p className="mt-3 font-display text-5xl leading-none font-semibold">{winner}</p>
            <p className="mt-4 text-sm text-ink/70">
              Được chọn từ {Array.from(new Set(trio)).join(", ")}.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-6 h-12 w-full rounded-xl bg-ink text-sm font-semibold tracking-[0.16em] text-cream uppercase"
            >
              Đóng bảng
            </button>
          </div>
        </div>
      )}

      <aside className="credit">
        <span>Made by</span>
        <img src="/khanh.png" alt="" />
        <span className="font-semibold">Khánh</span>
      </aside>
    </main>
  );
}
