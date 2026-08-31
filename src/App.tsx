import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Watermarks = () => (
  <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-4 opacity-50 hover:opacity-100 transition-all pointer-events-none group">
    <img src={`${import.meta.env.BASE_URL}assets/ufps_logo.png`} alt="UFPS" className="h-10 md:h-12 w-auto contrast-125 mix-blend-multiply" />
    <img src={`${import.meta.env.BASE_URL}assets/cedit_logo.png`} alt="CEDIT" className="h-8 md:h-10 w-auto mix-blend-multiply" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/quehaypahacer/">
        <Watermarks />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
