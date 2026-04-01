import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Bell,
  GraduationCap,
  CloudUpload,
  X,
  FileArchive,
  FileText,
} from "lucide-react";

export function UploadProjectPage() {
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.name.endsWith(".zip") ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".rar")
    );
    
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate("/dashboard");
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pdf")) return <FileText className="w-5 h-5" />;
    return <FileArchive className="w-5 h-5" />;
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
                  className="text-sm font-medium text-foreground"
                >
                  Upload Project
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-accent rounded-full" />
              </button>

              <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-accent to-pink-accent flex items-center justify-center text-white text-sm font-semibold">
                  AS
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Academic Project</h1>
          <p className="text-muted-foreground">
            Share your work with the community and get feedback from peers and instructors
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 border-border space-y-8">
            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g., E-Commerce Web Application with React"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-muted border-border"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your project, its features, and what you learned..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-muted border-border min-h-[150px] resize-y"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50 characters. Be descriptive!
              </p>
            </div>

            {/* Tech Stack Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tech Stack / Tags</Label>
              <Input
                id="tags"
                placeholder="Type a technology and press Enter (e.g., React, Python, MongoDB)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-muted border-border"
              />
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-gradient-to-r from-blue-accent/20 to-pink-accent/20 text-foreground border-blue-accent/30 pl-3 pr-1 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Add technologies used in your project
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Project Files</Label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? "border-blue-accent bg-blue-accent/5"
                    : "border-border bg-muted/50"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".zip,.pdf,.rar"
                  multiple
                  onChange={handleFileInput}
                />
                
                <CloudUpload
                  className={`w-16 h-16 mx-auto mb-4 ${
                    isDragging ? "text-blue-accent" : "text-muted-foreground"
                  }`}
                />
                
                <h3 className="font-semibold mb-2">
                  Drag and drop files here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                
                <Button
                  type="button"
                  variant="outline"
                  className="border-border"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Browse Files
                </Button>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: .zip, .pdf, .rar (Max 50MB)
                </p>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-accent/20 rounded text-blue-accent">
                          {getFileIcon(file.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1 border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-accent to-pink-accent hover:opacity-90"
              >
                Publish Repository
              </Button>
            </div>
          </Card>
        </form>

        {/* Info Card */}
        <Card className="mt-6 p-6 border-border bg-gradient-to-br from-blue-accent/5 to-pink-accent/5">
          <h3 className="font-semibold mb-2">📋 Submission Guidelines</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Make sure your project files are properly compressed</li>
            <li>Include a README.md file explaining how to run your project</li>
            <li>Remove any sensitive information or API keys</li>
            <li>Projects are reviewed by TAs within 2-3 business days</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
