import { useState, useEffect } from "react";
import { ApiKeyLogin } from "@/components/ApiKeyLogin";
import { Dashboard } from "@/components/Dashboard";
import { isAuthenticated } from "@/lib/apify";

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  if (!authenticated) {
    return <ApiKeyLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setAuthenticated(false)} />;
};

export default Index;
