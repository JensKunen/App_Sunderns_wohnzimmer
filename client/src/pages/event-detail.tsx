import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  ArrowLeft,
  Ticket,
  Loader2,
  Check,
  Minus,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { WPEvent } from "@shared/schema";

type EventWithReservations = WPEvent & { reservationCount: number };

function decodeHtml(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html.replace(/<[^>]+>/g, "");
  return txt.value.trim();
}

export default function EventDetail() {
  const [, params] = useRoute("/veranstaltung/:id");
  const id = params?.id;
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState(1);

  const { data: event, isLoading } = useQuery<EventWithReservations>({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  const reservationMutation = useMutation({
    mutationFn: async (data: {
      wpEventId: number;
      eventTitle: string;
      name: string;
      email: string;
      numberOfTickets: number;
      phone?: string;
      message?: string;
    }) => {
      const res = await apiRequest("POST", "/api/reservations", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reservierung bestätigt",
        description: `Deine ${tickets} Platz/Plätze wurden reserviert. Du erhältst eine Bestätigung per E-Mail.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setTickets(1);
    },
    onError: (error: any) => {
      toast({
        title: "Reservierung fehlgeschlagen",
        description: error.message || "Bitte versuche es erneut.",
        variant: "destructive",
      });
    },
  });

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !name.trim() || !email.trim()) return;
    reservationMutation.mutate({
      wpEventId: event.id,
      eventTitle: decodeHtml(event.title),
      name: name.trim(),
      email: email.trim(),
      numberOfTickets: tickets,
      phone: phone.trim() || undefined,
      message: message.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4">Veranstaltung nicht gefunden.</p>
        <Link href="/veranstaltungen">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu den Veranstaltungen
          </Button>
        </Link>
      </div>
    );
  }

  const startDate = parseISO(event.start_date.replace(" ", "T"));
  const endDate = event.end_date ? parseISO(event.end_date.replace(" ", "T")) : null;
  const formattedDate = format(startDate, "EEEE, d. MMMM yyyy", { locale: de });
  const timeStr = format(startDate, "HH:mm");
  const endTimeStr = endDate ? format(endDate, "HH:mm") : null;

  const cleanTitle = decodeHtml(event.title);
  const cleanDesc = decodeHtml(event.description);
  const isFree = !event.cost || event.cost === "Kostenlos" || event.cost === "" || event.cost === "Eintritt frei";
  const costDisplay = isFree ? "Eintritt frei" : event.cost;

  const venueStr = event.venue
    ? [event.venue.venue, event.venue.address, event.venue.zip, event.venue.city].filter(Boolean).join(", ")
    : "Sunderns Wohnzimmer, Hauptstraße 82, 59846 Sundern";

  // Get primary category
  const specificCat = event.categories.find((c) => c.slug !== "veranstaltung");
  const displayCat = specificCat || event.categories[0];

  // Image
  const imageUrl = event.image?.sizes?.large?.url || event.image?.url;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link href="/veranstaltungen">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Alle Veranstaltungen
        </Button>
      </Link>

      {/* Event image */}
      {imageUrl && (
        <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-muted mb-6">
          <img
            src={imageUrl}
            alt={cleanTitle}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            {displayCat && (
              <Badge variant="secondary" className="mb-3" data-testid="badge-event-category">
                {displayCat.name}
              </Badge>
            )}
            <h1 className="text-xl font-bold text-foreground mb-3" data-testid="text-event-title">
              {cleanTitle}
            </h1>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>
                {event.all_day ? "Ganztägig" : `${timeStr} Uhr${endTimeStr ? ` – ${endTimeStr} Uhr` : ""}`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{venueStr}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Tag className="h-4 w-4 text-primary shrink-0" />
              <span>{costDisplay}</span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-event-description">
              {cleanDesc}
            </p>
          </div>

          {/* Link to original page */}
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-4"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Auf sunderns-wohnzimmer.de ansehen
            </a>
          )}
        </div>

        {/* Reservation Form */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24" data-testid="card-reservation">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                {isFree ? "Platz reservieren" : "Tickets reservieren"}
              </CardTitle>
              {!isFree && (
                <p className="text-xs text-muted-foreground">
                  Bezahlung erfolgt vor Ort
                </p>
              )}
            </CardHeader>
            <CardContent>
              {reservationMutation.isSuccess ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">Reservierung bestätigt</p>
                  <p className="text-xs text-muted-foreground">
                    Eine Bestätigung wird an deine E-Mail gesendet.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReserve} className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">Name</Label>
                    <Input
                      id="name"
                      placeholder="Dein Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      data-testid="input-reservation-name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-reservation-email"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs">Telefon (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0123 456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      data-testid="input-reservation-phone"
                      className="mt-1"
                    />
                  </div>

                  {/* Ticket counter */}
                  <div>
                    <Label className="text-xs">Anzahl Plätze</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setTickets(Math.max(1, tickets - 1))}
                        disabled={tickets <= 1}
                        data-testid="button-tickets-minus"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center" data-testid="text-ticket-count">
                        {tickets}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setTickets(Math.min(10, tickets + 1))}
                        disabled={tickets >= 10}
                        data-testid="button-tickets-plus"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-xs">Nachricht (optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Besondere Wünsche oder Anmerkungen..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      data-testid="input-reservation-message"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={reservationMutation.isPending}
                    data-testid="button-reservation-submit"
                  >
                    {reservationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird reserviert...
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4 mr-2" />
                        {isFree
                          ? `${tickets} Platz/Plätze reservieren`
                          : `${tickets}x ${costDisplay} reservieren`}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
