import { useState } from "react";
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
  Plus,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Filter,
  Star,
  Trash2,
  Shield,
  Pin,
  Flag,
  Edit,
} from "lucide-react";

const categories = [
  { id: "all", name: "All Topics", count: 142 },
  { id: "web", name: "Web Development", count: 45 },
  { id: "db", name: "Databases", count: 28 },
  { id: "network", name: "Networking", count: 22 },
  { id: "algorithms", name: "Algorithms", count: 31 },
  { id: "mobile", name: "Mobile Dev", count: 16 },
];

const mockThreads = [
  {
    id: 1,
    title: "How to properly implement JWT authentication in React?",
    author: "Maria Garcia",
    role: "Student",
    upvotes: 24,
    comments: 12,
    tags: ["React", "Security", "Help"],
    timeAgo: "2h ago",
    hasUpvoted: false,
    isFeatured: false,
    isPinned: false,
    hasReports: false,
  },
  {
    id: 2,
    title: "Best practices for database normalization",
    author: "Prof. James Wilson",
    role: "Auxiliar",
    upvotes: 56,
    comments: 23,
    tags: ["Database", "SQL", "Guide"],
    timeAgo: "5h ago",
    hasUpvoted: true,
    isFeatured: true,
    isPinned: true,
    hasReports: false,
  },
  {
    id: 3,
    title: "Need help with sorting algorithms complexity analysis",
    author: "Sarah Chen",
    role: "Student",
    upvotes: 15,
    comments: 8,
    tags: ["Algorithms", "Help", "Java"],
    timeAgo: "1d ago",
    hasUpvoted: false,
    isFeatured: false,
    isPinned: false,
    hasReports: true,
  },
  {
    id: 4,
    title: "Recommended resources for learning Docker and Kubernetes",
    author: "Ahmed Hassan",
    role: "Student",
    upvotes: 42,
    comments: 18,
    tags: ["DevOps", "Docker", "Discussion"],
    timeAgo: "1d ago",
    hasUpvoted: false,
    isFeatured: false,
    isPinned: false,
    hasReports: false,
  },
];

export function UnifiedForumPage() {
  const navigate = useNavigate();
  const { hasRole } = useRoles();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [threads, setThreads] = useState(mockThreads);

  const isAuxiliar = hasRole("auxiliar");
  const isModerator = hasRole("moderator");

  const handleVote = (threadId: number, isUpvote: boolean) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const delta = thread.hasUpvoted
            ? isUpvote
              ? 0
              : -2
            : isUpvote
            ? 1
            : -1;
          return {
            ...thread,
            upvotes: thread.upvotes + delta,
            hasUpvoted: isUpvote ? !thread.hasUpvoted : false,
          };
        }
        return thread;
      })
    );
  };

  const handleFeature = (threadId: number) => {
    if (!isAuxiliar) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? { ...thread, isFeatured: !thread.isFeatured }
          : thread
      )
    );
  };

  const handlePin = (threadId: number) => {
    if (!isAuxiliar) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, isPinned: !thread.isPinned } : thread
      )
    );
  };

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
                  className="text-sm font-medium text-foreground"
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
                  placeholder="Search discussions..."
                  className="pl-10 w-64 bg-muted border-border"
                />
              </div>

              <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-accent rounded-full" />
              </button>

              <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-accent to-pink-accent flex items-center justify-center text-white text-sm font-semibold">
                  JD
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1">
            <Card className="p-5 border-border sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-accent" />
                <h3 className="font-semibold">Categories</h3>
              </div>

              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-blue-accent/20 to-pink-accent/20 text-foreground border border-blue-accent/30"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="outline" className="border-border text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>

              <Button className="w-full mt-6 bg-gradient-to-r from-blue-accent to-pink-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Discussion
              </Button>
            </Card>

            {/* Role-Based Tools */}
            {(isAuxiliar || isModerator) && (
              <Card className="p-5 border-border mt-4 bg-gradient-to-br from-blue-accent/10 to-pink-accent/10">
                <h3 className="font-semibold mb-3">Special Tools</h3>
                <div className="space-y-2 text-sm">
                  {isAuxiliar && (
                    <>
                      <div className="flex items-center gap-2 text-yellow-500">
                        <Star className="w-4 h-4" />
                        <span>Feature Best Projects</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-500">
                        <Pin className="w-4 h-4" />
                        <span>Pin Important Threads</span>
                      </div>
                    </>
                  )}
                  {isModerator && (
                    <>
                      <div className="flex items-center gap-2 text-pink-accent">
                        <Shield className="w-4 h-4" />
                        <span>Moderate Content</span>
                      </div>
                      <div className="flex items-center gap-2 text-pink-accent">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Reports</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </aside>

          {/* Main Content - Thread Feed */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Sys-Reddit</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Community discussions and knowledge sharing
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {threads.map((thread) => (
                <Card
                  key={thread.id}
                  className={`p-5 border transition-colors ${
                    thread.isFeatured
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : thread.hasReports && isModerator
                      ? "border-red-500/50 bg-red-500/5"
                      : "border-border hover:border-blue-accent/50"
                  }`}
                >
                  {/* Thread Badges */}
                  {(thread.isFeatured || thread.isPinned || (thread.hasReports && isModerator)) && (
                    <div className="flex gap-2 mb-3">
                      {thread.isPinned && (
                        <Badge className="bg-blue-accent/20 text-blue-accent border-blue-accent/30 text-xs">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {thread.isFeatured && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {thread.hasReports && isModerator && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          <Flag className="w-3 h-3 mr-1" />
                          Reported
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    {/* Voting Section (All Users) */}
                    <div className="flex flex-col items-center gap-1 min-w-[40px]">
                      <button
                        onClick={() => handleVote(thread.id, true)}
                        className={`p-1 rounded hover:bg-muted transition-colors ${
                          thread.hasUpvoted
                            ? "text-blue-accent"
                            : "text-muted-foreground"
                        }`}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold">
                        {thread.upvotes}
                      </span>
                      <button
                        onClick={() => handleVote(thread.id, false)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Thread Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-2 hover:text-blue-accent cursor-pointer transition-colors">
                        {thread.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {thread.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-border bg-muted text-xs"
                          >
                            [{tag}]
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <span>Posted by</span>
                          <span className="font-medium text-foreground">
                            {thread.author}
                          </span>
                          <Badge
                            className={
                              thread.role === "Auxiliar"
                                ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs"
                                : "bg-blue-accent/20 text-blue-accent border-blue-accent/30 text-xs"
                            }
                          >
                            {thread.role}
                          </Badge>
                        </div>

                        <span>•</span>
                        <span>{thread.timeAgo}</span>

                        <span>•</span>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>{thread.comments} comments</span>
                        </button>
                      </div>

                      {/* Role-Based Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                        {/* Auxiliar Tools */}
                        {isAuxiliar && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeature(thread.id)}
                              className={
                                thread.isFeatured
                                  ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
                                  : "border-border"
                              }
                            >
                              <Star className="w-4 h-4 mr-2" />
                              {thread.isFeatured ? "Unfeatured" : "Feature"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePin(thread.id)}
                              className={
                                thread.isPinned
                                  ? "border-blue-accent/50 bg-blue-accent/10 text-blue-accent"
                                  : "border-border"
                              }
                            >
                              <Pin className="w-4 h-4 mr-2" />
                              {thread.isPinned ? "Unpin" : "Pin"}
                            </Button>
                          </>
                        )}

                        {/* Moderator Tools */}
                        {isModerator && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button variant="outline" className="border-border">
                Load More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
