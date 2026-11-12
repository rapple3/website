"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// LANE CLOSED: a small canvas game in the spirit of mid-2000s Flash games.
// You ride up the street. The bike lane keeps getting blocked. Swerve.
// ---------------------------------------------------------------------------

const W = 360;
const H = 560;
const LANE_W = W / 3;
const LANES = [LANE_W / 2, LANE_W * 1.5, LANE_W * 2.5]; // traffic, bike lane, sidewalk
const BIKE_LANE = 1;
const PLAYER_Y = H - 120;
const BLOCK = 200; // pixels of road per "block" of score
// Set to the site's display font once the page loads, so it looks the same on every device
let FONT = "'Arial Black', 'Helvetica Neue', sans-serif";
const INK = "#14213D";
const GOLD = "#C8A02B";

type Ctx = CanvasRenderingContext2D;
type Kind = {
  w: number;
  h: number;
  epitaph: string;
  draw: (c: Ctx, t: number, seed: number) => void; // drawn centered on 0,0
  soft?: boolean; // doesn't end the run (potholes)
};
type Obstacle = {
  lane: number;
  y: number;
  kind: Kind;
  seed: number;
  rowOpen: number; // the lane this obstacle's row left open
  x?: number; // set when it isn't centered in its lane
  door?: number; // for parked cars that door you: 0 = shut, 1 = wide open
  hit?: boolean; // potholes only catch you once
};
// A car coming up from behind in the traffic lane: it honks first, then passes.
// A "hook" also turns right across the bike lane just after it gets ahead of you.
type Passer = {
  phase: "warn" | "go" | "turn";
  timer: number;
  x: number;
  y: number;
  seed: number;
  hook: boolean;
  turn: number; // road distance since the turn began
  corner: number; // for hooks: where along the road the cross street is
  drift: number; // for hooks: sideways movement per pixel of road while turning
};
// A cross street. Right hooks only happen here.
type Intersection = { at: number; decided: boolean; hook: boolean; fired: boolean };
// A stretch of road with different rules, in distance travelled
type Zone = { type: "protected" | "nolane"; a: number; b: number };

// --- drawing helpers -------------------------------------------------------

function box(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, lw = 3) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (lw) {
    c.lineWidth = lw;
    c.strokeStyle = "#111";
    c.stroke();
  }
}

function dot(c: Ctx, x: number, y: number, r: number, fill: string, lw = 2.5) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  if (lw) {
    c.lineWidth = lw;
    c.strokeStyle = "#111";
    c.stroke();
  }
}

function text(c: Ctx, s: string, x: number, y: number, size: number, fill: string, align: CanvasTextAlign = "center") {
  c.font = `800 ${size}px ${FONT}`;
  c.textAlign = align;
  c.textBaseline = "middle";
  c.fillStyle = fill;
  c.fillText(s, x, y);
}

function wrapped(c: Ctx, s: string, x: number, y: number, maxW: number, size: number, fill: string) {
  c.font = `800 ${size}px ${FONT}`;
  const lines: string[] = [];
  let line = "";
  for (const word of s.split(" ")) {
    const next = line ? line + " " + word : word;
    if (c.measureText(next).width > maxW && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  lines.push(line);
  lines.forEach((l, i) => text(c, l, x, y + i * size * 1.25, size, fill));
  return lines.length * size * 1.25;
}

const blink = (t: number) => Math.floor(t * 2.5) % 2 === 0;

function car(c: Ctx, w: number, h: number, color: string, t: number, hazards: boolean) {
  box(c, -w / 2, -h / 2, w, h, 12, color);
  box(c, -w / 2 + 7, -h / 2 + 16, w - 14, 18, 5, "#BFE3F5", 2); // windshield
  box(c, -w / 2 + 9, h / 2 - 26, w - 18, 12, 4, "#BFE3F5", 2); // rear window
  if (hazards) {
    const on = blink(t) ? "#FF9D00" : "#7A4B00";
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) dot(c, sx * (w / 2 - 7), sy * (h / 2 - 6), 4.5, on, 1.5);
  }
}

function person(c: Ctx, x: number, y: number, shirt: string, hair: string) {
  c.beginPath();
  c.ellipse(x, y, 13, 8, 0, 0, Math.PI * 2);
  c.fillStyle = shirt;
  c.fill();
  c.lineWidth = 2.5;
  c.strokeStyle = "#111";
  c.stroke();
  dot(c, x, y, 6, hair, 2);
}

const CAR_COLORS = ["#D1495B", "#3A7CA5", "#6B8F71", "#8E6C8A", "#E0E0E0", "#2B2B2B"];

// --- things that are in your way -------------------------------------------

const VAN: Kind = {
  w: 72, h: 108,
  epitaph: "Flattened by a delivery van that was \"only stopping for a minute.\"",
  draw: (c, t) => {
    car(c, 72, 108, "#FFFFFF", t, true);
    box(c, -36, -4, 72, 22, 0, "#7A4A21", 2);
    text(c, "DELIVERY", 0, 8, 13, "#FFD23F");
  },
};
const HAZARD_CAR: Kind = {
  w: 62, h: 92,
  epitaph: "Parked in the bike lane, but the hazard lights were on, so it's fine.",
  draw: (c, t, seed) => car(c, 62, 92, CAR_COLORS[seed % CAR_COLORS.length], t, true),
};
const COP: Kind = {
  w: 62, h: 94,
  epitaph: "A police car, parked in the bike lane. Who do you even call?",
  draw: (c, t) => {
    car(c, 62, 94, "#1B1B1B", t, false);
    box(c, -31, -14, 62, 30, 0, "#FFFFFF", 2);
    box(c, -22, -5, 22, 10, 3, blink(t) ? "#FF3B3B" : "#7A1010", 2);
    box(c, 0, -5, 22, 10, 3, blink(t) ? "#12306B" : "#3B7BFF", 2);
  },
};
const BINS: Kind = {
  w: 70, h: 40,
  epitaph: "Defeated by trash day.",
  draw: (c) => {
    box(c, -34, -18, 30, 36, 5, "#2E7D4F");
    box(c, -34, -18, 30, 9, 3, "#1F5A38", 2);
    box(c, 4, -18, 30, 36, 5, "#2F6FB0");
    box(c, 4, -18, 30, 9, 3, "#1F4D7D", 2);
  },
};
const SIGN: Kind = {
  w: 96, h: 50,
  epitaph: "Hit the \"BIKE LANE CLOSED\" sign. No detour was provided.",
  draw: (c) => {
    box(c, -48, -25, 96, 50, 6, "#FF8A00");
    text(c, "BIKE LANE", 0, -9, 17, "#111");
    text(c, "CLOSED", 0, 11, 17, "#111");
    for (const x of [-40, 40]) dot(c, x, 0, 3, "#111", 0);
  },
};
const SCOOTERS: Kind = {
  w: 84, h: 44,
  epitaph: "Wiped out on a pile of abandoned rental scooters.",
  draw: (c) => {
    const parts: [number, number, number, string][] = [[-22, -4, 0.5, "#B6F23A"], [6, 6, -0.35, "#111"], [24, -8, 1.2, "#B6F23A"]];
    for (const [x, y, rot, col] of parts) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      box(c, -19, -4, 38, 8, 4, col, 2);
      box(c, 13, -10, 5, 20, 2, "#555", 2);
      c.restore();
    }
  },
};
const TRAFFIC_CAR: Kind = {
  w: 62, h: 92,
  epitaph: "You left the bike lane. A driver did not notice. Or care.",
  draw: (c, t, seed) => {
    car(c, 62, 92, CAR_COLORS[seed % CAR_COLORS.length], t, false);
    for (const sx of [-1, 1]) box(c, sx * 19 - 6, 40, 12, 5, 2, "#FF3B3B", 1.5); // brake lights
  },
};
const BUS: Kind = {
  w: 74, h: 150,
  epitaph: "Hit by the bus you could have been riding.",
  draw: (c) => {
    box(c, -37, -75, 74, 150, 10, "#F2F2F2");
    box(c, -37, -20, 74, 14, 0, "#FF7A00", 2);
    box(c, -37, -6, 74, 8, 0, "#1E66B0", 2);
    box(c, -29, -66, 58, 20, 5, "#BFE3F5", 2);
    text(c, "BUS", 0, 30, 24, INK);
  },
};
const PEDS: Kind = {
  w: 60, h: 30,
  epitaph: "You hit a pedestrian. You are now the villain in someone else's rant.",
  draw: (c, _t, seed) => {
    person(c, -15, 0, ["#D1495B", "#3A7CA5"][seed % 2], "#4A2F1B");
    person(c, 15, 3, ["#F2C14E", "#6B8F71"][seed % 2], "#1B1B1B");
  },
};
const DOG_WALKER: Kind = {
  w: 72, h: 34,
  epitaph: "Tangled in a dog leash. The dog is fine. The dog is thrilled.",
  draw: (c) => {
    c.beginPath();
    c.moveTo(-14, 0);
    c.lineTo(20, 4);
    c.lineWidth = 2;
    c.strokeStyle = "#111";
    c.stroke();
    person(c, -18, 0, "#8E6C8A", "#C9A227");
    c.beginPath();
    c.ellipse(22, 4, 11, 6, 0, 0, Math.PI * 2);
    c.fillStyle = "#A9744F";
    c.fill();
    c.lineWidth = 2.5;
    c.stroke();
    dot(c, 32, 4, 4.5, "#A9744F", 2);
  },
};
const CAFE_SIGN: Kind = {
  w: 60, h: 44,
  epitaph: "Taken out by a sandwich board advertising a $9 latte.",
  draw: (c) => {
    box(c, -28, -21, 56, 42, 4, "#2B2B2B");
    text(c, "LATTE", 0, -7, 14, "#FFF");
    text(c, "$9", 0, 10, 16, "#FFD23F");
  },
};

// Cars that come up from behind in the traffic lane
const PASSER_W = 64;
const PASSER_H = 100;
const PASSER_WARNING = 1.4; // seconds of honking before it arrives
const PASSER_SPEED = 400; // how fast it gains on you, in pixels per second
const PASSER_EPITAPHS = [
  "Hit from behind in the car lane. The driver says you \"came out of nowhere.\"",
  "Rear-ended by a pickup truck. The driver was mid-text.",
  "Run down from behind. The driver honked, which legally counts as a warning.",
];
function drawPasser(c: Ctx, seed: number) {
  const truck = seed % 3 === 0;
  car(c, PASSER_W, PASSER_H, truck ? "#1B1B1B" : CAR_COLORS[seed % CAR_COLORS.length], 0, false);
  if (truck) box(c, -PASSER_W / 2 + 6, 4, PASSER_W - 12, PASSER_H / 2 - 12, 4, "#3A3A3A", 2); // truck bed
  for (const sx of [-1, 1]) box(c, sx * 20 - 6, -PASSER_H / 2 - 1, 12, 6, 2, "#FFF6B0", 1.5); // headlights
}

const HOOK_EPITAPH = "Right-hooked. The driver did signal, about four feet before turning.";
// A hooking car turns right at a cross street. It's timed to reach the corner
// when the corner is about this far ahead of you, and its sideways speed is set
// so that it's squarely across the bike lane as it reaches you while leaving
// the car lane and the sidewalk clear, at any speed.
const HOOK_AHEAD = 170;
const HOOK_REACH = 130; // how far sideways it has moved by the time it reaches you
const CROSS_HALF = 62; // half the width of a cross street

const POTHOLE: Kind = {
  w: 44, h: 28, epitaph: "", soft: true,
  draw: (c) => {
    c.beginPath();
    c.ellipse(0, 0, 22, 13, 0.15, 0, Math.PI * 2);
    c.fillStyle = "#23252B";
    c.fill();
    c.lineWidth = 2.5;
    c.strokeStyle = "#111";
    c.stroke();
    c.beginPath();
    c.ellipse(-3, -2, 12, 6, 0.15, 0, Math.PI * 2);
    c.fillStyle = "#0E0F12";
    c.fill();
    c.beginPath();
    c.moveTo(20, -5);
    c.lineTo(31, -11);
    c.moveTo(-21, 5);
    c.lineTo(-32, 10);
    c.lineWidth = 2;
    c.stroke();
  },
};

// A car parked half on the curb. Its door swings open across the bike lane.
const DOOR_CAR_X = 268;
const DOOR_LEN = 60;
const DOOR_OPENS_AT = 300; // pixels ahead of you
const DOOR_CAR: Kind = {
  w: 62, h: 92,
  epitaph: "Doored. The driver checked their phone, but not their mirror.",
  draw: (c, t, seed) => {
    car(c, 62, 92, CAR_COLORS[seed % 4], t, false);
    for (const sx of [-1, 1]) box(c, sx * 19 - 6, 40, 12, 5, 2, "#FF3B3B", 1.5); // brake lights: someone's in there
    dot(c, -11, -2, 7, "#E8C39E", 2); // the driver
  },
};

// With no bike lane, the middle lane is just more traffic
const NO_LANE_KINDS: Kind[] = [TRAFFIC_CAR, TRAFFIC_CAR, TRAFFIC_CAR, BUS, HAZARD_CAR];

const BY_LANE: Kind[][] = [
  [TRAFFIC_CAR, TRAFFIC_CAR, TRAFFIC_CAR, BUS],
  [VAN, VAN, HAZARD_CAR, HAZARD_CAR, COP, BINS, SIGN, SCOOTERS],
  [PEDS, PEDS, DOG_WALKER, CAFE_SIGN, BINS],
];

// --- the game --------------------------------------------------------------

type Mode = "loading" | "title" | "play" | "over";
type Score = { name: string; score: number };

function loadInitials() {
  try {
    return localStorage.getItem("lane-closed-initials") || "";
  } catch {
    return "";
  }
}

export default function BikeLaneGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  // Leaderboard. `board` stays null (and hidden) unless the site has a
  // score database connected.
  const [board, setBoard] = useState<Score[] | null>(null);
  const [lastRun, setLastRun] = useState<number | null>(null); // blocks from the run that just ended
  const [initials, setInitials] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent">("idle");
  const [submitError, setSubmitError] = useState("");
  const runEvents = useRef({ over: (_blocks: number) => {}, start: () => {} });
  runEvents.current = {
    over: (blocks) => {
      setLastRun(blocks);
      setSubmitState("idle");
      setSubmitError("");
    },
    start: () => setLastRun(null),
  };

  useEffect(() => {
    setInitials(loadInitials());
    fetch("/api/scores")
      .then((r) => r.json())
      .then((d) => d.enabled && setBoard(d.scores))
      .catch(() => {});
  }, []);

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lastRun === null || submitState !== "idle") return;
    setSubmitState("sending");
    setSubmitError("");
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: initials, score: lastRun }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the score.");
      setBoard(data.scores);
      setSubmitState("sent");
      try {
        localStorage.setItem("lane-closed-initials", initials);
      } catch {}
    } catch (err: any) {
      setSubmitError(err.message || "Could not save the score.");
      setSubmitState("idle");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const c = canvas.getContext("2d")!;
    const siteFont = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim();
    if (siteFont) FONT = `${siteFont}, ${FONT}`;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    let best = 0;
    try {
      best = Number(localStorage.getItem("lane-closed-best")) || 0;
    } catch {}

    const g = {
      mode: "loading" as Mode,
      t: 0, // seconds since the page loaded
      modeAt: 0, // when the current mode started
      lane: BIKE_LANE,
      x: LANES[BIKE_LANE],
      dist: 0,
      inLane: 0, // seconds spent in the bike lane
      runTime: 0,
      speed: 0,
      obstacles: [] as Obstacle[],
      nextRow: 0,
      openLane: BIKE_LANE,
      epitaph: "",
      newBest: false,
      shake: 0,
      passer: null as Passer | null,
      nextPasser: 0, // seconds until the next car may come from behind
      wobble: 0, // seconds of locked steering after a pothole
      bonus: 0, // extra distance earned in protected lanes
      zone: null as Zone | null,
      nextZone: 0, // seconds until the next special stretch
      lastZone: "nolane" as Zone["type"],
      inters: [] as Intersection[],
      hookSoon: false, // a car is about to hook at the next corner: keep the car lane clear
      force: "", // testing only: set window.__laneClosedForce to make one feature show up right away
    };

    const blocksNow = () => Math.floor((g.dist + g.bonus) / BLOCK);
    const zoneHere = () => (g.zone && g.dist >= g.zone.a && g.dist <= g.zone.b ? g.zone.type : null);

    // Tiny synth for bleeps, so there are no sound files to load
    let audio: AudioContext | null = null;
    const beep = (freq: number, dur: number, type: OscillatorType = "square", slideTo?: number) => {
      if (mutedRef.current) return;
      try {
        audio = audio || new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = audio.createOscillator();
        const v = audio.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, audio.currentTime);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, audio.currentTime + dur);
        v.gain.setValueAtTime(0.06, audio.currentTime);
        v.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
        o.connect(v).connect(audio.destination);
        o.start();
        o.stop(audio.currentTime + dur);
      } catch {}
    };

    const start = () => {
      Object.assign(g, {
        mode: "play", modeAt: g.t, lane: BIKE_LANE, x: LANES[BIKE_LANE], dist: 0, inLane: 0,
        runTime: 0, speed: 230, obstacles: [], nextRow: 500, openLane: BIKE_LANE, newBest: false, shake: 0,
        passer: null, nextPasser: 7, wobble: 0, bonus: 0, zone: null, nextZone: 14, lastZone: "nolane",
        inters: [{ at: 1500, decided: false, hook: false, fired: false }], hookSoon: false,
        force: String((window as any).__laneClosedForce || ""),
      });
      if (g.force === "protected" || g.force === "nolane") {
        g.nextZone = 0.5;
        g.lastZone = g.force === "protected" ? "nolane" : "protected";
      }
      if (g.force === "hook") {
        // testing: an empty road with a hooking car at an early first corner
        g.inters[0].at = 900;
        g.nextRow = 1e9;
        g.nextPasser = 1e9;
      }
      runEvents.current.start();
      beep(520, 0.08);
      setTimeout(() => beep(780, 0.12), 90);
    };

    const steer = (dir: -1 | 1) => {
      if (g.wobble > 0) return; // still recovering from a pothole
      const lane = Math.max(0, Math.min(2, g.lane + dir));
      if (lane !== g.lane) {
        g.lane = lane;
        beep(dir < 0 ? 330 : 392, 0.05);
      }
    };

    const crash = (epitaph: string) => {
      g.mode = "over";
      g.modeAt = g.t;
      g.epitaph = epitaph;
      g.shake = 0.35;
      const blocks = blocksNow();
      if (blocks > best) {
        best = blocks;
        g.newBest = true;
        try {
          localStorage.setItem("lane-closed-best", String(best));
        } catch {}
      }
      runEvents.current.over(blocks);
      beep(300, 0.5, "sawtooth", 40);
    };

    // Spawn a row of obstacles. There is always a way through: each row leaves
    // one lane open, and it's never more than one lane over from the last gap.
    // The bike lane is the open one as rarely as possible, obviously.
    const spawnRow = () => {
      // While a car is coming from behind, the traffic lane is never the only
      // way through, and nothing new gets parked in its path
      const carComing = g.passer !== null || g.hookSoon;
      const spawnAt = g.dist + PLAYER_Y + 10; // how far along the road this row sits
      const zone = g.zone && spawnAt + 170 >= g.zone.a && spawnAt - 40 <= g.zone.b ? g.zone.type : null;
      const seed = () => Math.floor(Math.random() * 1000);
      const add = (lane: number, kind: Kind, rowOpen: number, extra: Partial<Obstacle> = {}) =>
        g.obstacles.push({ lane, y: -kind.h / 2 - 10, kind, seed: seed(), rowOpen, ...extra });

      // Dooring: a car parked half on the curb blocks the sidewalk, and its door
      // will swing across the bike lane, so the only way past is out in traffic
      if (!carComing && zone !== "protected" && g.openLane <= 1 && (g.force === "door" || (g.runTime > 8 && Math.random() < 0.13))) {
        add(2, DOOR_CAR, 0, { x: DOOR_CAR_X, door: 0 });
        g.openLane = 0;
        return DOOR_CAR.h;
      }

      let open: number;
      if (zone === "protected") {
        open = BIKE_LANE; // nothing gets into a protected lane
      } else {
        const options = [g.openLane - 1, g.openLane, g.openLane + 1].filter((l) => l >= (carComing ? 1 : 0) && l <= 2);
        open = options[Math.floor(Math.random() * options.length)];
        if (open === BIKE_LANE && Math.random() < 0.6) {
          const others = options.filter((l) => l !== BIKE_LANE);
          if (others.length) open = others[Math.floor(Math.random() * others.length)];
        }
      }
      let tallest = 0;
      for (let lane = 0; lane < 3; lane++) {
        if (lane === open) continue;
        const blocked = !(carComing && lane === 0) && Math.random() <= (lane === BIKE_LANE ? 0.92 : 0.5);
        if (blocked) {
          const kinds = lane === BIKE_LANE && zone === "nolane" ? NO_LANE_KINDS : BY_LANE[lane];
          const kind = kinds[Math.floor(Math.random() * kinds.length)];
          add(lane, kind, open);
          tallest = Math.max(tallest, kind.h);
        } else if (lane !== 2 && (g.force === "pothole" || (g.runTime > 5 && Math.random() < 0.2))) {
          // A pothole in a lane that looks like a free alternative. Never in the
          // one lane you're forced to use.
          add(lane, POTHOLE, open);
        }
      }
      g.openLane = open;
      return tallest;
    };

    const seed1000 = () => Math.floor(Math.random() * 1000);
    const endPasser = () => {
      g.passer = null;
      g.nextPasser = Math.max(2.5, 7 - g.runTime * 0.06) + Math.random() * 4;
    };

    const update = (dt: number) => {
      g.t += dt;
      if (g.shake > 0) g.shake -= dt;
      if (g.mode === "loading" && g.t > 1.3) {
        g.mode = "title";
        g.modeAt = g.t;
      }
      if (g.mode !== "play") return;

      g.runTime += dt;
      g.speed = Math.min(540, 230 + g.runTime * 7);
      const step = g.speed * dt;
      g.dist += step;
      if (g.wobble > 0) g.wobble -= dt;
      const here = zoneHere();
      if (g.lane === BIKE_LANE && here !== "nolane") g.inLane += dt;
      if (g.lane === BIKE_LANE && here === "protected") g.bonus += step; // protected lanes count double
      g.x += (LANES[g.lane] - g.x) * Math.min(1, dt * 18);

      // Special stretches: a protected lane, or the bike lane ending for a while.
      // Each starts just beyond the top of the screen and scrolls into view.
      if (!g.zone) {
        g.nextZone -= dt;
        if (g.nextZone <= 0 && !g.passer) {
          const type: Zone["type"] = g.lastZone === "protected" ? "nolane" : "protected";
          const a = g.dist + PLAYER_Y + 180;
          g.zone = { type, a, b: a + g.speed * (type === "protected" ? 6 : 7) };
          g.lastZone = type;
        }
      } else if (g.dist > g.zone.b + 160) {
        g.zone = null;
        g.nextZone = 12 + Math.random() * 8;
      }

      g.nextRow -= step;
      // No new rows while a car is about to turn across the road
      if (g.nextRow <= 0 && !(g.passer && g.passer.hook)) {
        const spawnAt = g.dist + PLAYER_Y + 10;
        if (g.inters.some((i) => spawnAt + 160 >= i.at - CROSS_HALF && spawnAt <= i.at + CROSS_HALF)) {
          g.nextRow = 12; // nothing gets parked in the middle of an intersection; try again just past it
        } else {
          // Clear road after this row's longest obstacle, so there's always
          // room to change lanes before the next row arrives
          const tallest = spawnRow();
          g.nextRow = tallest + Math.max(150, 250 - g.runTime * 2.5);
        }
      }

      // Cross streets, and the cars that turn at them
      const lastInter = g.inters[g.inters.length - 1];
      if (lastInter.at < g.dist + 3000) {
        g.inters.push({ at: lastInter.at + 1500 + Math.random() * 800, decided: false, hook: false, fired: false });
      }
      g.inters = g.inters.filter((i) => i.at > g.dist - 400);
      // The warning has to start this far out for the car to meet the corner ahead of you
      const fireAhead = HOOK_AHEAD + g.speed * (PASSER_WARNING + (H + PASSER_H - (PLAYER_Y - HOOK_AHEAD)) / PASSER_SPEED);
      g.hookSoon = false;
      for (const i of g.inters) {
        const ahead = i.at - g.dist;
        if (!i.decided && ahead < g.speed * 7) {
          i.decided = true;
          i.hook = g.force === "hook" || (g.runTime > 5 && Math.random() < 0.45);
        }
        if (!i.hook || i.fired) continue;
        if (ahead <= fireAhead + g.speed * 2) g.hookSoon = true;
        if (ahead <= fireAhead) {
          i.fired = true;
          const upcoming = g.obstacles.filter((o) => !o.kind.soft && o.y - o.kind.h / 2 < PLAYER_Y + 40);
          const inProtected = g.zone && g.zone.type === "protected" && i.at >= g.zone.a - 150 && i.at <= g.zone.b + 150;
          if (!g.passer && !inProtected && g.openLane !== 0 && !upcoming.some((o) => o.lane === 0 || o.rowOpen === 0)) {
            g.passer = { phase: "warn", timer: PASSER_WARNING, x: LANES[0], y: H + PASSER_H, seed: seed1000(), hook: true, turn: 0, corner: i.at, drift: 0 };
            beep(233, 0.16);
            setTimeout(() => beep(233, 0.3), 220);
          }
        }
      }

      for (const o of g.obstacles) {
        o.y += step;
        if (o.door !== undefined && o.y > PLAYER_Y - DOOR_OPENS_AT && o.door < 1) {
          if (o.door === 0) beep(900, 0.04);
          o.door = Math.min(1, o.door + dt / 0.12);
        }
      }
      g.obstacles = g.obstacles.filter((o) => o.y - o.kind.h / 2 < H + 20);

      // Cars from behind. One only sets off when the traffic lane ahead is
      // empty and no upcoming row forces you into it, so it's always avoidable.
      const p = g.passer;
      if (!p) {
        g.nextPasser -= dt;
        if (g.nextPasser <= 0) {
          const ahead = g.obstacles.filter((o) => !o.kind.soft && o.y - o.kind.h / 2 < PLAYER_Y + 40);
          // Also wait if a car is due to turn at an upcoming corner
          if (ahead.some((o) => o.lane === 0 || o.rowOpen === 0) || g.openLane === 0 || g.inters.some((i) => i.hook && !i.fired)) {
            g.nextPasser = 0.4; // not safe yet; check again shortly
          } else {
            g.passer = { phase: "warn", timer: PASSER_WARNING, x: LANES[0], y: H + PASSER_H, seed: seed1000(), hook: false, turn: 0, corner: 0, drift: 0 };
            beep(233, 0.16);
            setTimeout(() => beep(233, 0.3), 220);
          }
        }
      } else if (p.phase === "warn") {
        p.timer -= dt;
        if (p.timer <= 0) p.phase = "go";
      } else if (p.phase === "go") {
        p.y -= PASSER_SPEED * dt;
        // A hook turns into the cross street when it reaches the corner
        if (p.hook && p.y <= PLAYER_Y - (p.corner - g.dist)) {
          p.phase = "turn";
          p.drift = HOOK_REACH / Math.max(120, PLAYER_Y - p.y);
          beep(700, 0.06);
        }
        if (p.y < -PASSER_H) endPasser();
      } else {
        p.turn += step; // road distance since it began turning
        p.x += p.drift * step;
        p.y += step; // it's leaving the road, so it drifts back toward you
        if (p.x > W + PASSER_H || p.y > H + PASSER_H) endPasser();
      }

      // Collisions, with slightly forgiving hitboxes
      for (const o of g.obstacles) {
        const dx = Math.abs((o.x ?? LANES[o.lane]) - g.x);
        const dy = Math.abs(o.y - PLAYER_Y);
        const touching = dx < o.kind.w / 2 + 13 - 8 && dy < o.kind.h / 2 + 26 - 8;
        if (o.kind.soft) {
          if (touching && !o.hit) {
            o.hit = true;
            g.wobble = 0.7;
            g.shake = 0.12;
            beep(120, 0.22, "sawtooth", 55);
          }
          continue;
        }
        if (touching) {
          crash(o.kind.epitaph);
          return;
        }
        if (o.door !== undefined && o.door > 0.6) {
          const doorX = (o.x ?? LANES[o.lane]) - o.kind.w / 2 - DOOR_LEN / 2;
          if (Math.abs(doorX - g.x) < DOOR_LEN / 2 + 13 - 8 && Math.abs(o.y - 14 - PLAYER_Y) < 6 + 26 - 8) {
            crash(o.kind.epitaph);
            return;
          }
        }
      }
      const pc = g.passer;
      if (pc && pc.phase !== "warn") {
        const sideways = pc.phase === "turn" && pc.turn > 30;
        const halfW = (sideways ? PASSER_H : PASSER_W) / 2;
        const halfH = (sideways ? PASSER_W : PASSER_H) / 2;
        if (Math.abs(pc.x - g.x) < halfW + 13 - 8 && Math.abs(pc.y - PLAYER_Y) < halfH + 26 - 8) {
          crash(pc.phase === "turn" ? HOOK_EPITAPH : PASSER_EPITAPHS[pc.seed % PASSER_EPITAPHS.length]);
        }
      }
    };

    // --- rendering ---

    const drawStreet = () => {
      const scroll = g.dist;
      // traffic lane
      c.fillStyle = "#4A4E57";
      c.fillRect(0, 0, LANE_W, H);
      // bike lane
      c.fillStyle = "#3E9B5F";
      c.fillRect(LANE_W, 0, LANE_W, H);
      // sidewalk
      c.fillStyle = "#CFC8B8";
      c.fillRect(LANE_W * 2, 0, LANE_W, H);
      c.fillStyle = "#8D8778";
      c.fillRect(LANE_W * 2, 0, 6, H); // curb

      // sidewalk slabs
      c.strokeStyle = "rgba(0,0,0,0.18)";
      c.lineWidth = 2;
      for (let y = (scroll % 70) - 70; y < H; y += 70) {
        c.beginPath();
        c.moveTo(LANE_W * 2 + 6, y);
        c.lineTo(W, y);
        c.stroke();
      }
      // left road edge and bike lane line
      c.fillStyle = "#F4D03F";
      c.fillRect(4, 0, 4, H);
      c.fillStyle = "#FFFFFF";
      c.fillRect(LANE_W - 3, 0, 5, H);
      // bike lane markings: a bike symbol and an arrow, repeating
      for (let y = (scroll % 280) - 280; y < H + 60; y += 280) {
        c.save();
        c.translate(LANES[BIKE_LANE], y);
        c.strokeStyle = "rgba(255,255,255,0.85)";
        c.fillStyle = "rgba(255,255,255,0.85)";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(-13, 8, 9, 0, Math.PI * 2);
        c.moveTo(22, 8);
        c.arc(13, 8, 9, 0, Math.PI * 2);
        c.moveTo(-13, 8);
        c.lineTo(-4, -8);
        c.lineTo(9, -8);
        c.lineTo(13, 8);
        c.moveTo(-4, -8);
        c.lineTo(2, 8);
        c.lineTo(-13, 8);
        c.stroke();
        c.beginPath();
        c.moveTo(0, -52);
        c.lineTo(-11, -34);
        c.lineTo(-4, -34);
        c.lineTo(-4, -20);
        c.lineTo(4, -20);
        c.lineTo(4, -34);
        c.lineTo(11, -34);
        c.closePath();
        c.fill();
        c.restore();
      }
    };

    // Road markings for a protected stretch or a stretch with no bike lane
    const drawZone = () => {
      const z = g.zone;
      if (!z) return;
      const toY = (along: number) => PLAYER_Y - (along - g.dist);
      const yTop = toY(z.b);
      const yBot = toY(z.a);
      if (yBot < -40 || yTop > H + 40) return;
      const y0 = Math.max(-10, yTop);
      const y1 = Math.min(H + 10, yBot);
      const banner = (y: number, label: string, fill: string, ink: string) => {
        if (y < -20 || y > H + 20) return;
        box(c, LANES[BIKE_LANE] - 57, y - 13, 114, 26, 5, fill, 2.5);
        text(c, label, LANES[BIKE_LANE], y + 1, 11.5, ink);
      };
      if (z.type === "nolane") {
        if (y1 > y0) {
          c.fillStyle = "#4A4E57"; // the green paint just stops
          c.fillRect(LANE_W - 3, y0, LANE_W + 3, y1 - y0);
          c.fillStyle = "#FFFFFF";
          for (let along = Math.ceil(z.a / 50) * 50; along < z.b; along += 50) {
            const y = toY(along);
            if (y > -30 && y < H + 30) c.fillRect(LANE_W - 2, y - 24, 4, 24);
          }
        }
        banner(yBot, "BIKE LANE ENDS", "#FF8A00", "#111");
        banner(yTop, "BIKE LANE", "#FFFFFF", "#1F5A38");
      } else {
        for (let along = Math.ceil(z.a / 44) * 44; along < z.b; along += 44) {
          const y = toY(along);
          if (y < -10 || y > H + 10) continue;
          for (const x of [LANE_W + 8, LANE_W * 2 - 8]) {
            dot(c, x, y, 5, "#FFFFFF", 2);
            dot(c, x, y, 2, "#FF8A00", 0);
          }
        }
        banner(yBot, "PROTECTED · 2X", INK, "#FFD23F");
        banner(yTop, "PROTECTION ENDS", "#FF8A00", "#111");
      }
    };

    const drawIntersections = () => {
      for (const i of g.inters) {
        const yc = PLAYER_Y - (i.at - g.dist);
        if (yc < -CROSS_HALF - 10 || yc > H + CROSS_HALF + 10) continue;
        const top = yc - CROSS_HALF;
        c.fillStyle = "#4A4E57"; // the cross street
        c.fillRect(0, top, W, CROSS_HALF * 2);
        c.fillStyle = "#F4D03F"; // its center line
        for (let x = 6; x < W; x += 34) c.fillRect(x, yc - 2, 18, 4);
        c.fillStyle = "#3E9B5F"; // the bike lane continues across as green dashes
        for (let y = top + 6; y < top + CROSS_HALF * 2 - 10; y += 28) c.fillRect(LANE_W + 6, y, LANE_W - 12, 16);
        c.fillStyle = "#FFFFFF"; // crosswalk in line with the sidewalk
        for (let x = LANE_W * 2 + 12; x < W - 8; x += 22) c.fillRect(x, top + 6, 11, CROSS_HALF * 2 - 12);
        c.fillRect(10, top + CROSS_HALF * 2 - 7, LANE_W - 16, 6); // stop line for the car lane
      }
    };

    const drawRider = () => {
      const lean = (LANES[g.lane] - g.x) * 0.012 + (g.wobble > 0 ? Math.sin(g.t * 45) * 0.3 : 0);
      c.save();
      c.translate(g.x, PLAYER_Y);
      c.rotate(lean);
      box(c, -3, -30, 6, 20, 3, "#222", 2); // front wheel
      box(c, -3, 12, 6, 20, 3, "#222", 2); // back wheel
      box(c, -2, -14, 4, 30, 2, GOLD, 1.5); // frame
      box(c, -13, -17, 26, 5, 2, "#222", 1.5); // handlebars
      c.beginPath();
      c.ellipse(0, 3, 11, 13, 0, 0, Math.PI * 2); // body
      c.fillStyle = INK;
      c.fill();
      c.lineWidth = 2.5;
      c.strokeStyle = "#111";
      c.stroke();
      dot(c, 0, -5, 8, GOLD); // helmet
      box(c, -1.5, -12, 3, 13, 1.5, "#111", 0); // helmet vent
      c.restore();
    };

    const titleText = (y: number) => {
      c.save();
      c.translate(W / 2, y);
      c.rotate(-0.05);
      text(c, "LANE", 4, -34, 76, "#111");
      text(c, "LANE", 0, -38, 76, "#FFD23F");
      text(c, "CLOSED", 4, 38, 76, "#111");
      text(c, "CLOSED", 0, 34, 76, "#FF8A00");
      c.restore();
    };

    const panel = (y: number, h: number) => {
      box(c, 22 + 5, y + 5, W - 44, h, 14, "#111", 0);
      box(c, 22, y, W - 44, h, 14, "#F5F0E6", 4);
    };

    const render = () => {
      c.save();
      if (g.shake > 0) c.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);

      if (g.mode === "loading") {
        c.fillStyle = "#111";
        c.fillRect(0, 0, W, H);
        text(c, "LOADING...", W / 2, H / 2 - 34, 26, "#FFF");
        box(c, 60, H / 2 - 12, W - 120, 24, 4, "#111", 0);
        c.strokeStyle = "#FFF";
        c.lineWidth = 3;
        c.strokeRect(60, H / 2 - 12, W - 120, 24);
        c.fillStyle = "#FFD23F";
        c.fillRect(65, H / 2 - 7, (W - 130) * Math.min(1, g.t / 1.2), 14);
        c.restore();
        return;
      }

      drawStreet();
      drawZone();
      drawIntersections();
      for (const o of g.obstacles) {
        c.save();
        c.translate(o.x ?? LANES[o.lane], o.y);
        o.kind.draw(c, g.t, o.seed);
        if (o.door !== undefined) {
          // The door: hinged at the front, slightly ajar as a tell, then flung open
          const ajar = o.y > 30 ? 0.1 + Math.sin(g.t * 18) * 0.04 : 0;
          c.translate(-o.kind.w / 2, -14);
          c.rotate(Math.max(o.door, ajar) * (Math.PI / 2));
          box(c, -4, 0, 8, DOOR_LEN, 3, "#F2F2F2", 2.5);
        }
        c.restore();
      }
      const pd = g.passer;
      if (pd && pd.phase !== "warn") {
        c.save();
        c.translate(pd.x, pd.y);
        if (pd.phase === "turn") c.rotate(Math.min(1, pd.turn / 60) * (Math.PI / 2));
        drawPasser(c, pd.seed);
        if (pd.hook) {
          // right turn signal
          const on = Math.floor(g.t * 6) % 2 === 0 ? "#FF9D00" : "#7A4B00";
          for (const sy of [-1, 1]) dot(c, PASSER_W / 2 - 5, sy * (PASSER_H / 2 - 8), 5.5, on, 1.5);
        }
        c.restore();
        if (pd.hook && pd.phase === "go" && Math.floor(g.t * 6) % 2 === 0) {
          // an arrow showing where it's about to go
          c.beginPath();
          c.moveTo(pd.x + 44, pd.y - 16);
          c.lineTo(pd.x + 72, pd.y);
          c.lineTo(pd.x + 44, pd.y + 16);
          c.closePath();
          c.fillStyle = "#FF9D00";
          c.fill();
          c.lineWidth = 2.5;
          c.strokeStyle = "#111";
          c.stroke();
        }
      }
      if (g.mode !== "title") drawRider();
      if (g.wobble > 0 && g.mode === "play") {
        box(c, g.x - 44, PLAYER_Y - 64, 88, 22, 6, "#111", 0);
        text(c, "POTHOLE!", g.x, PLAYER_Y - 52, 14, "#FFD23F");
      }
      // Warning at the bottom of the traffic lane while a car is on its way
      if (g.passer && g.passer.phase === "warn" && g.mode === "play") {
        const on = Math.floor(g.t * 7) % 2 === 0;
        const hook = g.passer.hook;
        box(c, LANES[0] - 50, H - 64, 100, 52, 10, on ? (hook ? "#FF8A00" : "#FF3B3B") : hook ? "#8A4A00" : "#7A1010", 3);
        text(c, "HONK!", LANES[0], H - 47, 19, "#FFF");
        text(c, hook ? "TURNING RIGHT" : "CAR BEHIND", LANES[0], H - 26, 11, "#FFF");
      }

      if (g.mode === "play") {
        const blocks = blocksNow();
        box(c, 8, 8, 132, 34, 8, "#111", 0);
        text(c, `BLOCKS: ${blocks}`, 18, 26, 20, "#FFD23F", "left");
        if (g.lane === BIKE_LANE && zoneHere() === "protected") {
          box(c, 146, 10, 44, 30, 8, "#FFD23F", 2.5);
          text(c, "2X", 168, 26, 18, "#111");
        }
        box(c, W - 108, 8, 100, 34, 8, "#111", 0);
        text(c, `BEST: ${best}`, W - 18, 26, 20, "#FFF", "right");
        if (g.runTime < 3.5) {
          const a = Math.min(1, 3.5 - g.runTime);
          c.globalAlpha = a;
          box(c, 40, H - 62, W - 80, 36, 10, "#111", 0);
          text(c, "← →  or tap a side to swerve", W / 2, H - 44, 17, "#FFF");
          c.globalAlpha = 1;
        }
      }

      if (g.mode === "title") {
        c.fillStyle = "rgba(20,33,61,0.55)";
        c.fillRect(0, 0, W, H);
        titleText(170);
        text(c, "A GAME ABOUT TRYING TO USE A BIKE LANE", W / 2, 272, 15, "#FFF");
        panel(318, 118);
        text(c, "Stay in the green lane.", W / 2, 346, 19, INK);
        text(c, "(You won't be able to.)", W / 2, 372, 17, "#7A4A21");
        text(c, "← →  or tap left / right to swerve", W / 2, 402, 15, INK);
        text(c, "Watch for cars from behind.", W / 2, 422, 13, "#7A4A21");
        if (blink(g.t)) text(c, "CLICK, TAP OR PRESS SPACE TO RIDE", W / 2, 478, 18, "#FFD23F");
        if (best > 0) text(c, `YOUR BEST: ${best} BLOCKS`, W / 2, 514, 15, "#FFF");
      }

      if (g.mode === "over") {
        c.fillStyle = "rgba(20,33,61,0.6)";
        c.fillRect(0, 0, W, H);
        c.save();
        c.translate(W / 2, 96);
        c.rotate(-0.05);
        text(c, "WIPEOUT!", 4, 4, 58, "#111");
        text(c, "WIPEOUT!", 0, 0, 58, "#FF4B3E");
        c.restore();

        const blocks = blocksNow();
        const pct = g.runTime > 0 ? Math.round((g.inLane / g.runTime) * 100) : 0;
        panel(158, 290);
        const used = wrapped(c, g.epitaph, W / 2, 190, W - 84, 18, INK);
        let y = 190 + used + 22;
        text(c, "YOU MADE IT", W / 2, y, 15, "#7A4A21");
        text(c, `${blocks} BLOCK${blocks === 1 ? "" : "S"}`, W / 2, y + 34, 44, INK);
        if (g.newBest) text(c, "★ NEW BEST ★", W / 2, y + 68, 17, "#C8463C");
        else text(c, `BEST: ${best}`, W / 2, y + 68, 17, "#7A4A21");
        y += 104;
        text(c, "TIME ACTUALLY SPENT IN THE BIKE LANE", W / 2, y, 13, "#7A4A21");
        text(c, `${pct}%`, W / 2, y + 30, 34, "#2F855A");
        if (g.t - g.modeAt > 0.7 && blink(g.t)) text(c, "CLICK, TAP OR PRESS SPACE TO RETRY", W / 2, 492, 18, "#FFD23F");
      }
      c.restore();
    };

    // --- input ---

    const go = () => {
      if (g.mode === "title") start();
      else if (g.mode === "over" && g.t - g.modeAt > 0.7) start();
    };

    const onKey = (e: KeyboardEvent) => {
      // Typing initials or pressing a button shouldn't steer or restart the game
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
      const k = e.key;
      const left = k === "ArrowLeft" || k === "a" || k === "A";
      const right = k === "ArrowRight" || k === "d" || k === "D";
      const action = k === " " || k === "Enter";
      if (!left && !right && !action) return;
      if (g.mode === "play") {
        e.preventDefault(); // don't scroll the page mid-ride
        if (left) steer(-1);
        if (right) steer(1);
      } else if (action) {
        e.preventDefault();
        go();
      }
    };

    const onPointer = (e: PointerEvent) => {
      e.preventDefault();
      if (g.mode !== "play") return go();
      const r = canvas.getBoundingClientRect();
      steer(e.clientX - r.left < r.width / 2 ? -1 : 1);
    };

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      render();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
      audio?.close().catch(() => {});
    };
  }, []);

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <canvas
        ref={canvasRef}
        className="block w-full rounded-xl border-2 border-ink shadow-hard bg-black select-none"
        style={{ aspectRatio: `${W} / ${H}`, touchAction: "none" }}
        aria-label="Lane Closed, a bike lane game. Use the left and right arrow keys to swerve."
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setMuted((m) => !m)}
          className="label rounded-lg border-2 border-ink bg-paper px-3 py-1.5 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          aria-pressed={muted}
        >
          Sound: {muted ? "off" : "on"}
        </button>
      </div>

      {board && (
        <section className="mt-6 rounded-xl border-2 border-ink bg-white shadow-hard overflow-hidden" aria-label="Leaderboard">
          <h2 className="label px-4 py-2.5 border-b-2 border-ink bg-paper">High scores</h2>

          {lastRun !== null && lastRun > 0 && submitState !== "sent" && (
            <form onSubmit={submitScore} className="px-4 py-3 border-b-2 border-ink/10 bg-gold/15">
              <label htmlFor="initials" className="block text-sm mb-2">
                You made it <strong>{lastRun} block{lastRun === 1 ? "" : "s"}</strong>. Enter your initials:
              </label>
              <div className="flex gap-2">
                <input
                  id="initials"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3))}
                  maxLength={3}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="AAA"
                  className="w-24 rounded-lg border-2 border-ink bg-white px-3 py-2 font-mono text-lg tracking-[0.3em] text-center uppercase placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button
                  type="submit"
                  disabled={initials.length !== 3 || submitState === "sending"}
                  className="rounded-lg border-2 border-ink bg-gold px-4 font-display font-bold shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none"
                >
                  {submitState === "sending" ? "Saving..." : "Submit"}
                </button>
              </div>
              {submitError && <p className="mt-2 text-sm text-signal" role="alert">{submitError}</p>}
            </form>
          )}

          {board.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink/70">No scores yet. Somebody has to go first.</p>
          ) : (
            <ol className="divide-y divide-ink/10 font-mono">
              {board.map((row, i) => {
                const mine = submitState === "sent" && row.name === initials;
                return (
                  <li key={row.name} className={`flex items-center gap-4 px-4 py-2 ${mine ? "bg-gold/25 font-bold" : ""}`}>
                    <span className="w-6 text-right text-ink/50">{i + 1}</span>
                    <span className="tracking-[0.3em]">{row.name}</span>
                    <span className="ml-auto">{row.score}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
