import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { GraduationCap } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "auxiliar">("student");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-gradient-to-br from-blue-accent to-pink-accent rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-accent to-pink-accent bg-clip-text text-transparent">
              Syshub
            </span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome to the
              <br />
              <span className="bg-gradient-to-r from-blue-accent to-pink-accent bg-clip-text text-transparent">
                Engineering Hub
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Connect, collaborate, and share your projects with fellow computer science students.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-accent/20 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <div className="font-semibold text-foreground">Share Knowledge</div>
              <div className="text-sm">Browse academic projects and repositories</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-pink-accent/20 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <div className="font-semibold text-foreground">Community Forum</div>
              <div className="text-sm">Get help from TAs and peers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-accent to-pink-accent rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-accent to-pink-accent bg-clip-text text-transparent">
              Syshub
            </span>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Enter your institutional credentials"
                : "Join the engineering community"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Institutional Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted border-border"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-muted border-border"
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="space-y-2">
                  <Label>Login as</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                        role === "student"
                          ? "border-blue-accent bg-blue-accent/10 text-foreground"
                          : "border-border bg-muted text-muted-foreground hover:border-blue-accent/50"
                      }`}
                    >
                      <div className="font-medium">Student</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("auxiliar")}
                      className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                        role === "auxiliar"
                          ? "border-yellow-500 bg-yellow-500/10 text-foreground"
                          : "border-border bg-muted text-muted-foreground hover:border-yellow-500/50"
                      }`}
                    >
                      <div className="font-medium">Teaching Assistant</div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-accent to-pink-accent hover:opacity-90 transition-opacity"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-accent hover:underline font-medium"
              >
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}