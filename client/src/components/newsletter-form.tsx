import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/newsletter", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Anmeldung erfolgreich",
        description: "Du erhältst ab sofort unseren Newsletter.",
      });
      setEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "E-Mail-Adresse ist bereits angemeldet.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutation.mutate({ email: email.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md" data-testid="form-newsletter">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-9"
          required
          data-testid="input-newsletter-email"
        />
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending || mutation.isSuccess}
        data-testid="button-newsletter-submit"
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : mutation.isSuccess ? (
          <Check className="h-4 w-4" />
        ) : (
          "Anmelden"
        )}
      </Button>
    </form>
  );
}
