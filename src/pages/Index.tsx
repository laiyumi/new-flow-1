import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  SlidersHorizontal,
  Radio,
  MoreVertical,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import {
  ensureActiveSession,
  endActiveSession,
  leaveSessionActive as leaveSessionActiveStore,
  discardActiveSession,
} from "@/lib/sessions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SharePopover from "@/components/SharePopover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Question = {
  id: number;
  text: string;
  timer: string;
  format: string;
  visible: boolean;
  status: "not-started" | "live" | "completed";
  votes: number;
};

const initialQuestions: Question[] = [
  { id: 1, text: "What is your favorite Java IDE?", timer: "no-timer", format: "bar", visible: false, status: "not-started", votes: 0 },
  { id: 2, text: "In one sentence, describe what a class is.", timer: "no-timer", format: "word", visible: false, status: "not-started", votes: 0 },
  { id: 3, text: "Which language do you want to learn next?", timer: "no-timer", format: "bar", visible: false, status: "not-started", votes: 0 },
];

const Index = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const stateName = (location.state as { name?: string } | null)?.name;
  const [pollName] = useState(stateName ?? "Week 1 Lecture Feedback");
  const [anonymous, setAnonymous] = useState(true);
  const [anonDialogOpen, setAnonDialogOpen] = useState(false);
  const invitedParticipants = 42;

  const handleAnonymousChange = (next: boolean) => {
    if (!next) setAnonDialogOpen(true);
    else setAnonymous(true);
  };

  const confirmDisableAnonymous = () => {
    setAnonymous(false);
    setAnonDialogOpen(false);
  };

  const [liveQA, setLiveQA] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [allVisible, setAllVisible] = useState(false);
  const [backDialogOpen, setBackDialogOpen] = useState(false);

  // Bottom dock state
  const [dockOpen, setDockOpen] = useState(true);
  const [dockTab, setDockTab] = useState<"results" | "qa">("results");

  const pollId = params.id ?? "test-poll";
  const session = useMemo(() => ensureActiveSession(pollId), [pollId]);

  useEffect(() => {
    ensureActiveSession(pollId);
  }, [pollId]);

  const liveQuestion = questions.find((q) => q.status === "live") ?? null;

  const endSession = () => {
    endActiveSession(pollId);
    setBackDialogOpen(false);
    navigate("/");
  };
  const leaveSessionActive = () => {
    leaveSessionActiveStore(pollId);
    setBackDialogOpen(false);
    navigate("/");
  };
  const discardSession = () => {
    discardActiveSession(pollId);
    setBackDialogOpen(false);
    navigate("/");
  };

  const toggleVisible = (id: number) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, visible: !q.visible } : q)));

  const removeQuestion = (id: number) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));

  const cycleStatus = (id: number) =>
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        if (q.status === "live") return { ...q, status: "completed" };
        const seed = q.votes > 0 ? q.votes : Math.floor(Math.random() * 30) + 5;
        return { ...q, status: "live", votes: seed };
      }),
    );

  const toggleAllVisible = () => {
    const next = !allVisible;
    setAllVisible(next);
    setQuestions((qs) => qs.map((q) => ({ ...q, visible: next })));
  };

  const statusLabel = (s: Question["status"]) => (s === "live" ? "Stop" : "Start");
  const statusBadge = (q: Question) => {
    if (q.status === "not-started") return "Not started";
    if (q.status === "live") return `Live · ${q.votes} votes`;
    return `Completed · ${q.votes} votes`;
  };
  const statusClass = (s: Question["status"]) =>
    s === "live" ? "text-primary" : "text-muted-foreground";

  return (
    <div className={cn("min-h-screen bg-surface p-6", dockOpen && "pb-[22rem]")}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Back */}
        <button
          onClick={() => setBackDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Back to My Polls"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Polls
        </button>

        {/* SECTION 1 — Poll Information */}
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-3 text-xs font-bold tracking-widest text-muted-foreground">
            POLL INFORMATION
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{pollName}</h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">0</span>
              <span className="text-[10px] font-bold tracking-widest text-primary/80">
                PARTICIPANTS
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {session.name}
            </span>
          </div>
        </section>

        {/* SECTION 2 — Poll-level Control */}
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-4 text-xs font-bold tracking-widest text-muted-foreground">
            POLL-LEVEL CONTROL
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3">
                <Switch
                  checked={anonymous}
                  onCheckedChange={handleAnonymousChange}
                  className="data-[state=checked]:bg-info"
                />
                <span className="text-sm font-semibold text-foreground">Anonymous</span>
              </label>
              <label className="flex items-center gap-3">
                <Switch
                  checked={liveQA}
                  onCheckedChange={setLiveQA}
                  className="data-[state=checked]:bg-info"
                />
                <span className="text-sm font-semibold text-foreground">Live Q&amp;A</span>
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleAllVisible}
                    variant="outline"
                    className="h-10 rounded-lg border-info bg-transparent px-3 text-info hover:bg-info/10 hover:text-info"
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    Display All Results
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Make every question's results visible to participants</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SharePopover joinUrl="nextgenpoll.com/join/4A7PZJ" />
              <Button
                onClick={() =>
                  window.open(`/polls/${pollId}/join`, "_blank", "noopener")
                }
                variant="outline"
                className="h-10 rounded-lg border-info bg-transparent px-3 text-info hover:bg-info/10 hover:text-info"
              >
                <Eye className="mr-2 h-4 w-4" />
                View as Participant
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 3 — Question-level Control */}
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-4 text-xs font-bold tracking-widest text-muted-foreground">
            QUESTION-LEVEL CONTROL
          </div>
          <div className="grid grid-cols-[40px_minmax(0,1fr)_120px_100px_110px_140px_140px_60px] items-center gap-3 border-b pb-3 text-sm font-bold tracking-widest text-foreground">
            <div></div>
            <div>QUESTION</div>
            <div className="text-center">TIMER</div>
            <div className="text-center">ACTION</div>
            <div className="text-center">STATUS</div>
            <div className="text-center">RESULT VISIBILITY</div>
            <div className="text-center">FORMAT</div>
            <div className="text-center">MORE</div>
          </div>

          <div className="divide-y">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="grid grid-cols-[40px_minmax(0,1fr)_120px_100px_110px_140px_140px_60px] items-center gap-3 py-4"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div className="font-semibold text-foreground">{q.text}</div>
                <div className="flex justify-center">
                  <Select value={q.timer}>
                    <SelectTrigger className="h-9 w-[110px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-timer">No timer</SelectItem>
                      <SelectItem value="30">30 sec</SelectItem>
                      <SelectItem value="60">60 sec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center">
                  <Button
                    size="sm"
                    onClick={() => {
                      cycleStatus(q.id);
                      setDockOpen(true);
                      setDockTab("results");
                    }}
                    className={
                      q.status === "live"
                        ? "h-9 w-[88px] rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "h-9 w-[88px] rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    }
                  >
                    {statusLabel(q.status)}
                  </Button>
                </div>
                <div className={`text-center text-xs font-semibold ${statusClass(q.status)}`}>
                  {statusBadge(q)}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleVisible(q.id)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                    aria-label="Toggle visibility"
                  >
                    {q.visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex justify-center">
                  <Select value={q.format}>
                    <SelectTrigger className="h-9 w-[130px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="word">Word Cloud</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                        aria-label="More actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem>
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => removeQuestion(q.id)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => e.preventDefault()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </section>
      </div>

      {/* BOTTOM DOCK — Results & Q&A */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t bg-card shadow-[0_-4px_20px_-8px_hsl(var(--foreground)/0.1)] transition-[height] duration-300",
          dockOpen ? "h-80" : "h-12",
        )}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col">
          {/* Dock header */}
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-6">
            <Tabs
              value={dockTab}
              onValueChange={(v) => {
                setDockTab(v as "results" | "qa");
                setDockOpen(true);
              }}
            >
              <TabsList className="h-9 bg-muted">
                <TabsTrigger value="results" className="gap-1.5 text-xs font-bold tracking-wide">
                  <BarChart3 className="h-3.5 w-3.5" />
                  RESULTS
                  {liveQuestion && (
                    <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="qa" className="gap-1.5 text-xs font-bold tracking-wide">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Q&amp;A BOARD
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              onClick={() => setDockOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={dockOpen ? "Collapse dock" : "Expand dock"}
            >
              {dockOpen ? (
                <>
                  Collapse <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  Expand <ChevronUp className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Dock body */}
          {dockOpen && (
            <div className="flex-1 overflow-y-auto border-t px-6 py-4">
              {dockTab === "results" ? (
                liveQuestion ? (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                        LIVE
                      </span>
                      <span className="font-semibold text-foreground">{liveQuestion.text}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {liveQuestion.votes} votes
                      </span>
                    </div>
                    <div className="flex h-40 items-center justify-center rounded-lg bg-surface text-sm text-muted-foreground">
                      Live results chart for the active question
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Start a question to see live results here.
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {liveQA
                    ? "Q&A board — questions from participants appear here in real time."
                    : "Enable Live Q&A above to start collecting questions."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={backDialogOpen} onOpenChange={setBackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leaving the current session</DialogTitle>
            <DialogDescription>
              End the session to save results and Q&amp;A. Leave to keep it active and return later, or just go back without recording this session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={discardSession}>
              Just leave
            </Button>
            <Button variant="outline" onClick={leaveSessionActive}>
              Leave, keep session active
            </Button>
            <Button
              onClick={endSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              End session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={anonDialogOpen} onOpenChange={setAnonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable anonymous responses?</DialogTitle>
            <DialogDescription>
              Turning off anonymous mode will restrict this session to invited participants only.
              Currently <span className="font-semibold text-foreground">{invitedParticipants}</span> participants are invited in this space.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setAnonDialogOpen(false)}>
              Keep anonymous
            </Button>
            <Button
              onClick={confirmDisableAnonymous}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Disable anonymous
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
