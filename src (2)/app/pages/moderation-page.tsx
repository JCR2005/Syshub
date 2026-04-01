import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useRoles } from "../contexts/role-context";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Search,
  Bell,
  GraduationCap,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Trash2,
  CheckCircle,
  Eye,
  Flag,
} from "lucide-react";

interface Report {
  id: number;
  type: "thread" | "comment" | "project";
  title: string;
  content: string;
  reportedBy: string;
  reporter: string;
  reason: string;
  date: string;
  status: "pending" | "reviewed" | "resolved";
}

const mockReports: Report[] = [
  {
    id: 1,
    type: "comment",
    title: "Spam comment in React Hooks discussion",
    content: "This is a spam comment promoting external products...",
    reportedBy: "John Doe",
    reporter: "User123",
    reason: "Spam",
    date: "2026-03-17",
    status: "pending",
  },
  {
    id: 2,
    type: "thread",
    title: "Off-topic discussion about politics",
    content: "Thread discussing politics instead of technical content...",
    reportedBy: "Sarah Chen",
    reporter: "User456",
    reason: "Off-topic",
    date: "2026-03-16",
    status: "pending",
  },
  {
    id: 3,
    type: "comment",
    title: "Inappropriate language in database thread",
    content: "Comment contains inappropriate and offensive language...",
    reportedBy: "Maria Garcia",
    reporter: "User789",
    reason: "Inappropriate content",
    date: "2026-03-15",
    status: "pending",
  },
  {
    id: 4,
    type: "thread",
    title: "Duplicate thread about sorting algorithms",
    content: "This thread is a duplicate of an existing discussion...",
    reportedBy: "Ahmed Hassan",
    reporter: "User234",
    reason: "Duplicate",
    date: "2026-03-14",
    status: "reviewed",
  },
];

export function ModerationPage() {
  const navigate = useNavigate();
  const { hasRole } = useRoles();
  const [reports, setReports] = useState(mockReports);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "resolved">("pending");

  const isModerator = hasRole("moderator");

  // Redirect if not moderator
  useEffect(() => {
    if (!isModerator) {
      navigate("/dashboard");
    }
  }, [isModerator, navigate]);

  const handleResolve = (reportId: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" as const } : r))
    );
  };

  const handleReview = (reportId: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "reviewed" as const } : r))
    );
  };

  const filteredReports = reports.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-accent to-pink-accent rounded-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-accent to-pink-accent bg-clip-text text-transparent">
                  Syshub
                </span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/forum")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forum
                </button>
                <button
                  onClick={() => navigate("/upload")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Upload Project
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10 w-64 bg-muted border-border"
                />
              </div>

              <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-accent rounded-full" />
              </button>

              <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-accent to-red-500 flex items-center justify-center text-white text-sm font-semibold">
                  JD
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-pink-accent" />
                <h1 className="text-3xl font-bold">Moderation Queue</h1>
              </div>
              <p className="text-muted-foreground">
                Review and manage reported content
              </p>
            </div>

            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-lg px-4 py-2">
              {reports.filter((r) => r.status === "pending").length} Pending
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reports.filter((r) => r.status === "pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reports.filter((r) => r.status === "reviewed").length}
                </div>
                <div className="text-sm text-muted-foreground">Reviewed</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reports.filter((r) => r.status === "resolved").length}
                </div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={
              filter === "all"
                ? "bg-gradient-to-r from-blue-accent to-pink-accent"
                : "border-border"
            }
          >
            All Reports
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            variant={filter === "pending" ? "default" : "outline"}
            className={
              filter === "pending"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "border-border"
            }
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter("reviewed")}
            variant={filter === "reviewed" ? "default" : "outline"}
            className={
              filter === "reviewed"
                ? "bg-blue-500 hover:bg-blue-600"
                : "border-border"
            }
          >
            Reviewed
          </Button>
          <Button
            onClick={() => setFilter("resolved")}
            variant={filter === "resolved" ? "default" : "outline"}
            className={
              filter === "resolved"
                ? "bg-green-500 hover:bg-green-600"
                : "border-border"
            }
          >
            Resolved
          </Button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className={`p-6 border transition-all ${
                report.status === "pending"
                  ? "border-red-500/50 bg-red-500/5"
                  : report.status === "reviewed"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-green-500/30 bg-green-500/5"
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Report Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            report.type === "thread"
                              ? "border-blue-accent/30 bg-blue-accent/10 text-blue-accent"
                              : report.type === "comment"
                              ? "border-pink-accent/30 bg-pink-accent/10 text-pink-accent"
                              : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                          }
                        >
                          {report.type}
                        </Badge>
                        <h3 className="text-lg font-semibold">{report.title}</h3>
                      </div>
                      <Badge
                        className={
                          report.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : report.status === "reviewed"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3">
                      {report.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        Reported by {report.reportedBy}
                      </span>
                      <span>•</span>
                      <span>Reason: {report.reason}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-3 lg:min-w-[180px]">
                  <Button
                    variant="outline"
                    className="flex-1 lg:flex-none border-border"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  {report.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleReview(report.id)}
                        className="flex-1 lg:flex-none bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        onClick={() => handleResolve(report.id)}
                        className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                    </>
                  )}

                  {report.status === "reviewed" && (
                    <Button
                      onClick={() => handleResolve(report.id)}
                      className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="flex-1 lg:flex-none border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredReports.length === 0 && (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground">
                No {filter !== "all" && filter} reports found
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}