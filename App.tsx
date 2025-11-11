import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import NewHome from "./pages/NewHome";
import SearchPage from "./pages/SearchPage";
import MapPage from "./pages/MapPage";
import AssistantPage from "./pages/AssistantPage";
import ProviderDetail from "./pages/ProviderDetail";
import ProfilePage from "./pages/ProfilePage"; // Import the new ProfilePage
import { UserProfileProvider } from "./contexts/UserProfileContext"; // Import UserProfileProvider

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={NewHome} />
      <Route path={"/search"} component={SearchPage} />
      <Route path={"/map"} component={MapPage} />
      <Route path="/assistant" component={AssistantPage} />
      <Route path="/profile" component={ProfilePage} /> {/* Add route for ProfilePage */}
      <Route path={"/provider/:id"} component={ProviderDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <UserProfileProvider> {/* Wrap with UserProfileProvider */}
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserProfileProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;