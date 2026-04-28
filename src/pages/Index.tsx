import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2, SlidersHorizontal, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [pollName] = useState("Test non-anonymous");
  const [anonymous, setAnonymous] = useState(true);
  const [liveQA, setLiveQA] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [allVisible, setAllVisible] = useState(false);

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{pollName}</h1>

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
              <Button className="h-10 rounded-lg bg-primary px-3 text-primary-foreground hover:bg-primary/90">
                <Eye className="mr-2 h-4 w-4" />
                View as Participant
              </Button>
              <Button
                onClick={toggleAllVisible}
                variant="outline"
                className="h-10 rounded-lg border-info/30 bg-info/10 text-info hover:bg-info/20 hover:text-info"
              >
                <Radio className="mr-2 h-4 w-4" />
                Display All Results
              </Button>
            </div>
          </div>
        </section>

        {/* Underlined Tabs */}
        <Tabs defaultValue="questions" className="w-full">
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

              <div className="grid grid-cols-[40px_minmax(0,1fr)_120px_100px_110px_90px_140px_70px_70px] items-center gap-3 border-b pb-3 text-[11px] font-bold tracking-widest text-muted-foreground">
                <div></div>
                <div>QUESTION</div>
                <div className="text-center">TIMER</div>
                <div className="text-center">START</div>
                <div className="text-center">STATUS</div>
                <div className="text-center">VISIBLE</div>
                <div className="text-center">FORMAT</div>
                <div className="text-center">EDIT</div>
                <div className="text-center">TRASH</div>
              </div>

              <div className="divide-y">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="grid grid-cols-[40px_minmax(0,1fr)_120px_100px_110px_90px_140px_70px_70px] items-center gap-3 py-4"
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
                      <button className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Edit">
                        <SlidersHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
              Results will appear here.
            </section>
          </TabsContent>

          <TabsContent value="qa" className="mt-6">
            <section className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-sm">
              Q&amp;A board will appear here.
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
