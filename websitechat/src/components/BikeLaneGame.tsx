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
};
type Obstacle = { lane: number; y: number; kind: Kind; seed: number };

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

const BY_LANE: Kind[][] = [
  [TRAFFIC_CAR, TRAFFIC_CAR, TRAFFIC_CAR, BUS],
  [VAN, VAN, HAZARD_CAR, HAZARD_CAR, COP, BINS, SIGN, SCOOTERS],
  [PEDS, PEDS, DOG_WALKER, CAFE_SIGN, BINS],
];

// --- the game --------------------------------------------------------------

type Mode = "loading" | "title" | "play" | "over";

export default function BikeLaneGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

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
    };

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
      });
      beep(520, 0.08);
      setTimeout(() => beep(780, 0.12), 90);
    };

    const steer = (dir: -1 | 1) => {
      const lane = Math.max(0, Math.min(2, g.lane + dir));
      if (lane !== g.lane) {
        g.lane = lane;
        beep(dir < 0 ? 330 : 392, 0.05);
      }
    };

    const crash = (o: Obstacle) => {
      g.mode = "over";
      g.modeAt = g.t;
      g.epitaph = o.kind.epitaph;
      g.shake = 0.35;
      const blocks = Math.floor(g.dist / BLOCK);
      if (blocks > best) {
        best = blocks;
        g.newBest = true;
        try {
          localStorage.setItem("lane-closed-best", String(best));
        } catch {}
      }
      beep(300, 0.5, "sawtooth", 40);
    };

    // Spawn a row of obstacles. There is always a way through: each row leaves
    // one lane open, and it's never more than one lane over from the last gap.
    // The bike lane is the open one as rarely as possible, obviously.
    const spawnRow = () => {
      const options = [g.openLane - 1, g.openLane, g.openLane + 1].filter((l) => l >= 0 && l <= 2);
      let open = options[Math.floor(Math.random() * options.length)];
      if (open === BIKE_LANE && Math.random() < 0.6) {
        const others = options.filter((l) => l !== BIKE_LANE);
        if (others.length) open = others[Math.floor(Math.random() * others.length)];
      }
      let tallest = 0;
      for (let lane = 0; lane < 3; lane++) {
        if (lane === open) continue;
        if (Math.random() > (lane === BIKE_LANE ? 0.92 : 0.5)) continue;
        const kinds = BY_LANE[lane];
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        g.obstacles.push({ lane, y: -kind.h / 2 - 10, kind, seed: Math.floor(Math.random() * 1000) });
        tallest = Math.max(tallest, kind.h);
      }
      g.openLane = open;
      return tallest;
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
      if (g.lane === BIKE_LANE) g.inLane += dt;
      g.x += (LANES[g.lane] - g.x) * Math.min(1, dt * 18);

      g.nextRow -= step;
      if (g.nextRow <= 0) {
        // Clear road after this row's longest obstacle, so there's always
        // room to change lanes before the next row arrives
        const tallest = spawnRow();
        g.nextRow = tallest + Math.max(150, 250 - g.runTime * 2.5);
      }

      for (const o of g.obstacles) o.y += step;
      g.obstacles = g.obstacles.filter((o) => o.y - o.kind.h / 2 < H + 20);

      // Collisions, with slightly forgiving hitboxes
      for (const o of g.obstacles) {
        const dx = Math.abs(LANES[o.lane] - g.x);
        const dy = Math.abs(o.y - PLAYER_Y);
        if (dx < o.kind.w / 2 + 13 - 8 && dy < o.kind.h / 2 + 26 - 8) {
          crash(o);
          break;
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

    const drawRider = () => {
      const lean = (LANES[g.lane] - g.x) * 0.012;
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
        text(c, "best viewed in Internet Explorer 6", W / 2, H / 2 + 40, 13, "#888");
        c.restore();
        return;
      }

      drawStreet();
      for (const o of g.obstacles) {
        c.save();
        c.translate(LANES[o.lane], o.y);
        o.kind.draw(c, g.t, o.seed);
        c.restore();
      }
      if (g.mode !== "title") drawRider();

      if (g.mode === "play") {
        const blocks = Math.floor(g.dist / BLOCK);
        box(c, 8, 8, 132, 34, 8, "#111", 0);
        text(c, `BLOCKS: ${blocks}`, 18, 26, 20, "#FFD23F", "left");
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
        text(c, "← →  or tap left / right to swerve", W / 2, 408, 15, INK);
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

        const blocks = Math.floor(g.dist / BLOCK);
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
    </div>
  );
}
