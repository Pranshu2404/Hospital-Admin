import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import HospitalManagement from "./pages/HospitalManagement";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HospitalManagement} />
      {/* You can add a NotFound route later if needed */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
