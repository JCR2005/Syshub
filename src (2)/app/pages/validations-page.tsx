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
  FileCheck,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Filter,
} from "lucide-react";

interface ProjectSubmission {
  id: number;
  title: string;
  student: string;
  studentId: string;
  submittedDate: string;
  description: string;
  techStack: string[];
  status: "pending" | "approved" | "rejected";
  attachments: number;
}

const mockProjects: ProjectSubmission[] = [
  {
    id: 1,
    title: "REST API with JWT Authentication",
    student: "Sarah Chen",
    studentId: "CS-2024-1756",
    submittedDate: "2026-03-15",
    description: "A RESTful API built with Node.js and Express featuring JWT-based authentication",
    techStack: ["Node.js", "Express", "MongoDB", "JWT"],
    status: "pending",
    attachments: 3,
  },
  {
    id: 2,
    title: "Mobile Task Manager Application",
    student: "Carlos Rodriguez",
    studentId: "CS-2024-1892",
    submittedDate: "2026-03-14",
    description: "React Native app for managing daily tasks with Firebase backend",
    techStack: ["React Native", "Firebase", "Redux"],
    status: "pending",
    attachments: 5,
  },
  {
    id: 3,
    title: "Machine Learning Recommendation System",
    student: "Ahmed Hassan",
    studentId: "CS-2024-1423",
    submittedDate: "2026-03-13",
    description: "Collaborative filtering recommendation system using Python and scikit-learn",
    techStack: ["Python", "scikit-learn", "Pandas"],
    status: "pending",
    attachments: 2,
  },
  {
    id: 4,
    title: "E-Commerce Platform Frontend",
    student: "Emily Zhang",
    studentId: "CS-2024-1678",
    submittedDate: "2026-03-12",
    description: "Modern e-commerce frontend with React and Tailwind CSS",
    techStack: ["React", "Tailwind CSS", "Redux"],
    status: "approved",
    attachments: 4,
  },
];

export function ValidationsPage() {
  const navigate = useNavigate();
  const { hasRole } = useRoles();
  const [projects, setProjects] = useState(mockProjects);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const isAuxiliar = hasRole("auxiliar");

  // Redirect if not auxiliar
  useEffect(() => {
    if (!isAuxiliar) {
      navigate("/dashboard");
    }
  }, [isAuxiliar, navigate]);

  const handleApprove = (projectId: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "approved" as const } : p))
    );
  };

  const handleReject = (projectId: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "rejected" as const } : p))
    );
  };

  const filteredProjects = projects.filter((p) => filter === "all" || p.status === filter);

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
                  placeholder="Search projects..."
                  className="pl-10 w-64 bg-muted border-border"
                />
              </div>

              <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-accent rounded-full" />
              </button>

              <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold">
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
                <FileCheck className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold">Project Validations</h1>
              </div>
              <p className="text-muted-foreground">
                Review and approve student project submissions
              </p>
            </div>

            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-lg px-4 py-2">
              {projects.filter((p) => p.status === "pending").length} Pending
            </Badge>
          </div>
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
            All Projects
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
            onClick={() => setFilter("approved")}
            variant={filter === "approved" ? "default" : "outline"}
            className={
              filter === "approved"
                ? "bg-green-500 hover:bg-green-600"
                : "border-border"
            }
          >
            Approved
          </Button>
          <Button
            onClick={() => setFilter("rejected")}
            variant={filter === "rejected" ? "default" : "outline"}
            className={
              filter === "rejected"
                ? "bg-red-500 hover:bg-red-600"
                : "border-border"
            }
          >
            Rejected
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`p-6 border transition-all ${
                project.status === "pending"
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : project.status === "approved"
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Project Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <Badge
                        className={
                          project.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                            : project.status === "approved"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{project.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="border-border bg-muted"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {project.student} ({project.studentId})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.submittedDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {project.attachments} files
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-3 lg:min-w-[200px]">
                  <Button
                    variant="outline"
                    className="flex-1 lg:flex-none border-border"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>

                  {project.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleApprove(project.id)}
                        className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(project.id)}
                        variant="outline"
                        className="flex-1 lg:flex-none border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground">
                No {filter !== "all" && filter} projects found
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}