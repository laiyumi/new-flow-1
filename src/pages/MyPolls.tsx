import { useNavigate } from "react-router-dom";
import { BarChart3, Play, Activity, History } from "lucide-react";
import { Button } from "@/components/ui/button";

type Session = {
  id: string;
  name: string;
};

type Poll = {
  id: string;
  name: string;
  course: string;
  sessions: Session[];
};

const polls: Poll[] = [
  {
    id: "test-poll",
    name: "Test Poll",
    course: "CS101 · Spring 2026",
    sessions: [
      { id: "s1", name: "Apr 27, 2026 7:19 PM" },
      { id: "s2", name: "Apr 20, 2026 7:05 PM" },
    ],
  },
  {
    id: "test-non-anonymous",
    name: "Test non-anonymous",
    course: "CS101 · Spring 2026",
    sessions: [
      { id: "s1", name: "Apr 27, 2026 6:48 PM" },
    ],
  },
];

const MyPolls = () => {
  const navigate = useNavigate();

  const launchSession = (poll: Poll) => {
    navigate(`/polls/${poll.id}`, { state: { name: poll.name } });
  };

  const viewResults = (poll: Poll, session: Session) => {
    navigate(`/polls/${poll.id}`, {
      state: { name: poll.name, tab: "results", sessionName: session.name },
    });
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My polls</h1>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border"
            >
              <h2 className="mb-1 text-xl font-bold text-foreground">{poll.name}</h2>
              <p className="mb-5 text-sm text-muted-foreground">{poll.course}</p>

              <Button
                onClick={() => launchSession(poll)}
                className="mb-5 h-10 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4" />
                Launch new session
              </Button>

              <div className="border-t pt-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  PAST SESSIONS
                </div>
                {poll.sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No past sessions yet.</p>
                ) : (
                  <ul className="divide-y">
                    {poll.sessions.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-foreground">{s.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewResults(poll, s)}
                          className="h-8 rounded-md"
                        >
                          <Activity className="mr-2 h-3.5 w-3.5" />
                          View results
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPolls;
