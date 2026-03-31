import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema, insertNewsletterSchema, insertContactMessageSchema } from "@shared/schema";
import type { WPEvent } from "@shared/schema";

const WP_API_BASE = "https://sunderns-wohnzimmer.de/wp-json/tribe/events/v1";

// Simple in-memory cache for WordPress API calls
let eventsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWPEvents(params: Record<string, string> = {}): Promise<any> {
  const now = Date.now();
  const cacheKey = JSON.stringify(params);

  // Check cache (only for default params = listing page)
  if (cacheKey === "{}" && eventsCache && now - eventsCache.timestamp < CACHE_TTL) {
    return eventsCache.data;
  }

  const searchParams = new URLSearchParams({
    per_page: "50",
    status: "publish",
    ...params,
  });

  const res = await fetch(`${WP_API_BASE}/events?${searchParams}`);
  if (!res.ok) {
    throw new Error(`WordPress API error: ${res.status}`);
  }
  const data = await res.json();

  // Cache default listing
  if (cacheKey === "{}") {
    eventsCache = { data, timestamp: now };
  }

  return data;
}

function transformWPEvent(raw: any) {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    excerpt: raw.excerpt || "",
    url: raw.url,
    slug: raw.slug,
    image: raw.image
      ? {
          url: raw.image.url,
          sizes: raw.image.sizes || {},
        }
      : null,
    start_date: raw.start_date,
    end_date: raw.end_date,
    all_day: raw.all_day,
    cost: raw.cost || "Eintritt frei",
    cost_details: raw.cost_details || { currency_symbol: "€", values: ["0"] },
    categories: (raw.categories || []).map((c: any) => ({
      name: c.name,
      slug: c.slug,
      id: c.id,
    })),
    tags: (raw.tags || []).map((t: any) => ({
      name: t.name,
      slug: t.slug,
    })),
    venue: raw.venue
      ? {
          venue: raw.venue.venue,
          address: raw.venue.address,
          city: raw.venue.city,
          zip: raw.venue.zip,
        }
      : null,
  };
}

export async function registerRoutes(server: Server, app: Express) {
  // Get upcoming events from WordPress
  app.get("/api/events", async (_req, res) => {
    try {
      const data = await fetchWPEvents();
      const events = (data.events || []).map(transformWPEvent);
      res.json({
        events,
        total: data.total,
        total_pages: data.total_pages,
      });
    } catch (error: any) {
      console.error("Error fetching WordPress events:", error.message);
      res.status(502).json({ message: "Veranstaltungen konnten nicht geladen werden" });
    }
  });

  // Get past events from WordPress
  app.get("/api/events/past", async (_req, res) => {
    try {
      const now = new Date().toISOString().slice(0, 19);
      const data = await fetchWPEvents({
        start_date: "2024-01-01",
        end_date: now,
        per_page: "20",
      });
      const events = (data.events || []).map(transformWPEvent);
      res.json({
        events,
        total: data.total,
      });
    } catch (error: any) {
      console.error("Error fetching past events:", error.message);
      res.status(502).json({ message: "Vergangene Veranstaltungen konnten nicht geladen werden" });
    }
  });

  // Get single event from WordPress
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const apiRes = await fetch(`${WP_API_BASE}/events/${id}`);
      if (!apiRes.ok) {
        return res.status(404).json({ message: "Veranstaltung nicht gefunden" });
      }
      const raw = await apiRes.json();
      const event = transformWPEvent(raw);

      // Get local reservation count
      const reservationCount = storage.getReservationCount(id);

      res.json({ ...event, reservationCount });
    } catch (error: any) {
      console.error("Error fetching event:", error.message);
      res.status(502).json({ message: "Veranstaltung konnte nicht geladen werden" });
    }
  });

  // Get event categories from WordPress
  app.get("/api/categories", async (_req, res) => {
    try {
      const apiRes = await fetch(`${WP_API_BASE}/categories`);
      if (!apiRes.ok) {
        throw new Error(`WordPress API error: ${apiRes.status}`);
      }
      const data = await apiRes.json();
      const categories = (data.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c.count,
      }));
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error.message);
      res.status(502).json({ message: "Kategorien konnten nicht geladen werden" });
    }
  });

  // Create reservation (local database)
  app.post("/api/reservations", (req, res) => {
    try {
      const parsed = insertReservationSchema.parse(req.body);
      const reservation = storage.createReservation(parsed);
      res.status(201).json(reservation);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Ungültige Eingabe", errors: error.errors });
      }
      res.status(500).json({ message: "Fehler bei der Reservierung" });
    }
  });

  // Subscribe to newsletter
  app.post("/api/newsletter", (req, res) => {
    try {
      const parsed = insertNewsletterSchema.parse(req.body);
      const subscriber = storage.subscribeNewsletter(parsed);
      res.status(201).json(subscriber);
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ message: "Diese E-Mail-Adresse ist bereits angemeldet" });
      }
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Ungültige Eingabe" });
      }
      res.status(500).json({ message: "Fehler bei der Newsletter-Anmeldung" });
    }
  });

  // Send contact message
  app.post("/api/contact", (req, res) => {
    try {
      const parsed = insertContactMessageSchema.parse(req.body);
      const message = storage.createContactMessage(parsed);
      res.status(201).json(message);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Ungültige Eingabe" });
      }
      res.status(500).json({ message: "Fehler beim Senden der Nachricht" });
    }
  });
}
