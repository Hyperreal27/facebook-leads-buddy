import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ExternalLink, Phone, Building } from "lucide-react";

export interface ScrapedResult {
  pageUrl: string;
  pageName?: string;
  phone?: string;
}

interface ResultsTableProps {
  results: ScrapedResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  const downloadCSV = () => {
    const headers = ["Facebook Page", "Nombre", "Teléfono"];
    const rows = results.map(r => [
      r.pageUrl || "",
      r.pageName || "",
      r.phone || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `facebook_scraping_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resultsWithPhone = results.filter(r => r.phone);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Resultados
          </CardTitle>
          <CardDescription>
            {results.length} páginas encontradas, {resultsWithPhone.length} con número de teléfono
          </CardDescription>
        </div>
        <Button onClick={downloadCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Descargar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página de Facebook</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay resultados aún
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[200px] truncate">
                      {result.pageUrl}
                    </TableCell>
                    <TableCell>{result.pageName || "-"}</TableCell>
                    <TableCell>
                      {result.phone ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Phone className="h-3 w-3" />
                          {result.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(result.pageUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
