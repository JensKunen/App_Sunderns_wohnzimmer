import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Phone, Mail, Send, Loader2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NewsletterForm from "@/components/newsletter-form";

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Nachricht gesendet",
        description: "Vielen Dank! Wir melden uns schnellstmöglich bei dir.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;
    mutation.mutate({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground mb-2">Kontakt</h1>
        <p className="text-sm text-muted-foreground">
          Fragen, Anregungen oder Ideen? Wir freuen uns auf deine Nachricht.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <Card data-testid="card-contact-form">
            <CardContent className="p-5 sm:p-6">
              {mutation.isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-medium mb-1">Nachricht gesendet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vielen Dank! Wir melden uns schnellstmöglich bei dir.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => mutation.reset()}
                    data-testid="button-send-another"
                  >
                    Weitere Nachricht senden
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name" className="text-xs">Name</Label>
                      <Input
                        id="contact-name"
                        placeholder="Dein Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        data-testid="input-contact-name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="text-xs">E-Mail</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="deine@email.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-testid="input-contact-email"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-subject" className="text-xs">Betreff</Label>
                    <Input
                      id="contact-subject"
                      placeholder="Worum geht es?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      data-testid="input-contact-subject"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-message" className="text-xs">Nachricht</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Deine Nachricht an uns..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      data-testid="input-contact-message"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid="button-contact-submit"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Nachricht senden
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-contact-info">
            <CardContent className="p-5">
              <h2 className="font-bold text-base mb-4">So erreichst du uns</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">
                      Hauptstraße 82<br />59846 Sundern
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Telefon</p>
                    <a
                      href="tel:+492934961287"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      02934 / 961287
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">E-Mail</p>
                    <a
                      href="mailto:info@sunderns-wohnzimmer.de"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      info@sunderns-wohnzimmer.de
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card data-testid="card-newsletter-contact">
            <CardContent className="p-5">
              <h2 className="font-bold text-base mb-2">Newsletter</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Bleib auf dem Laufenden!
              </p>
              <NewsletterForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
