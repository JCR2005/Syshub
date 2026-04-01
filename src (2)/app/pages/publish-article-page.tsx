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
  FileText,
  Send,
} from "lucide-react";

export function PublishArticlePage() {
  const navigate = useNavigate();
  const { hasRole } = useRoles();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("announcement");
  const [tags, setTags] = useState<string[]>([]);

  const isModerator = hasRole("moderator");

  // Redirect if not moderator
  useEffect(() => {
    if (!isModerator) {
      navigate("/dashboard");
    }
  }, [isModerator, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle article publish
    alert("Article published successfully!");
    navigate("/forum");
  };

  const categories = [
    { id: "announcement", name: "Announcement", color: "blue" },
    { id: "tutorial", name: "Tutorial", color: "green" },
    { id: "news", name: "News", color: "purple" },
    { id: "policy", name: "Policy", color: "pink" },
  ];

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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-accent to-red-500 flex items-center justify-center text-white text-sm font-semibold">
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
            <FileText className="w-8 h-8 text-pink-accent" />
            <h1 className="text-3xl font-bold">Publish Article</h1>
          </div>
          <p className="text-muted-foreground">
            Share important announcements and articles with the community
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 border-border space-y-6">
            {/* Category */}
            <div className="space-y-3">
              <Label>Article Category</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      category === cat.id
                        ? "border-pink-accent bg-pink-accent/10 text-foreground"
                        : "border-border bg-muted text-muted-foreground hover:border-pink-accent/50"
                    }`}
                  >
                    <div className="text-sm font-medium">{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Article Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Important Update: New Forum Guidelines"
                className="bg-muted border-border"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Article Content <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                className="w-full min-h-[300px] p-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-pink-accent"
                required
              />
              <p className="text-xs text-muted-foreground">
                Supports markdown formatting
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                placeholder="e.g., guidelines, rules, announcement"
                className="bg-muted border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    setTags([...tags, e.currentTarget.value.trim()]);
                    e.currentTarget.value = "";
                  }
                }}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-pink-accent/30 bg-pink-accent/10 text-pink-accent"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        className="ml-2 hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Press Enter to add a tag
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-accent to-red-500 hover:opacity-90"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish Article
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

        {/* Preview Section */}
        <Card className="p-6 border-border mt-6">
          <h3 className="font-semibold mb-4">Preview</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-accent/20 text-pink-accent border-pink-accent/30">
                {categories.find((c) => c.id === category)?.name || "Category"}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold">
              {title || "Your article title will appear here"}
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {content || "Your article content will appear here..."}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-border">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}