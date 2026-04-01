import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { GraduationCap, Users, Shield, Settings } from "lucide-react";

export function DemoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-accent to-pink-accent rounded-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-accent to-pink-accent bg-clip-text text-transparent">
              Syshub
            </span>
          </div>
          <h1 className="text-3xl font-bold">Welcome to Syshub Platform</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A unified university platform with modular role-based access control
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Front Office - Unified Platform */}
          <Card className="p-8 border-border hover:border-blue-accent/50 transition-all hover:scale-105">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-accent to-pink-accent flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Front Office</h2>
                <p className="text-muted-foreground mb-4">
                  Unified platform for Students, Auxiliars, and Moderators
                </p>
                <div className="space-y-2 text-sm text-muted-foreground text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-accent">•</span>
                    <span><strong>Student</strong> (Base): Upload projects, participate in forums</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    <span><strong>Auxiliar</strong> (Add-on): Curate projects, upload resources</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-pink-accent">•</span>
                    <span><strong>Moderator</strong> (Add-on): Moderate forums, publish articles</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gradient-to-r from-blue-accent to-pink-accent hover:opacity-90"
                >
                  Enter Platform
                </Button>
                <Button
                  onClick={() => navigate("/forum")}
                  variant="outline"
                  className="w-full border-border"
                >
                  View Forum
                </Button>
              </div>
            </div>
          </Card>

          {/* Back Office - Admin Portal */}
          <Card className="p-8 border-border hover:border-red-500/50 transition-all hover:scale-105">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Back Office</h2>
                <p className="text-muted-foreground mb-4">
                  Isolated admin portal for platform management
                </p>
                <div className="space-y-2 text-sm text-muted-foreground text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>User Management:</strong> Create & assign roles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>System Classification:</strong> Manage courses & areas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>Global Moderation:</strong> Review system reports</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/admin")}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
                >
                  Admin Portal
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border bg-gradient-to-br from-blue-accent/5 to-pink-accent/5">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-blue-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">🧪 Role Testing Menu</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use the floating <strong>Role Testing Menu</strong> (bottom-right corner) to toggle Auxiliar and Moderator permissions in real-time. The UI will dynamically show/hide features based on your active roles.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  size="sm"
                  className="border-border"
                >
                  Login Page
                </Button>
                <Button
                  onClick={() => navigate("/upload")}
                  variant="outline"
                  size="sm"
                  className="border-border"
                >
                  Upload Project
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
