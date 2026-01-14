import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export type ScrapingStep = 
  | "idle"
  | "running_ads_scraper"
  | "waiting_ads_scraper"
  | "getting_ads_results"
  | "running_pages_scraper"
  | "waiting_pages_scraper"
  | "getting_pages_results"
  | "completed"
  | "error";

interface ScrapingProgressProps {
  step: ScrapingStep;
  error?: string;
}

const stepInfo: Record<ScrapingStep, { label: string; progress: number }> = {
  idle: { label: "Esperando...", progress: 0 },
  running_ads_scraper: { label: "Iniciando scraper de anuncios...", progress: 10 },
  waiting_ads_scraper: { label: "Esperando resultados de anuncios...", progress: 25 },
  getting_ads_results: { label: "Obteniendo URLs de páginas...", progress: 40 },
  running_pages_scraper: { label: "Iniciando scraper de páginas...", progress: 55 },
  waiting_pages_scraper: { label: "Esperando datos de páginas...", progress: 70 },
  getting_pages_results: { label: "Obteniendo información de contacto...", progress: 85 },
  completed: { label: "¡Completado!", progress: 100 },
  error: { label: "Error en el proceso", progress: 0 },
};

export function ScrapingProgress({ step, error }: ScrapingProgressProps) {
  const { label, progress } = stepInfo[step];
  const isCompleted = step === "completed";
  const isError = step === "error";
  const isProcessing = !isCompleted && !isError && step !== "idle";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isProcessing && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {isError && <AlertCircle className="h-5 w-5 text-destructive" />}
          {step === "idle" && <Clock className="h-5 w-5 text-muted-foreground" />}
          Estado del proceso
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        
        {isProcessing && (
          <p className="text-sm text-muted-foreground">
            Este proceso puede tomar varios minutos dependiendo de la cantidad de resultados...
          </p>
        )}
        
        {isError && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
