import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "admin" | "super_admin";
}

export function AuthGuard({ children, requireAuth = true, requiredRole }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (!isLoading && requiredRole && user) {
      if (requiredRole === "super_admin" && user.role !== "super_admin") {
        setLocation("/");
        return;
      }
      if (requiredRole === "admin" && user.role !== "admin" && user.role !== "super_admin") {
        setLocation("/");
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, requireAuth, requiredRole, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredRole && user) {
    if (requiredRole === "super_admin" && user.role !== "super_admin") {
      return null;
    }
    if (requiredRole === "admin" && user.role !== "admin" && user.role !== "super_admin") {
      return null;
    }
  }

  return <>{children}</>;
}
