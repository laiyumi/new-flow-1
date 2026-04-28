import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
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

const SharePopover = ({ joinUrl }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, joinUrl, { width: 160, margin: 1 });
    QRCode.toDataURL(joinUrl, { width: 512, margin: 2 }).then(setDataUrl);
  }, [joinUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadQr = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "poll-qr-code.png";
    a.click();
  };

  return (
    <HoverCard openDelay={100} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Button className="h-10 rounded-lg bg-info px-3 text-info-foreground hover:bg-info/90">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-[380px] rounded-2xl p-5">
        <div className="space-y-4">
          {/* Joining link */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Link2 className="h-4 w-4" />
              Joining link
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {joinUrl}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyLink}
                className="h-9 rounded-md"
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
              <div className="rounded-lg border bg-card p-2">
                <canvas ref={canvasRef} />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadQr}
                  className="h-9 w-full justify-center rounded-md"
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Download QR code
                </Button>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SharePopover;
