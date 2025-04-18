
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";
import Explore from "@/pages/Explore";
import Auth from "@/pages/Auth";
import PlaylistView from "@/pages/PlaylistView";
import NotFound from "@/pages/NotFound";
import SubscriptionManagement from "@/pages/SubscriptionManagement";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/playlist/:id" element={<PlaylistView />} />
          <Route path="/subscription" element={<SubscriptionManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
