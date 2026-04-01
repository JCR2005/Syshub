import { useState } from "react";
import { useRoles } from "../contexts/role-context";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Settings, X, Shield, Star, UserCog } from "lucide-react";
import { Button } from "./ui/button";

export function RoleTestingMenu() {
  const { roles, hasRole, toggleRole } = useRoles();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-blue-accent to-pink-accent rounded-full shadow-lg hover:scale-110 transition-transform"
        title="Role Testing Menu"
      >
        <Settings className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 p-6 border-border bg-card shadow-2xl w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-accent" />
          <h3 className="font-semibold">Role Testing Menu</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="w-4 h-4 text-blue-accent" />
            <span className="text-sm font-medium">Base Role</span>
          </div>
          <Badge className="bg-blue-accent/20 text-blue-accent border-blue-accent/30">
            Student (Always Active)
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Toggle modular permissions:
          </p>

          {/* Auxiliar Permission */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <Label htmlFor="auxiliar-toggle" className="text-sm font-medium cursor-pointer">
                  Auxiliar
                </Label>
                <p className="text-xs text-muted-foreground">
                  Curatorship + Resources
                </p>
              </div>
            </div>
            <Switch
              id="auxiliar-toggle"
              checked={hasRole("auxiliar")}
              onCheckedChange={() => toggleRole("auxiliar")}
            />
          </div>

          {/* Moderator Permission */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-pink-accent" />
              <div>
                <Label htmlFor="moderator-toggle" className="text-sm font-medium cursor-pointer">
                  Moderator
                </Label>
                <p className="text-xs text-muted-foreground">
                  Forum Moderation + Articles
                </p>
              </div>
            </div>
            <Switch
              id="moderator-toggle"
              checked={hasRole("moderator")}
              onCheckedChange={() => toggleRole("moderator")}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Active Roles:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-blue-accent/30 bg-blue-accent/10 text-blue-accent">
              Student
            </Badge>
            {hasRole("auxiliar") && (
              <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-500">
                Auxiliar
              </Badge>
            )}
            {hasRole("moderator") && (
              <Badge variant="outline" className="border-pink-accent/30 bg-pink-accent/10 text-pink-accent">
                Moderator
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
