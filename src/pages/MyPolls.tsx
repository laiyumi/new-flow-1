import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Play,
  Activity,
  MessageSquare,
  RotateCcw,
  Users,
  History as HistoryIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [drawerPollId, setDrawerPollId] = useState<string | null>(null);

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

  const drawerPoll = polls.find((p) => p.id === drawerPollId) ?? null;
  const drawerSessions = drawerPoll
    ? (() => {
        const s = getPollState(drawerPoll.id);
        return s.past.length > 0 ? s.past : drawerPoll.seedSessions;
      })()
    : [];

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My polls</h1>
        </div>

        <div className="space-y-4">
          {polls.map((poll) => {
            const state = getPollState(poll.id);
            const sessions = state.past.length > 0 ? state.past : poll.seedSessions;
            const hasActive = !!state.active;
            const totalParticipants = sessions.reduce((acc, s) => acc + s.participants, 0);
            const recent = sessions.slice(0, 3);

            return (
              <div
                key={poll.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-shadow hover:shadow-md",
                )}
              >
                {/* Left status bar */}
                <span
                  className={cn(
                    "absolute left-0 top-0 h-full w-1.5",
                    hasActive ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />

                <div className="grid grid-cols-1 gap-6 px-7 py-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                  {/* Left: identity + primary action */}
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="truncate text-2xl font-bold tracking-tight text-foreground">
                        {poll.name}
                      </h2>
                      {hasActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-primary">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">{poll.course}</p>

                    {hasActive ? (
                      <Button
                        onClick={() => launchSession(poll)}
                        className="h-11 rounded-lg bg-warning px-5 text-warning-foreground hover:bg-warning/90"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Resume session
                      </Button>
                    ) : (
                      <Button
                        onClick={() => launchSession(poll)}
                        className="h-11 rounded-lg bg-primary px-5 text-primary-foreground hover:bg-primary/90"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Launch new session
                      </Button>
                    )}
                  </div>

                  {/* Divider (desktop only) */}
                  <div className="hidden h-24 w-px bg-border lg:block" />

                  {/* Right: stats + recent session chips */}
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-6">
                      <div>
                        <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Sessions
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{totalParticipants}</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Participants
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {recent.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setDrawerPollId(poll.id)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-surface-foreground ring-1 ring-border transition-colors hover:bg-muted"
                          title={`${s.name} · ${s.participants} participants`}
                        >
                          {s.name}
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {s.participants}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => setDrawerPollId(poll.id)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-info hover:bg-info/10"
                      >
                        <HistoryIcon className="h-3.5 w-3.5" />
                        All sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session drawer */}
      <Sheet open={!!drawerPoll} onOpenChange={(o) => !o && setDrawerPollId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {drawerPoll && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="text-xl font-bold">{drawerPoll.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{drawerPoll.course}</p>
              </SheetHeader>

              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <HistoryIcon className="h-3.5 w-3.5" />
                  Past sessions ({drawerSessions.length})
                </div>

                {drawerSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No past sessions yet.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg ring-1 ring-border">
                    {drawerSessions.map((s) => (
                      <li key={s.id} className="flex flex-col gap-2 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {s.name}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            {s.participants}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewResults(drawerPoll, s)}
                            className="h-8 flex-1 rounded-md"
                          >
                            <Activity className="mr-2 h-3.5 w-3.5" />
                            Results
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewQA(drawerPoll, s)}
                            className="h-8 flex-1 rounded-md"
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
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyPolls;
