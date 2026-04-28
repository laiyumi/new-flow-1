import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

// Reuse the same fake QR pattern from SharePopover
const FAKE_QR_SIZE = 21;
const buildFakePattern = (): boolean[][] => {
  const grid: boolean[][] = Array.from({ length: FAKE_QR_SIZE }, () =>
    Array(FAKE_QR_SIZE).fill(false),
  );
  for (let y = 0; y < FAKE_QR_SIZE; y++) {
    for (let x = 0; x < FAKE_QR_SIZE; x++) {
      grid[y][x] = ((x * 7 + y * 13 + x * y) % 3) === 0;
    }
  }
  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const onBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const inCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = onBorder || inCenter;
      }
    }
    for (let i = 0; i < 8; i++) {
      if (oy + 7 < FAKE_QR_SIZE && ox + i < FAKE_QR_SIZE) grid[oy + 7][ox + i] = false;
      if (ox + 7 < FAKE_QR_SIZE && oy + i < FAKE_QR_SIZE) grid[oy + i][ox + 7] = false;
    }
  };
  drawFinder(0, 0);
  drawFinder(FAKE_QR_SIZE - 7, 0);
  drawFinder(0, FAKE_QR_SIZE - 7);
  return grid;
};
const FAKE_QR = buildFakePattern();

const QrSvg = ({ size = 280 }: { size?: number }) => {
  const cell = size / FAKE_QR_SIZE;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {FAKE_QR.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="black" />
          ) : null,
        ),
      )}
    </svg>
  );
};

const JoinPoll = () => {
  const { id } = useParams();
  const location = useLocation();
  const stateName = (location.state as { name?: string } | null)?.name;
  const pollName =
    stateName ?? (id ? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Test Poll");

  const joinCode = "72NRPH";
  const [dark, setDark] = useState(false);
  const [participants] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-background to-surface p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col rounded-3xl bg-card p-10 shadow-sm ring-1 ring-border">
        {/* Theme toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setDark((d) => !d)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Centered content */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-full bg-primary/20" />
              <div className="absolute inset-1.5 rounded-full bg-primary" />
              <span className="absolute -left-2 top-1/2 h-0.5 w-3 -translate-y-1/2 bg-primary/40" />
              <span className="absolute -right-2 top-1/2 h-0.5 w-3 -translate-y-1/2 bg-primary/40" />
              <span className="absolute left-1/2 -top-2 h-3 w-0.5 -translate-x-1/2 bg-primary/40" />
              <span className="absolute left-1/2 -bottom-2 h-3 w-0.5 -translate-x-1/2 bg-primary/40" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              NextGen<span className="font-bold">Poll</span>
            </span>
          </div>

          {/* Poll title */}
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">{pollName}</h1>

          {/* Subtitle */}
          <p className="text-sm font-bold tracking-[0.4em] text-primary">JOIN THE LIVE POLL</p>

          {/* QR code */}
          <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-border">
            <QrSvg size={260} />
          </div>

          {/* Or go to */}
          <p className="text-xs font-bold tracking-[0.3em] text-muted-foreground">OR GO TO</p>

          <div className="flex items-center gap-4 rounded-2xl bg-surface px-6 py-4 shadow-sm ring-1 ring-border">
            <span className="text-2xl font-semibold text-foreground">nextgenpoll.com/join</span>
            <span className="h-7 w-px bg-border" />
            <span className="text-3xl font-extrabold tracking-wider text-primary">{joinCode}</span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 ring-1 ring-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xl font-extrabold text-primary">{participants}</span>
            <span className="text-xs font-bold tracking-[0.25em] text-primary/80">PARTICIPANTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinPoll;
