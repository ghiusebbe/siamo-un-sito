"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email"), consent: formData.get("consent") === "on" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Iscrizione non riuscita");
      setState("success");
      setMessage("Sei dentro. Ci leggiamo presto.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Riprova tra poco.");
    }
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">Email</label>
      <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="nome@email.it" required />
      <button type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Invio…" : "Iscriviti ↗"}
      </button>
      <label className="newsletter-consent">
        <input name="consent" type="checkbox" required />
        <span>
          Acconsento a ricevere la newsletter di SIAMO. L’indirizzo viene usato solo per questo invio e
          posso cancellarmi in qualsiasi momento scrivendo a{" "}
          <a href="mailto:siamounmagazine@gmail.com">siamounmagazine@gmail.com</a>.
        </span>
      </label>
      {message ? <p className={`form-message ${state}`} role="status">{message}</p> : null}
    </form>
  );
}
