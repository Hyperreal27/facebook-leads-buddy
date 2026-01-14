import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setApifyApiKey } from "@/lib/apify";
import { KeyRound, ExternalLink } from "lucide-react";

interface ApiKeyLoginProps {
  onSuccess: () => void;
}

export function ApiKeyLogin({ onSuccess }: ApiKeyLoginProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!apiKey.trim()) {
      setError("Por favor ingresa tu API Key de Apify");
      return;
    }

    if (!apiKey.startsWith("apify_api_")) {
      setError("El API Key debe comenzar con 'apify_api_'");
      return;
    }

    setIsLoading(true);
    
    // Validar API key haciendo una petición simple
    try {
      const response = await fetch(
        `https://api.apify.com/v2/users/me?token=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error("API Key inválido");
      }
      
      setApifyApiKey(apiKey);
      onSuccess();
    } catch {
      setError("API Key inválido. Por favor verifica que sea correcto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Facebook Ads Scraper</CardTitle>
          <CardDescription>
            Ingresa tu API Key de Apify para comenzar a extraer datos de Facebook Ads Library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="apify_api_xxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Validando..." : "Comenzar"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes un API Key?{" "}
              <a 
                href="https://console.apify.com/account/integrations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Obtener en Apify <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
