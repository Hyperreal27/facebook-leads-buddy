import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";

interface ScraperFormProps {
  onSubmit: (url: string, count: number) => void;
  isLoading: boolean;
}

export function ScraperForm({ onSubmit, isLoading }: ScraperFormProps) {
  const [url, setUrl] = useState("");
  const [count, setCount] = useState(10);
  const [errors, setErrors] = useState<{ url?: string; count?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { url?: string; count?: string } = {};
    
    if (!url.trim()) {
      newErrors.url = "La URL es requerida";
    } else if (!url.includes("facebook.com/ads/library")) {
      newErrors.url = "Debe ser una URL válida de Facebook Ads Library";
    }
    
    if (count < 10) {
      newErrors.count = "El mínimo es 10 resultados";
    } else if (count > 500) {
      newErrors.count = "El máximo es 500 resultados";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(url, count);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Nueva búsqueda
        </CardTitle>
        <CardDescription>
          Pega una URL de Facebook Ads Library para extraer los datos de contacto de los anunciantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL de Meta Ads Library</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.facebook.com/ads/library/?..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="count">Cantidad de resultados</Label>
            <Input
              id="count"
              type="number"
              min={10}
              max={500}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              disabled={isLoading}
            />
            {errors.count && (
              <p className="text-sm text-destructive">{errors.count}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 10, máximo 500 resultados
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Iniciar Scraping
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
