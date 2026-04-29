import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Play,
  Activity,
  MessageSquare,
  RotateCcw,
  Users,
  ChevronDown,
  Folder,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPollState, subscribe, type PastSession } from "@/lib/sessions";
import { cn } from "@/lib/utils";

type Poll = {
  id: string;
  name: string;
  course: string;
  seedSessions: PastSession[];
};

const polls: Poll[] = [
  {
    id: "test-poll",
    name: "Test Poll",
    course: "CS101 · Spring 2026",
    seedSessions: [
      { id: "seed-1", name: "Apr 27, 2026 7:19 PM", endedAt: 0, participants: 32 },
      { id: "seed-2", name: "Apr 20, 2026 7:05 PM", endedAt: 0, participants: 28 },
    ],
  },
  {
    id: "test-non-anonymous",
    name: "Week 1 Lecture Feedback",
    course: "CS101 · Spring 2026",
    seedSessions: [{ id: "seed-1", name: "Apr 27, 2026 6:48 PM", endedAt: 0, participants: 41 }],
  },
];

const ALL = "__all__";

const MyPolls = () => {
  const navigate = useNavigate();
  const [, force] = useState(0);
  const [courseFilter, setCourseFilter] = useState<string>(ALL);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => subscribe(() => force((n) => n + 1)), []);

  const launchSession = (poll: Poll) => {
    navigate(`/polls/${poll.id}`, { state: { name: poll.name } });
  };

  const viewResults = (poll: Poll, session: PastSession) => {
    navigate(`/polls/${poll.id}`, {
      state: { name: poll.name, tab: "results", sessionName: session.name },
    });
  };

  const viewQA = (poll: Poll, session: PastSession) => {
    navigate(`/polls/${poll.id}`, {
      state: { name: poll.name, tab: "qa", sessionName: session.name },
    });
  };

  const courses = useMemo(() => {
    const set = new Set(polls.map((p) => p.course));
    return Array.from(set);
  }, []);

  const filteredPolls = useMemo(
    () => (courseFilter === ALL ? polls : polls.filter((p) => p.course === courseFilter)),
    [courseFilter],
  );

  const countsByCourse = useMemo(() => {
    const map: Record<string, number> = { [ALL]: polls.length };
    for (const c of courses) map[c] = polls.filter((p) => p.course === c).length;
    return map;
  }, [courses]);

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-6xl gap-8 p-8">
        {/* Sidebar: course categories */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="mb-3 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Folder className="h-3.5 w-3.5" />
            Courses
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setCourseFilter(ALL)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                courseFilter === ALL
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                All polls
              </span>
              <span className="text-xs text-muted-foreground">{countsByCourse[ALL]}</span>
            </button>
            {courses.map((c) => (
              <button
                key={c}
                onClick={() => setCourseFilter(c)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  courseFilter === c
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span className="truncate">{c}</span>
                <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                  {countsByCourse[c]}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main: simple poll list */}
        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My polls</h1>
          </div>

          {/* Mobile course filter */}
          <div className="mb-4 flex flex-wrap gap-2 md:hidden">
            <button
              onClick={() => setCourseFilter(ALL)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-border",
                courseFilter === ALL ? "bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              All
            </button>
            {courses.map((c) => (
              <button
                key={c}
                onClick={() => setCourseFilter(c)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-border",
                  courseFilter === c ? "bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
            {filteredPolls.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No polls in this course.</p>
            ) : (
              filteredPolls.map((poll, idx) => {
                const state = getPollState(poll.id);
                const sessions = state.past.length > 0 ? state.past : poll.seedSessions;
                const hasActive = !!state.active;
                const isOpen = !!expanded[poll.id];

                return (
                  <div key={poll.id} className={cn(idx > 0 && "border-t border-border")}>
                    {/* Row */}
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-foreground">
                            {poll.name}
                          </h2>
                          {hasActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-primary">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {poll.course} · {sessions.length} session{sessions.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <button
                        onClick={() => toggle(poll.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        Past sessions
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                        />
                      </button>

                      {hasActive ? (
                        <Button
                          onClick={() => launchSession(poll)}
                          className="h-9 rounded-lg bg-warning px-4 text-warning-foreground hover:bg-warning/90"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          onClick={() => launchSession(poll)}
                          className="h-9 rounded-lg bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Launch
                        </Button>
                      )}
                    </div>

                    {/* Expanded sessions */}
                    {isOpen && (
                      <div className="border-t border-border bg-surface/60 px-5 py-3">
                        {sessions.length === 0 ? (
                          <p className="py-2 text-sm text-muted-foreground">No past sessions yet.</p>
                        ) : (
                          <ul className="divide-y divide-border">
                            {sessions.map((s) => (
                              <li
                                key={s.id}
                                className="flex flex-wrap items-center gap-3 py-2.5"
                              >
                                <span className="flex-1 truncate text-sm text-foreground">
                                  {s.name}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                                  <Users className="h-3.5 w-3.5" />
                                  {s.participants}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewResults(poll, s)}
                                  className="h-8 rounded-md"
                                >
                                  <Activity className="mr-2 h-3.5 w-3.5" />
                                  Results
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewQA(poll, s)}
                                  className="h-8 rounded-md"
                                >
                                  <MessageSquare className="mr-2 h-3.5 w-3.5" />
                                  Q&amp;A board
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyPolls;
