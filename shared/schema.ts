import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// WordPress Event type (from Tribe Events API — not stored locally)
export interface WPEvent {
  id: number;
  title: string;
  description: string;
  excerpt: string;
  url: string;
  slug: string;
  image: {
    url: string;
    sizes?: Record<string, { url: string; width: number; height: number }>;
  } | null;
  start_date: string; // "2025-07-12 19:00:00"
  end_date: string;
  all_day: boolean;
  cost: string;
  cost_details: {
    currency_symbol: string;
    values: string[];
  };
  categories: Array<{ name: string; slug: string; id: number }>;
  tags: Array<{ name: string; slug: string }>;
  venue?: {
    venue: string;
    address: string;
    city: string;
    zip: string;
  };
}

// Local reservations table (stays in our database)
export const reservations = sqliteTable("reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  wpEventId: integer("wp_event_id").notNull(), // WordPress event ID
  eventTitle: text("event_title").notNull(), // cached for display
  name: text("name").notNull(),
  email: text("email").notNull(),
  numberOfTickets: integer("number_of_tickets").notNull().default(1),
  phone: text("phone"),
  message: text("message"),
  status: text("status").notNull().default("confirmed"),
  createdAt: text("created_at").notNull(),
});

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscribedAt: text("subscribed_at").notNull(),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  sentAt: text("sent_at").notNull(),
});

// Insert schemas
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true, status: true });
export const insertNewsletterSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, subscribedAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, sentAt: true });

// Types
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
