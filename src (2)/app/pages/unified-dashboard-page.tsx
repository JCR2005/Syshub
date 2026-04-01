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
  Upload,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageCircle,
  Shield,
  FileCheck,
  Star,
  BookOpen,
  Award,
  Eye,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";

const myProjects = [
  {
    id: 1,
    title: "Full-Stack E-Commerce Platform",
    date: "2026-03-10",
    status: "approved",
    upvotes: 42,
    comments: 15,
    tech: ["React", "Node.js", "MongoDB"],
  },
  {
    id: 2,
    title: "Machine Learning Model for Predictions",
    date: "2026-03-05",
    status: "pending",
    upvotes: 28,
    comments: 8,
    tech: ["Python", "TensorFlow"],
  },
];

const myResources = [
  {
    id: 1,
    title: "Advanced React Patterns - Video Tutorial",
    date: "2026-03-12",
    type: "Video",
    views: 234,
  },
  {
    id: 2,
    title: "Database Design Best Practices Guide",
    date: "2026-03-08",
    type: "Guide",
    views: 189,
  },
];

const projectsForValidation = [
  {
    id: 1,
    title: "REST API with Authentication",
    student: "Sarah Chen",
    submittedDate: "2026-03-15",
    status: "pending",
  },
  {
    id: 2,
    title: "Mobile Task Manager App",
    student: "Carlos Rodriguez",
    submittedDate: "2026-03-14",
    status: "pending",
  },
];

const reportedContent = [
  {
    id: 1,
    type: "comment",
    thread: "Help with React Hooks",
    reporter: "User123",
    reason: "Spam",
    date: "2026-03-17",
  },
  {
    id: 2,
    type: "thread",
    thread: "Off-topic discussion",
    reporter: "User456",
    reason: "Inappropriate content",
    date: "2026-03-16",
  },
];

export function UnifiedDashboardPage() {
  const navigate = useNavigate();
  const { hasRole } = useRoles();

  const isAuxiliar = hasRole("auxiliar");
  const isModerator = hasRole("moderator");

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
                  className="text-sm font-medium text-foreground"
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
                  placeholder="Search..."
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
        {/* Profile Card */}
        <Card className="p-6 mb-8 border-border bg-gradient-to-br from-card to-muted/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-accent to-pink-accent flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <div>
                <h2 className="text-2xl font-bold">John Doe</h2>
                <p className="text-muted-foreground">ID: CS-2024-1234</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-blue-accent/20 text-blue-accent border-blue-accent/30">
                    Student
                  </Badge>
                  {isAuxiliar && (
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Auxiliar
                    </Badge>
                  )}
                  {isModerator && (
                    <Badge className="bg-pink-accent/20 text-pink-accent border-pink-accent/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Moderator
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/upload")}
                className="bg-gradient-to-r from-blue-accent to-pink-accent hover:opacity-90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Project
              </Button>
              {isAuxiliar && (
                <Button
                  onClick={() => navigate("/upload-resource")}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
              )}
              {isModerator && (
                <Button
                  onClick={() => navigate("/publish-article")}
                  variant="outline"
                  className="border-pink-accent/30 text-pink-accent hover:bg-pink-accent/10"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Publish Article
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Projects (Base - Student) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">My Projects</h3>
                <Button variant="ghost" className="text-blue-accent">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {myProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-5 border-border hover:border-blue-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold mb-1">{project.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(project.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {project.upvotes} upvotes
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {project.comments} comments
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="border-border bg-muted"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Badge
                        className={
                          project.status === "approved"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {project.status === "approved" ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Auxiliar Resources */}
            {isAuxiliar && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold">My Teaching Resources</h3>
                  </div>
                  <Button variant="ghost" className="text-yellow-500">
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {myResources.map((resource) => (
                    <Card
                      key={resource.id}
                      className="p-5 border-border hover:border-yellow-500/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{resource.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline" className="border-border text-xs">
                              {resource.type}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(resource.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {resource.views} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Projects for Validation (Auxiliar) */}
            {isAuxiliar && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold">Projects for Validation</h3>
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      {projectsForValidation.length}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => navigate("/validations")}
                    variant="ghost"
                    className="text-yellow-500"
                  >
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {projectsForValidation.slice(0, 2).map((project) => (
                    <Card
                      key={project.id}
                      className="p-5 border-border hover:border-yellow-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{project.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{project.student}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(project.submittedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-yellow-500/30">
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Forum Activity */}
            <Card className="p-5 border-border">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-pink-accent" />
                <h3 className="font-semibold">Forum Activity</h3>
              </div>

              <div className="space-y-4">
                <div className="pb-4 border-b border-border">
                  <h4 className="text-sm font-medium mb-1">
                    How to optimize React performance?
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>24 upvotes</span>
                    <span>12 comments</span>
                  </div>
                </div>
                <div className="pb-4 border-b border-border">
                  <h4 className="text-sm font-medium mb-1">
                    Database normalization best practices
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>18 upvotes</span>
                    <span>8 comments</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/forum")}
                variant="outline"
                className="w-full mt-4 border-border"
              >
                View Forum
              </Button>
            </Card>

            {/* Moderation Queue (Moderator) */}
            {isModerator && (
              <Card className="p-5 border-border bg-gradient-to-br from-pink-accent/10 to-red-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-pink-accent" />
                  <h3 className="font-semibold">Moderation Queue</h3>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {reportedContent.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {reportedContent.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-card/50 rounded border border-border"
                    >
                      <div className="text-sm font-medium mb-1">{item.thread}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.reason} • {item.date}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate("/moderation")}
                  variant="outline"
                  className="w-full mt-4 border-pink-accent/30 text-pink-accent"
                >
                  Review Reports
                </Button>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-5 border-border">
              <h3 className="font-semibold mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Projects</span>
                  <span className="font-bold text-lg">{myProjects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Upvotes</span>
                  <span className="font-bold text-lg">70</span>
                </div>
                {isAuxiliar && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resources Shared</span>
                    <span className="font-bold text-lg">{myResources.length}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
