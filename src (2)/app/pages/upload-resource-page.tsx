import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useRoles } from "../contexts/role-context";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Search,
  Bell,
  GraduationCap,
  ArrowLeft,
  Upload,
  X,
  FileText,
  Video,
  BookOpen,
} from "lucide-react";

export function UploadResourcePage() {
  const navigate = useNavigate();
  const { hasRole } = useRoles();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<"video" | "guide" | "document">("video");
  const [files, setFiles] = useState<File[]>([]);

  const isAuxiliar = hasRole("auxiliar");

  // Redirect if not auxiliar
  useEffect(() => {
    if (!isAuxiliar) {
      navigate("/dashboard");
    }
  }, [isAuxiliar, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle resource upload
    alert("Resource uploaded successfully!");
    navigate("/dashboard");
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                  JD
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Upload Teaching Resource</h1>
          </div>
          <p className="text-muted-foreground">
            Share educational materials with students
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 border-border space-y-6">
            {/* Resource Type */}
            <div className="space-y-3">
              <Label>Resource Type</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setResourceType("video")}
                  className={`p-4 rounded-lg border transition-all ${
                    resourceType === "video"
                      ? "border-yellow-500 bg-yellow-500/10 text-foreground"
                      : "border-border bg-muted text-muted-foreground hover:border-yellow-500/50"
                  }`}
                >
                  <Video className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Video Tutorial</div>
                </button>

                <button
                  type="button"
                  onClick={() => setResourceType("guide")}
                  className={`p-4 rounded-lg border transition-all ${
                    resourceType === "guide"
                      ? "border-yellow-500 bg-yellow-500/10 text-foreground"
                      : "border-border bg-muted text-muted-foreground hover:border-yellow-500/50"
                  }`}
                >
                  <BookOpen className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Guide</div>
                </button>

                <button
                  type="button"
                  onClick={() => setResourceType("document")}
                  className={`p-4 rounded-lg border transition-all ${
                    resourceType === "document"
                      ? "border-yellow-500 bg-yellow-500/10 text-foreground"
                      : "border-border bg-muted text-muted-foreground hover:border-yellow-500/50"
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Document</div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Resource Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Advanced React Patterns Tutorial"
                className="bg-muted border-border"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the resource..."
                className="w-full min-h-[120px] p-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-accent"
                required
              />
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label>
                Upload Files <span className="text-red-500">*</span>
              </Label>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="w-12 h-12 text-yellow-500" />
                  <div>
                    <p className="font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, MP4, ZIP files (max 100MB)
                    </p>
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-medium text-sm">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Resource
              </Button>
              <Button
                type="button"
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}