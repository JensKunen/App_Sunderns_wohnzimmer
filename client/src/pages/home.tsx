import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Users, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event-card";
import NewsletterForm from "@/components/newsletter-form";
import type { WPEvent } from "@shared/schema";

export default function Home() {
  const { data, isLoading } = useQuery<{ events: WPEvent[]; total: number }>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/events");
      return res.json();
    },
  });

  const nextEvents = data?.events?.slice(0, 3);
  const hasEvents = nextEvents && nextEvents.length > 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/4" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/8 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Dritter Ort in Sundern
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight mb-4">
              Dein Treffpunkt für inspirierende Begegnungen
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Sunderns Wohnzimmer ist ein offener Begegnungsort in der Sunderner
              Innenstadt. Hier treffen sich Menschen aller Generationen für Kultur,
              Austausch und Gemeinschaft.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/veranstaltungen">
                <Button size="lg" data-testid="button-hero-events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Veranstaltungen
                </Button>
              </Link>
              <a
                href="https://sunderns-wohnzimmer.de/mitglied-werden/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" data-testid="button-hero-mitglied">
                  <Users className="h-4 w-4 mr-2" />
                  Mitglied werden
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "Hauptstr. 82", label: "Mitten in Sundern", icon: MapPin },
              { value: "Alle Generationen", label: "Offen für alle", icon: Users },
              { value: "Vielfältig", label: "Kultur & Begegnung", icon: Sparkles },
              { value: "Ehrenamtlich", label: "Gemeinschaft leben", icon: Calendar },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="font-bold text-sm text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Nächste Veranstaltungen</h2>
            <p className="text-sm text-muted-foreground">
              {hasEvents
                ? `${data.total} Veranstaltung${data.total !== 1 ? "en" : ""} geplant`
                : "Was bei uns los ist"}
            </p>
          </div>
          <Link href="/veranstaltungen">
            <Button variant="ghost" size="sm" data-testid="button-all-events">
              Alle ansehen
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : hasEvents ? (
          <div className="space-y-3">
            {nextEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aktuell keine Veranstaltungen geplant.</p>
            <p className="text-xs mt-1">Schau bald wieder vorbei oder melde dich für unseren Newsletter an.</p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-primary/5 border-y border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="max-w-lg">
            <h2 className="text-lg font-bold text-foreground mb-2">Newsletter</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Erhalte regelmäßig Neuigkeiten und Veranstaltungshinweise direkt in dein Postfach.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
