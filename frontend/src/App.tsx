import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import Layout from "./components/Layout";

// Route-based code splitting: each page becomes its own chunk so the initial
// bundle only ships the shell + dashboard. Reduces TTI / bundle size.
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Settings = lazy(() => import("./pages/Settings"));
const Mentor = lazy(() => import("./pages/Mentor"));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-canvas text-ink-soft">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center py-20 text-ink-faint">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/history"
          element={
            <Suspense fallback={<PageLoader />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path="/favorites"
          element={
            <Suspense fallback={<PageLoader />}>
              <Favorites />
            </Suspense>
          }
        />
        <Route
          path="/mentor"
          element={
            <Suspense fallback={<PageLoader />}>
              <Mentor />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
