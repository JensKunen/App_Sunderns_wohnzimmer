import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import {
  reservations,
  newsletterSubscribers,
  contactMessages,
  type Reservation,
  type InsertReservation,
  type NewsletterSubscriber,
  type InsertNewsletter,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";

const sqlite = new Database("sunderns-wohnzimmer.db");
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wp_event_id INTEGER NOT NULL,
    event_title TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    number_of_tickets INTEGER NOT NULL DEFAULT 1,
    phone TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    subscribed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TEXT NOT NULL
  );
`);

export interface IStorage {
  // Reservations
  createReservation(reservation: InsertReservation): Reservation;
  getReservationsForEvent(wpEventId: number): Reservation[];
  getReservationCount(wpEventId: number): number;

  // Newsletter
  subscribeNewsletter(subscriber: InsertNewsletter): NewsletterSubscriber;

  // Contact
  createContactMessage(message: InsertContactMessage): ContactMessage;
}

export class DatabaseStorage implements IStorage {
  createReservation(reservation: InsertReservation): Reservation {
    return db
      .insert(reservations)
      .values({
        ...reservation,
        createdAt: new Date().toISOString(),
        status: "confirmed",
      })
      .returning()
      .get();
  }

  getReservationsForEvent(wpEventId: number): Reservation[] {
    return db
      .select()
      .from(reservations)
      .where(and(eq(reservations.wpEventId, wpEventId), eq(reservations.status, "confirmed")))
      .all();
  }

  getReservationCount(wpEventId: number): number {
    const result = db
      .select()
      .from(reservations)
      .where(and(eq(reservations.wpEventId, wpEventId), eq(reservations.status, "confirmed")))
      .all();
    return result.reduce((sum, r) => sum + r.numberOfTickets, 0);
  }

  subscribeNewsletter(subscriber: InsertNewsletter): NewsletterSubscriber {
    return db
      .insert(newsletterSubscribers)
      .values({
        ...subscriber,
        subscribedAt: new Date().toISOString(),
      })
      .returning()
      .get();
  }

  createContactMessage(message: InsertContactMessage): ContactMessage {
    return db
      .insert(contactMessages)
      .values({
        ...message,
        sentAt: new Date().toISOString(),
      })
      .returning()
      .get();
  }
}

export const storage = new DatabaseStorage();
