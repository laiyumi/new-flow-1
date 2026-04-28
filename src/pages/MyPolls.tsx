import { useNavigate } from "react-router-dom";
import { BarChart3, MinusCircle, Pencil, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

type Poll = {
  id: string;
  name: string;
  course: string;
  date: string;
  time: string;
  status: "finished" | "draft" | "live";
};

const polls: Poll[] = [
  {
    id: "test-poll",
    name: "Test Poll",
    course: "CS101 · Spring 2026",
    date: "Apr 27, 2026",
    time: "7:19 PM",
    status: "finished",
  },
  {
    id: "test-non-anonymous",
    name: "Test non-anonymous",
    course: "CS101 · Spring 2026",
    date: "Apr 27, 2026",
    time: "6:48 PM",
    status: "finished",
  },
];

const StatusBadge = ({ status }: { status: Poll["status"] }) => {
  const label = status.toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-3 py-1 text-[11px] font-bold tracking-widest text-info">
      <MinusCircle className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

const MyPolls = () => {
  const navigate = useNavigate();

  const openPresenter = (poll: Poll) => {
    navigate(`/polls/${poll.id}`, { state: { name: poll.name } });
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
            <button
              key={poll.id}
              onClick={() => openPresenter(poll)}
              className="group rounded-2xl bg-card p-6 text-left shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="mb-4 flex items-start justify-between">
                <StatusBadge status={poll.status} />
                <div className="text-sm text-muted-foreground">
                  {poll.date} · {poll.time}
                </div>
              </div>

              <h2 className="mb-2 text-xl font-bold text-foreground group-hover:text-primary">
                {poll.name}
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">{poll.course}</p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-10 flex-1 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPresenter(poll);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Present
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/polls/${poll.id}`, { state: { name: poll.name, tab: "results" } });
                  }}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Results
                </Button>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPolls;
