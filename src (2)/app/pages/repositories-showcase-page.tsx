import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Search, Calendar, FolderOpen } from "lucide-react";

const repositories = [
  {
    id: 1,
    nombre: "API de Gestión Académica",
    descripcion: "Backend NestJS con autenticación JWT, Prisma y PostgreSQL para administración de cursos.",
    stacks: ["NestJS", "Prisma", "PostgreSQL"],
    tags: ["backend", "api", "seguridad"],
    createdAt: "2026-04-10",
  },
  {
    id: 2,
    nombre: "Panel de Analítica Estudiantil",
    descripcion: "Dashboard frontend con gráficas de desempeño académico y consumo de recursos.",
    stacks: ["Vue", "Vite", "Chart.js"],
    tags: ["frontend", "dashboard", "visualizacion"],
    createdAt: "2026-04-12",
  },
  {
    id: 3,
    nombre: "Clasificador de Recursos PDF",
    descripcion: "Servicio de ML para clasificar recursos académicos por curso y dificultad.",
    stacks: ["Python", "FastAPI", "scikit-learn"],
    tags: ["ml", "documentacion", "busqueda"],
    createdAt: "2026-04-14",
  },
];

export function RepositoriesShowcasePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repositories;

    return repositories.filter((repo) => {
      return (
        repo.nombre.toLowerCase().includes(q) ||
        repo.descripcion.toLowerCase().includes(q) ||
        repo.stacks.some((s) => s.toLowerCase().includes(q)) ||
        repo.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Repositories Showcase</h1>
            <p className="text-muted-foreground">
              Referencia visual para listar repositorios creados por usuarios.
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>

        <Card className="p-4 border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-muted border-border"
              placeholder="Buscar por nombre, descripción, stack o tag..."
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((repo) => (
            <Card key={repo.id} className="p-5 border-border space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{repo.nombre}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{repo.descripcion}</p>
                </div>
                <Badge className="bg-blue-accent/20 text-blue-accent border-blue-accent/30">
                  <FolderOpen className="w-3 h-3 mr-1" />
                  Repo #{repo.id}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(repo.createdAt).toLocaleDateString()}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Stacks</p>
                <div className="flex flex-wrap gap-2">
                  {repo.stacks.map((stack) => (
                    <Badge key={stack} variant="outline" className="border-border bg-muted">
                      {stack}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {repo.tags.map((tag) => (
                    <Badge key={tag} className="bg-pink-accent/20 text-pink-accent border-pink-accent/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!filtered.length && (
          <Card className="p-8 border-border text-center text-muted-foreground">
            No se encontraron repositorios con ese criterio.
          </Card>
        )}
      </div>
    </div>
  );
}
