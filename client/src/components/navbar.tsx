import { Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

const navLinks = [
  { href: "/", label: "Start" },
  { href: "/veranstaltungen", label: "Veranstaltungen" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [location] = useHashLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-3 cursor-pointer" data-testid="link-home">
              <WohnzimmerLogo />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight tracking-tight text-foreground">
                  Sunderns
                </span>
                <span className="text-sm font-bold leading-tight tracking-tight text-primary">
                  Wohnzimmer
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="ml-2"
              data-testid="button-theme-toggle"
              aria-label={`Zu ${theme === "dark" ? "hellem" : "dunklem"} Modus wechseln`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-border/50 pt-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <span
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function WohnzimmerLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-label="Sunderns Wohnzimmer Logo"
      className="shrink-0"
    >
      {/* Sofa / Wohnzimmer icon */}
      <rect x="4" y="18" width="28" height="10" rx="3" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <path d="M8 18V14C8 11.7909 9.79086 10 12 10H24C26.2091 10 28 11.7909 28 14V18" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <line x1="4" y1="28" x2="8" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
      <line x1="28" y1="28" x2="32" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
      <path d="M13 18V15.5C13 15.2239 13.2239 15 13.5 15H22.5C22.7761 15 23 15.2239 23 15.5V18" stroke="currentColor" strokeWidth="1.5" className="text-primary/60" />
    </svg>
  );
}
