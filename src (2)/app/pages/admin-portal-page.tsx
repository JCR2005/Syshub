import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Search,
  Users,
  Shield,
  Settings,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  BookOpen,
  Tag,
  BarChart3,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  status: "active" | "suspended";
  roles: ("auxiliar" | "moderator")[];
  joinedDate: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  area: string;
  students: number;
}

interface Report {
  id: string;
  type: "thread" | "comment" | "project";
  title: string;
  reportedBy: string;
  reason: string;
  date: string;
  status: "pending" | "reviewed" | "resolved";
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@university.edu",
    studentId: "CS-2024-1234",
    status: "active",
    roles: [],
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Prof. James Wilson",
    email: "j.wilson@university.edu",
    studentId: "TA-2023-0042",
    status: "active",
    roles: ["auxiliar"],
    joinedDate: "2023-09-01",
  },
  {
    id: "3",
    name: "Sarah Chen",
    email: "sarah.chen@university.edu",
    studentId: "CS-2024-1756",
    status: "active",
    roles: ["moderator"],
    joinedDate: "2024-02-20",
  },
  {
    id: "4",
    name: "Maria Garcia",
    email: "maria.garcia@university.edu",
    studentId: "CS-2024-1923",
    status: "active",
    roles: ["auxiliar", "moderator"],
    joinedDate: "2024-01-10",
  },
];

const mockCourses: Course[] = [
  { id: "1", name: "Web Development", code: "CS-301", area: "Dev", students: 45 },
  { id: "2", name: "Machine Learning", code: "AI-401", area: "AI", students: 38 },
  { id: "3", name: "Network Security", code: "IT-305", area: "Infra", students: 32 },
  { id: "4", name: "Database Systems", code: "CS-302", area: "Dev", students: 50 },
];

const mockReports: Report[] = [
  {
    id: "1",
    type: "comment",
    title: "Spam comment in React discussion",
    reportedBy: "John Doe",
    reason: "Spam",
    date: "2026-03-17",
    status: "pending",
  },
  {
    id: "2",
    type: "thread",
    title: "Inappropriate content in forum",
    reportedBy: "Sarah Chen",
    reason: "Inappropriate",
    date: "2026-03-16",
    status: "pending",
  },
  {
    id: "3",
    type: "project",
    title: "Plagiarized project submission",
    reportedBy: "Prof. Wilson",
    reason: "Plagiarism",
    date: "2026-03-15",
    status: "reviewed",
  },
];

export function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<"users" | "system" | "moderation">("users");
  const [users, setUsers] = useState(mockUsers);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleToggleUserRole = (userId: string, role: "auxiliar" | "moderator") => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const hasRole = user.roles.includes(role);
          return {
            ...user,
            roles: hasRole
              ? user.roles.filter((r) => r !== role)
              : [...user.roles, role],
          };
        }
        return user;
      })
    );
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "suspended" : "active",
            }
          : user
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Portal</h1>
                <p className="text-xs text-muted-foreground">Syshub Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Administrator
              </Badge>
              <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                  AD
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === "users"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </div>
            {activeTab === "users" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-accent to-pink-accent" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === "system"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System Classification
            </div>
            {activeTab === "system" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-accent to-pink-accent" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("moderation")}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === "moderation"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Global Moderation
              {mockReports.filter((r) => r.status === "pending").length > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  {mockReports.filter((r) => r.status === "pending").length}
                </Badge>
              )}
            </div>
            {activeTab === "moderation" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-accent to-pink-accent" />
            )}
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Create, manage users, and assign roles
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-accent to-pink-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 bg-muted border-border"
                />
              </div>
            </div>

            <Card className="border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Name</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Email</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">ID</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Roles</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-border hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Joined {new Date(user.joinedDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm">{user.studentId}</td>
                        <td className="px-6 py-4">
                          {editingUser === user.id ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`auxiliar-${user.id}`}
                                  checked={user.roles.includes("auxiliar")}
                                  onCheckedChange={() =>
                                    handleToggleUserRole(user.id, "auxiliar")
                                  }
                                />
                                <Label
                                  htmlFor={`auxiliar-${user.id}`}
                                  className="text-xs cursor-pointer"
                                >
                                  Auxiliar
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`moderator-${user.id}`}
                                  checked={user.roles.includes("moderator")}
                                  onCheckedChange={() =>
                                    handleToggleUserRole(user.id, "moderator")
                                  }
                                />
                                <Label
                                  htmlFor={`moderator-${user.id}`}
                                  className="text-xs cursor-pointer"
                                >
                                  Moderator
                                </Label>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              <Badge
                                variant="outline"
                                className="border-blue-accent/30 bg-blue-accent/10 text-blue-accent text-xs"
                              >
                                Student
                              </Badge>
                              {user.roles.includes("auxiliar") && (
                                <Badge
                                  variant="outline"
                                  className="border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs"
                                >
                                  Auxiliar
                                </Badge>
                              )}
                              {user.roles.includes("moderator") && (
                                <Badge
                                  variant="outline"
                                  className="border-pink-accent/30 bg-pink-accent/10 text-pink-accent text-xs"
                                >
                                  Moderator
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={
                              user.status === "active"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {editingUser === user.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingUser(null)}
                                  className="h-8"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingUser(null)}
                                  className="h-8"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingUser(user.id)}
                                  className="h-8"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleUserStatus(user.id)}
                                  className="h-8"
                                >
                                  {user.status === "active" ? (
                                    <X className="w-4 h-4 text-red-400" />
                                  ) : (
                                    <Check className="w-4 h-4 text-green-400" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* System Classification Tab */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">System Classification</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage courses and tech areas
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-accent to-pink-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>

            {/* Tech Areas */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-accent" />
                <h3 className="font-semibold">Tech Areas</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
                  AI
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                  Dev
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
                  Infra
                </Badge>
                <Button size="sm" variant="outline" className="border-border">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Area
                </Button>
              </div>
            </Card>

            {/* Courses */}
            <Card className="border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pink-accent" />
                  <h3 className="font-semibold">Courses</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Code</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Name</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Area</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Students</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCourses.map((course) => (
                      <tr key={course.id} className="border-t border-border hover:bg-muted/50">
                        <td className="px-6 py-4 font-medium">{course.code}</td>
                        <td className="px-6 py-4">{course.name}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={
                              course.area === "AI"
                                ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                                : course.area === "Dev"
                                ? "border-green-500/30 bg-green-500/10 text-green-400"
                                : "border-purple-500/30 bg-purple-500/10 text-purple-400"
                            }
                          >
                            {course.area}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {course.students}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Global Moderation Tab */}
        {activeTab === "moderation" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Global Moderation</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Review and manage systemic reports
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6 border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {mockReports.filter((r) => r.status === "pending").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {mockReports.filter((r) => r.status === "reviewed").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Reviewed</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {mockReports.filter((r) => r.status === "resolved").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Resolved</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              {mockReports.map((report) => (
                <Card key={report.id} className="p-6 border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
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
                        <h4 className="font-semibold">{report.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Reported by {report.reportedBy}</span>
                        <span>•</span>
                        <span>Reason: {report.reason}</span>
                        <span>•</span>
                        <span>{report.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                      {report.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="border-border">
                            Review
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
