import { Link } from "wouter";
import { Clock, Tag, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WPEvent } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

function decodeEntities(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html.replace(/<[^>]+>/g, "");
  return txt.value.trim();
}

const categoryColors: Record<string, string> = {
  "konzert": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "musik": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "lesung": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "kreativ": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "spieletreff": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "selbsthilfegruppe": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "ausstellung": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  "theater kinder": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "veranstaltung": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const categoryIcons: Record<string, string> = {
  "konzert": "🎵",
  "musik": "🎵",
  "lesung": "📖",
  "kreativ": "🎨",
  "spieletreff": "🎲",
  "selbsthilfegruppe": "🤝",
  "ausstellung": "🖼️",
  "theater kinder": "🎭",
  "veranstaltung": "📅",
};

interface EventCardProps {
  event: WPEvent;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const dateObj = parseISO(event.start_date.replace(" ", "T"));
  const dayNum = format(dateObj, "d");
  const monthShort = format(dateObj, "MMM", { locale: de });
  const timeStr = format(dateObj, "HH:mm");
  const endTimeStr = event.end_date
    ? format(parseISO(event.end_date.replace(" ", "T")), "HH:mm")
    : null;

  // Get primary category (skip generic "Veranstaltung" if there's a more specific one)
  const specificCat = event.categories.find((c) => c.slug !== "veranstaltung");
  const displayCat = specificCat || event.categories[0];
  const catSlug = displayCat?.slug || "veranstaltung";
  const catName = displayCat?.name || "Veranstaltung";

  // Strip HTML from title
  const cleanTitle = decodeEntities(event.title);

  // Strip HTML from description for excerpt
  const cleanDesc = decodeEntities(event.description);

  return (
    <Link href={`/veranstaltung/${event.id}`}>
      <Card
        className="group cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 overflow-hidden"
        data-testid={`card-event-${event.id}`}
      >
        <CardContent className={compact ? "p-4" : "p-5"}>
          <div className="flex gap-4">
            {/* Date column */}
            <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary">
              <span className="text-lg font-bold leading-none">{dayNum}</span>
              <span className="text-xs font-medium uppercase mt-0.5">{monthShort}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {categoryIcons[catSlug] && (
                    <span className="mr-1.5">{categoryIcons[catSlug]}</span>
                  )}
                  {cleanTitle}
                </h3>
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-xs whitespace-nowrap ${categoryColors[catSlug] || categoryColors["veranstaltung"]}`}
                  data-testid={`badge-category-${event.id}`}
                >
                  {catName}
                </Badge>
              </div>

              {!compact && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2.5">
                  {cleanDesc.slice(0, 200)}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {timeStr} Uhr
                  {endTimeStr && !event.all_day && ` – ${endTimeStr} Uhr`}
                </span>
                {event.cost && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {event.cost === "" ? "Eintritt frei" : event.cost}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            {!compact && event.image?.url && (
              <div className="hidden sm:block shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                <img
                  src={event.image.sizes?.thumbnail?.url || event.image.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
