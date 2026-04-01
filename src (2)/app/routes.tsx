import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./pages/login-page";
import { UnifiedDashboardPage } from "./pages/unified-dashboard-page";
import { UnifiedForumPage } from "./pages/unified-forum-page";
import { UploadProjectPage } from "./pages/upload-project-page";
import { AdminPortalPage } from "./pages/admin-portal-page";
import { ValidationsPage } from "./pages/validations-page";
import { UploadResourcePage } from "./pages/upload-resource-page";
import { ModerationPage } from "./pages/moderation-page";
import { PublishArticlePage } from "./pages/publish-article-page";
import { DemoPage } from "./pages/demo-page";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: DemoPage,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "dashboard",
        Component: UnifiedDashboardPage,
      },
      {
        path: "forum",
        Component: UnifiedForumPage,
      },
      {
        path: "upload",
        Component: UploadProjectPage,
      },
      {
        path: "validations",
        Component: ValidationsPage,
      },
      {
        path: "upload-resource",
        Component: UploadResourcePage,
      },
      {
        path: "moderation",
        Component: ModerationPage,
      },
      {
        path: "publish-article",
        Component: PublishArticlePage,
      },
      {
        path: "admin",
        Component: AdminPortalPage,
      },
      // Legacy redirects for old role-specific routes
      {
        path: "auxiliar/dashboard",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "auxiliar/forum",
        element: <Navigate to="/forum" replace />,
      },
      {
        path: "auxiliar/validations",
        element: <Navigate to="/validations" replace />,
      },
      {
        path: "student/dashboard",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "student/forum",
        element: <Navigate to="/forum" replace />,
      },
    ],
  },
]);