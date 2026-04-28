import { useState } from "react";
import { Link2, QrCode, Download, Copy, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type Props = {
  joinUrl: string;
};

// Deterministic fake QR pattern (21x21 grid with finder patterns)
const FAKE_QR_SIZE = 21;
const buildFakePattern = (): boolean[][] => {
  const grid: boolean[][] = Array.from({ length: FAKE_QR_SIZE }, () =>
    Array(FAKE_QR_SIZE).fill(false),
  );
  // Pseudo-random deterministic fill
  for (let y = 0; y < FAKE_QR_SIZE; y++) {
    for (let x = 0; x < FAKE_QR_SIZE; x++) {
      grid[y][x] = ((x * 7 + y * 13 + x * y) % 3) === 0;
    }
  }
  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const onBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const inCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = onBorder || inCenter;
      }
    }
    // clear separator
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

const QrSvg = ({ size = 160 }: { size?: number }) => {
  const cell = size / FAKE_QR_SIZE;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {FAKE_QR.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="black"
            />
          ) : null,
        ),
      )}
    </svg>
  );
};

const SharePopover = ({ joinUrl }: Props) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadQr = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 ${FAKE_QR_SIZE} ${FAKE_QR_SIZE}" shape-rendering="crispEdges"><rect width="${FAKE_QR_SIZE}" height="${FAKE_QR_SIZE}" fill="white"/>${FAKE_QR.map(
      (row, y) =>
        row
          .map((on, x) => (on ? `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>` : ""))
          .join(""),
    ).join("")}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "poll-qr-code.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HoverCard openDelay={100} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-lg border-info/40 bg-transparent px-3 text-info hover:bg-info/10 hover:text-info"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-[400px] rounded-2xl p-5">
        <div className="space-y-4">
          {/* Joining link */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Link2 className="h-4 w-4" />
              Joining link
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {joinUrl}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyLink}
                className="h-9 shrink-0 rounded-md"
              >
                {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="border-t" />

          {/* QR code */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <QrCode className="h-4 w-4" />
              QR code
            </div>
            <div className="flex items-center gap-4">
              <div className="shrink-0 rounded-lg border bg-card p-2">
                <QrSvg size={140} />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadQr}
                className="h-9 flex-1 justify-center rounded-md whitespace-nowrap"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Download QR code
              </Button>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SharePopover;
