import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Play,
  Activity,
  MessageSquare,
  RotateCcw,
  Users,
  ChevronDown,
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

const MyPolls = () => {
  const navigate = useNavigate();
  const [, force] = useState(0);
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

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My polls</h1>
        </div>

        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
          {polls.map((poll, idx) => {
            const state = getPollState(poll.id);
            const sessions = state.past.length > 0 ? state.past : poll.seedSessions;
            const hasActive = !!state.active;
            const isOpen = !!expanded[poll.id];

            return (
              <div
                key={poll.id}
                className={cn(
                  "relative",
                  idx > 0 && "border-t border-border",
                )}
              >
                {/* Left accent bar */}
                <span
                  className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    hasActive ? "bg-primary" : "bg-transparent",
                  )}
                  aria-hidden
                />

                {/* Main row */}
                <div className="flex items-center gap-4 py-5 pl-6 pr-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-bold text-foreground">{poll.name}</h2>
                      {hasActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-primary">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {poll.course}
                      <span className="mx-2 text-border">·</span>
                      {sessions.length} past session{sessions.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <button
                    onClick={() => toggle(poll.id)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    History
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {hasActive ? (
                    <Button
                      onClick={() => launchSession(poll)}
                      className="h-10 rounded-lg bg-warning px-4 text-warning-foreground hover:bg-warning/90"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Resume session
                    </Button>
                  ) : (
                    <Button
                      onClick={() => launchSession(poll)}
                      className="h-10 rounded-lg bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Launch new session
                    </Button>
                  )}
                </div>

                {/* Expanded history */}
                {isOpen && (
                  <div className="border-t border-border bg-surface/60 pl-6">
                    {sessions.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-muted-foreground">
                        No past sessions yet.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {sessions.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <span className="truncate text-sm font-medium text-foreground">
                                {s.name}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {s.participants}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 pr-1">
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
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyPolls;
