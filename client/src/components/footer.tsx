import { Link } from "wouter";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-base mb-3">Sunderns Wohnzimmer e.V.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Treffpunkt für inspirierende Begegnungen. 
              Ein Ort für Kultur, Austausch und Gemeinschaft 
              in der Sunderner Innenstadt.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.instagram.com/sundernswohnzimmer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-instagram"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/SundernsWohnzimmer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-facebook"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-base mb-3">Kontakt</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Hauptstraße 82, 59846 Sundern</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+492934961287" className="hover:text-primary transition-colors">
                  02934 / 961287
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@sunderns-wohnzimmer.de" className="hover:text-primary transition-colors">
                  info@sunderns-wohnzimmer.de
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-base mb-3">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/veranstaltungen">
                  <span className="hover:text-primary transition-colors cursor-pointer">Veranstaltungen</span>
                </Link>
              </li>
              <li>
                <Link href="/kontakt">
                  <span className="hover:text-primary transition-colors cursor-pointer">Kontakt</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://sunderns-wohnzimmer.de/mitglied-werden/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Mitglied werden
                </a>
              </li>
              <li>
                <a
                  href="https://sunderns-wohnzimmer.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Website
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sunderns Wohnzimmer e.V. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
