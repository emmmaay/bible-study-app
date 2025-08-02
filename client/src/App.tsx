import { Switch, Route } from "wouter";
import { queryimport { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import ClassContent from "@/pages/class-content";
import AdminDashboard from "@/pages/admin-dashboard";
import Profile from "@/pages/profile";
import Bookmarks from "@/pages/bookmarks";
import Notes from "@/pages/notes";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Dashboard} />
      <Route path="/class/:id" component={ClassContent} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/notes" component={Notes} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="bible-study-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
