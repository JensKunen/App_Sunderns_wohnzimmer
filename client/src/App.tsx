import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/home";
import Events from "./pages/events";
import EventDetail from "./pages/event-detail";
import Contact from "./pages/contact";
import NotFound from "./pages/not-found";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { ThemeProvider } from "./components/theme-provider";

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/veranstaltungen" component={Events} />
            <Route path="/veranstaltung/:id" component={EventDetail} />
            <Route path="/kontakt" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
