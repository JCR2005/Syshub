import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "auxiliar" | "moderator";

interface RoleContextType {
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  toggleRole: (role: UserRole) => void;
  setRoles: (roles: UserRole[]) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRolesState] = useState<UserRole[]>([]);

  const hasRole = (role: UserRole) => roles.includes(role);

  const toggleRole = (role: UserRole) => {
    setRolesState((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const setRoles = (newRoles: UserRole[]) => {
    setRolesState(newRoles);
  };

  return (
    <RoleContext.Provider value={{ roles, hasRole, toggleRole, setRoles }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoles() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRoles must be used within a RoleProvider");
  }
  return context;
}
