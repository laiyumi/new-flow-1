import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  ensureActiveSession,
  endActiveSession,
  leaveSessionActive as leaveSessionActiveStore,
} from "@/lib/sessions";
import { Eye, EyeOff, Plus, Trash2, SlidersHorizontal, Radio, MoreVertical, Users } from "lucide-react";
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

type Question = {
  id: number;
  text: string;
  timer: string;
  format: string;
  visible: boolean;
  status: "not-started" | "running" | "complete";
};

const initialQuestions: Question[] = [
  { id: 1, text: "What is your favorite Java IDE?", timer: "no-timer", format: "bar", visible: false, status: "not-started" },
  { id: 2, text: "In one sentence, describe what a class is.", timer: "no-timer", format: "word", visible: false, status: "not-started" },
  { id: 3, text: "Which language do you want to learn next?", timer: "no-timer", format: "bar", visible: false, status: "not-started" },
];

const Index = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const stateName = (location.state as { name?: string } | null)?.name;
  const defaultTab = (location.state as { tab?: string } | null)?.tab ?? "questions";
  const [pollName] = useState(stateName ?? "Test non-anonymous");
  const [anonymous, setAnonymous] = useState(true);
  const [liveQA, setLiveQA] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [allVisible, setAllVisible] = useState(false);
  const [backDialogOpen, setBackDialogOpen] = useState(false);

  const pollId = params.id ?? "test-poll";
  const sessionLabel = useMemo(() => ensureActiveSession(pollId).name, [pollId]);

  // Make sure an active session exists as soon as the presenter view opens
  useEffect(() => {
    ensureActiveSession(pollId);
  }, [pollId]);

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

  const toggleVisible = (id: number) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, visible: !q.visible } : q)));

  const removeQuestion = (id: number) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));

  const cycleStatus = (id: number) =>
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        const next: Question["status"] =
          q.status === "not-started" ? "running" : q.status === "running" ? "complete" : "not-started";
        return { ...q, status: next };
      }),
    );

  const addQuestion = () =>
    setQuestions((qs) => [
      ...qs,
      {
        id: Math.max(0, ...qs.map((q) => q.id)) + 1,
        text: "New question",
        timer: "no-timer",
        format: "bar",
        visible: false,
        status: "not-started",
      },
    ]);

  const toggleAllVisible = () => {
    const next = !allVisible;
    setAllVisible(next);
    setQuestions((qs) => qs.map((q) => ({ ...q, visible: next })));
  };

  const statusLabel = (s: Question["status"]) =>
    s === "not-started" ? "Start" : s === "running" ? "Stop" : "Start";

  const statusBadge = (s: Question["status"]) =>
    s === "not-started" ? "Not Yet" : s === "running" ? "Running" : "Complete";

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBackDialogOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Back to My Polls"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{pollName}</h1>
          <span className="text-sm font-medium text-muted-foreground">
            session: {sessionLabel}
          </span>
        </div>

        {/* Participant Control */}
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-4 text-xs font-bold tracking-widest text-muted-foreground">
            PARTICIPANT CONTROL
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3">
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
                <span className="text-sm font-semibold text-foreground">Anonymous</span>
              </label>
              <label className="flex items-center gap-3">
                <Switch checked={liveQA} onCheckedChange={setLiveQA} />
                <span className="text-sm font-semibold text-foreground">Live Q&amp;A</span>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() =>
                  window.open(`/polls/${params.id ?? "test-poll"}/join`, "_blank", "noopener")
                }
                variant="outline"
                className="h-10 rounded-lg border-info/40 bg-transparent px-3 text-info hover:bg-info/10 hover:text-info"
              >
                <Eye className="mr-2 h-4 w-4" />
                View as Participant
              </Button>
              <Button
                onClick={toggleAllVisible}
                variant="outline"
                className="h-10 rounded-lg border-info/40 bg-transparent px-3 text-info hover:bg-info/10 hover:text-info"
              >
                <Radio className="mr-2 h-4 w-4" />
                Display All Results
              </Button>
              <SharePopover joinUrl="nextgenpoll.com/join/4A7PZJ" />
            </div>
          </div>
        </section>

        {/* Underlined Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="questions"
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-1 text-sm font-bold tracking-wide text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              QUESTIONS
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-1 text-sm font-bold tracking-wide text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              RESULTS
            </TabsTrigger>
            <TabsTrigger
              value="qa"
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-1 text-sm font-bold tracking-wide text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Q&amp;A BOARD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-6">
            <section className="rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="mb-6 text-sm font-bold tracking-widest text-muted-foreground">
                QUESTIONS LIST
              </h2>

              <div className="grid grid-cols-[40px_minmax(0,1fr)_120px_100px_110px_140px_140px_60px] items-center gap-3 border-b pb-3 text-[11px] font-bold tracking-widest text-muted-foreground">
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
                        onClick={() => cycleStatus(q.id)}
                        className={
                          q.status === "running"
                            ? "h-9 w-[88px] rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "h-9 w-[88px] rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        }
                      >
                        {statusLabel(q.status)}
                      </Button>
                    </div>

                    <div className="text-center text-xs font-semibold text-muted-foreground">
                      {statusBadge(q.status)}
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
                onClick={addQuestion}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </section>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <section className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-sm">
              Results of current session will appear here.
            </section>
          </TabsContent>

          <TabsContent value="qa" className="mt-6">
            <section className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-sm">
              Q&amp;A board will appear here.
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={backDialogOpen} onOpenChange={setBackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leaving the current session</DialogTitle>
            <DialogDescription>
              End the session to save results and Q&amp;A. Leave to keep it active and return later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
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
    </div>
  );
};

export default Index;
