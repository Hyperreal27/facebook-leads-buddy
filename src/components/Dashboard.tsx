import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScraperForm } from "./ScraperForm";
import { ResultsTable, ScrapedResult } from "./ResultsTable";
import { ScrapingProgress, ScrapingStep } from "./ScrapingProgress";
import { clearApifyApiKey, getApifyApiKey } from "@/lib/apify";
import { LogOut, Zap } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [step, setStep] = useState<ScrapingStep>("idle");
  const [results, setResults] = useState<ScrapedResult[]>([]);
  const [error, setError] = useState<string>();

  const handleLogout = () => {
    clearApifyApiKey();
    onLogout();
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const pollForStatus = async (actorPath: string, apiKey: string, maxAttempts = 60): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `https://api.apify.com/v2/acts/${actorPath}/runs/last?token=${apiKey}`
      );
      const data = await response.json();
      
      if (data.data?.status === "SUCCEEDED") {
        return true;
      }
      if (data.data?.status === "FAILED" || data.data?.status === "ABORTED") {
        throw new Error(`Actor terminó con estado: ${data.data.status}`);
      }
      
      await sleep(5000); // Esperar 5 segundos entre checks
    }
    throw new Error("Timeout esperando resultados");
  };

  const handleScrape = async (url: string, count: number) => {
    const apiKey = getApifyApiKey();
    if (!apiKey) {
      setError("API Key no encontrado");
      return;
    }

    setStep("running_ads_scraper");
    setResults([]);
    setError(undefined);

    try {
      // Paso 1: Ejecutar el scraper de Ads Library
      const adsScraperBody = {
        count,
        period: "last30d",
        scrapeAdDetails: false,
        "scrapePageAds.activeStatus": "all",
        urls: [{ url, method: "GET" }]
      };

      const runAdsResponse = await fetch(
        `https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/runs?token=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adsScraperBody)
        }
      );

      if (!runAdsResponse.ok) {
        throw new Error("Error al iniciar scraper de anuncios");
      }

      // Paso 2: Esperar a que termine
      setStep("waiting_ads_scraper");
      await pollForStatus("curious_coder~facebook-ads-library-scraper", apiKey);

      // Paso 3: Obtener resultados
      setStep("getting_ads_results");
      const adsResultsResponse = await fetch(
        `https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/runs/last/dataset/items?token=${apiKey}`
      );
      const adsResults = await adsResultsResponse.json();

      if (!adsResults || adsResults.length === 0) {
        throw new Error("No se encontraron anuncios");
      }

      // Extraer URLs únicas de páginas (evitar duplicados que Apify rechaza)
      const uniquePageUris = [...new Set(
        adsResults
          .filter((item: { snapshot?: { page_profile_uri?: string } }) => item.snapshot?.page_profile_uri)
          .map((item: { snapshot: { page_profile_uri: string } }) => item.snapshot.page_profile_uri)
      )];
      
      const pageUrls = uniquePageUris.map(uri => ({
        url: uri,
        method: "GET"
      }));

      // Paso 4: Ejecutar scraper de páginas
      setStep("running_pages_scraper");
      const runPagesResponse = await fetch(
        `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/runs?token=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startUrls: pageUrls })
        }
      );

      if (!runPagesResponse.ok) {
        throw new Error("Error al iniciar scraper de páginas");
      }

      // Paso 5: Esperar resultados de páginas
      setStep("waiting_pages_scraper");
      await pollForStatus("apify~facebook-pages-scraper", apiKey);

      // Paso 6: Obtener resultados de páginas
      setStep("getting_pages_results");
      const pagesResultsResponse = await fetch(
        `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/runs/last/dataset/items?token=${apiKey}`
      );
      const pagesResults = await pagesResultsResponse.json();

      // Mapear resultados
      const mappedResults: ScrapedResult[] = pagesResults.map((page: { pageUrl?: string; title?: string; phone?: string }) => ({
        pageUrl: page.pageUrl || "",
        pageName: page.title || "",
        phone: page.phone || ""
      }));

      setResults(mappedResults);
      setStep("completed");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStep("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Facebook Ads Scraper</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ScraperForm 
            onSubmit={handleScrape} 
            isLoading={step !== "idle" && step !== "completed" && step !== "error"} 
          />
          <ScrapingProgress step={step} error={error} />
        </div>

        {(results.length > 0 || step === "completed") && (
          <ResultsTable results={results} />
        )}
      </main>
    </div>
  );
}
