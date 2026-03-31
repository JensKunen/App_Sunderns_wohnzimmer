import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event-card";
import type { WPEvent } from "@shared/schema";

export default function Events() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  const { data, isLoading } = useQuery<{ events: WPEvent[]; total: number }>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/events");
      return res.json();
    },
  });

  const { data: categories } = useQuery<Array<{ id: number; name: string; slug: string; count: number }>>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    },
  });

  // Build category filter list from actual WordPress categories
  const categoryOptions = ["Alle", ...(categories?.map((c) => c.name) || [])];

  const filteredEvents = data?.events?.filter((event) => {
    const cleanTitle = event.title.replace(/<[^>]+>/g, "").replace(/&#\d+;/g, "");
    const cleanDesc = event.description.replace(/<[^>]+>/g, "").replace(/&#\d+;/g, "");

    const matchesSearch =
      search === "" ||
      cleanTitle.toLowerCase().includes(search.toLowerCase()) ||
      cleanDesc.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "Alle" ||
      event.categories.some((c) => c.name === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground mb-2">Veranstaltungen</h1>
        <p className="text-sm text-muted-foreground">
          Entdecke unser vielfältiges Programm und sichere dir deinen Platz.
          {data?.total ? ` ${data.total} Veranstaltung${data.total !== 1 ? "en" : ""} geplant.` : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Veranstaltung suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-events"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categoryOptions.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs"
              data-testid={`button-filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Event List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredEvents && filteredEvents.length > 0 ? (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium mb-1">Keine Veranstaltungen gefunden</p>
          <p className="text-xs">
            {search || selectedCategory !== "Alle"
              ? "Versuche andere Suchbegriffe oder Filter."
              : "Aktuell sind keine Veranstaltungen geplant. Schau bald wieder vorbei."}
          </p>
        </div>
      )}
    </div>
  );
}
