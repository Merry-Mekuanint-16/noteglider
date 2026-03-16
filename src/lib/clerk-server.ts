import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user's database record
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  return user;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Returns the user's database record
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // User exists in Clerk but not in our database
    // This should be handled by the webhook, but we'll create it here as fallback
    const clerkUser = await currentUser();
    
    if (clerkUser) {
      const newUser = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User",
          emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
          image: clerkUser.imageUrl,
        },
      });
      
      return newUser;
    }
    
    redirect("/sign-in");
  }

  return user;
}

/**
 * Require no authentication - redirects to dashboard if authenticated
 */
export async function requireNoAuth() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
  
  return null;
}

/**
 * Get Clerk user ID
 */
export async function getClerkUserId() {
  const { userId } = await auth();
  return userId;
}
