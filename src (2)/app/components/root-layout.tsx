import { Outlet } from "react-router";
import { useEffect } from "react";
import { RoleTestingMenu } from "./role-testing-menu";

export function RootLayout() {
  useEffect(() => {
    // Apply dark mode by default
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <Outlet />
      <RoleTestingMenu />
    </>
  );
}