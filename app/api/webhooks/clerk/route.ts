import { clerkClient } from "@clerk/clerk-sdk-node";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { CreateUser } from "@/lib/actions/user.actions";
import { connectDB } from "@/lib/database/mongoose";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Handling event ${eventType} for user ${id}`);

  if (eventType === "user.created") {
    try {
      const db = await connectDB();
    if (!db) throw new Error("Database connection failed");
      const { email_addresses, image_url, first_name, last_name, username } = evt.data;
      

      const user = {
        clerkId: id || "",
        email: email_addresses[0]?.email_address || "",
        username: username?.trim() || `user_${Date.now()}`, // Set to empty string if null or whitespace
        firstName: first_name || "",
        lastName: last_name || "",
        photo: image_url || "",
      };
      
      const newUser = await CreateUser(user);

      if (!newUser || !newUser._id) {
        throw new Error("User creation failed");
      }

      if(!id){
        throw new Error("Clerk ID is not found");
      }
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });

      return NextResponse.json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  console.log(`Unhandled event type: ${eventType}`);
  return new Response("", { status: 200 });
}
