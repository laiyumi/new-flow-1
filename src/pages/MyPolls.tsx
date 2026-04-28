import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Play, Activity, History, MessageSquare, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPollState, subscribe, type PastSession } from "@/lib/sessions";

type Poll = {
  id: string;
  name: string;
  course: string;
  // seed past sessions used only when no localStorage state exists yet
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
    name: "Test non-anonymous",
    course: "CS101 · Spring 2026",
    seedSessions: [{ id: "seed-1", name: "Apr 27, 2026 6:48 PM", endedAt: 0, participants: 41 }],
  },
];

const MyPolls = () => {
  const navigate = useNavigate();
  const [, force] = useState(0);

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

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My polls</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {polls.map((poll) => {
            const state = getPollState(poll.id);
            const sessions = state.past.length > 0 ? state.past : poll.seedSessions;
            const hasActive = !!state.active;

            return (
              <div key={poll.id} className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{poll.name}</h2>
                  {hasActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-primary">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="mb-5 text-sm text-muted-foreground">{poll.course}</p>

                {hasActive ? (
                  <Button
                    onClick={() => launchSession(poll)}
                    className="mb-5 h-10 w-full rounded-lg bg-warning text-warning-foreground hover:bg-warning/90"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resume session
                  </Button>
                ) : (
                  <Button
                    onClick={() => launchSession(poll)}
                    className="mb-5 h-10 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Launch new session
                  </Button>
                )}

                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground">
                    <History className="h-3.5 w-3.5" />
                    PAST SESSIONS
                  </div>
                  {sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No past sessions yet.</p>
                  ) : (
                    <ul className="divide-y">
                      {sessions.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                          <div className="flex items-center gap-2">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyPolls;
