import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import EnhancedIDELayout from "@/components/layout/EnhancedIDELayout";
import Auth from "./pages/Auth";
import CreateProject from "./pages/CreateProject";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <EnhancedIDELayout /> : <Navigate to="/create-project" replace />} />
      <Route path="/auth" element={user ? <Navigate to="/create-project" replace /> : <Auth />} />
      <Route path="/create-project" element={user ? <CreateProject /> : <Navigate to="/auth" replace />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
