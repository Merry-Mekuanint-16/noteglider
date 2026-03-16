"use client";

import { useEffect, useState, useTransition } from "react";

interface FormState { name: string; email: string; message: string; }
interface ContactFormProps { initialEmail?: string; isEmailReadOnly?: boolean; }

export default function ContactForm({ initialEmail, isEmailReadOnly }: ContactFormProps) {
  const [formState, setFormState] = useState<FormState>({ name: "", email: initialEmail ?? "", message: "" });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => { if (initialEmail) setFormState((prev) => ({ ...prev, email: initialEmail })); }, [initialEmail]);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    if (formState.name.trim().length < 2) { setError("Please provide your name (at least 2 characters)."); return; }
    if (formState.message.trim().length < 10) { setError("Please enter at least 10 characters in your message."); return; }

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formState) });
        if (!response.ok) {
          let errorMessage = "We couldn't submit your message.";
          try {
            const data = await response.json();
            if (data?.error) errorMessage = data.error;
          } catch {}
          throw new Error(errorMessage);
        }
        setFeedback("Thanks for reaching out! We'll get back to you shortly.");
        setFormState({ name: "", email: initialEmail ?? "", message: "" });
      } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and Email Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Full name
          </label>
          <input 
            id="name" 
            name="name" 
            type="text"
            autoComplete="name" 
            placeholder="Your name" 
            value={formState.name} 
            onChange={handleChange("name")} 
            required 
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email
          </label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            placeholder="you@example.com" 
            value={formState.email} 
            onChange={handleChange("email")} 
            required 
            readOnly={!!isEmailReadOnly} 
            disabled={!!isEmailReadOnly}
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-60"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
          Message
        </label>
        <textarea 
          id="message" 
          name="message" 
          rows={6} 
          placeholder="How can we help you?" 
          value={formState.message} 
          onChange={handleChange("message")} 
          required 
          className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
        />
        <p className="mt-2 text-sm text-gray-400">Minimum 10 characters</p>
      </div>
      
      {/* Feedback Messages */}
      {feedback && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {feedback}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
      
      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isPending} 
        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
