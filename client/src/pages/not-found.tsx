import { Link } from "wouter";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-xl font-bold text-foreground mb-2">Seite nicht gefunden</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Die gesuchte Seite existiert leider nicht. Vielleicht findest du auf der Startseite, was du suchst.
      </p>
      <Link href="/">
        <Button data-testid="button-back-home">
          <Home className="h-4 w-4 mr-2" />
          Zur Startseite
        </Button>
      </Link>
    </div>
  );
}
