import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { Resend } from "resend";
import { env } from "~/env";

const contactSchema = z.object({
  name: z.string().min(2, "Please provide your name.").max(120),
  // email is derived from the authenticated user; ignore any client-provided value
  message: z
    .string()
    .min(10, "Tell us a little more about how we can help.")
    .max(4000),
});

// Helper function to escape HTML characters for safe email rendering
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? undefined;

    const body = await request.json();
    const payload = contactSchema.parse(body);

    // Save message to database
    await db.contactMessage.create({
      data: {
        name: payload.name,
        email: userEmail ?? "",
        message: payload.message,
      },
    });

    // Send email notification (don't fail the request if email fails)
    try {
      const resend = new Resend(env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: "FilterNote <contact@filternote.com>",
        to: ["Filternote.humanizer@gmail.com"],
        replyTo: userEmail ?? "noreply@filternote.com",
        subject: `New Contact Form Submission from ${payload.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${userEmail ? escapeHtml(userEmail) : "Not provided"}</p>
              <p style="margin: 10px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
              <p>This email was sent from the FilterNote contact form.</p>
              <p>You can reply directly to this email to respond to ${escapeHtml(payload.name)}.</p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${payload.name}
Email: ${userEmail ?? "Not provided"}
Submitted: ${new Date().toLocaleString()}

Message:
${payload.message}

---
This email was sent from the FilterNote contact form.
You can reply directly to this email to respond to ${payload.name}.
        `,
      });
      
      console.log("[CONTACT_API] Email notification sent successfully");
    } catch (emailError) {
      // Log error but don't fail the request - message is already saved
      console.error("[CONTACT_API] Failed to send email notification:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.flatten() }, { status: 400 });
    }

    console.error("[CONTACT_API]", error);
    return NextResponse.json({ success: false, error: "Unable to save your message right now." }, { status: 500 });
  }
}

