import { clerkClient } from "@clerk/clerk-sdk-node";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { CreateUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req:Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id") ?? "";
  const svix_timestamp = headerPayload.get("svix-timestamp") ?? "";
  const svix_signature = headerPayload.get("svix-signature") ?? "";

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no Svix headers", {
      status: 400,
      });
    } else {
      throw new Error("Invalid user ID");
    }
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  if (!WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SECRET is not defined");
  }
  const wh = new Webhook(WEBHOOK_SECRET as string);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verified:", evt);
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Handling event ${eventType} for user ${id}`);

  try {
    if (eventType === "user.created") {
      const { email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username,
        firstName: first_name || '',
        lastName: last_name || '',
        photo: image_url,
      };

      const newUser = await fetchWithBody('http://localhost:3000/api/user/create', 'POST', user);

      if (newUser) {
      if (newUser && newUser._id) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    }

    if (eventType === "user.updated") {
      const { image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name,
        lastName: last_name,
        username: username,
        photo: image_url,
      };

      if (typeof id === 'string') {
        const updatedUser = await updateUser(id, user);
        console.log("User updated:", updatedUser);
        return NextResponse.json({ message: "OK", user: updatedUser });
      } else {
        throw new Error("Invalid user ID");
      }
      console.log("User updated:", updateUser);

      return NextResponse.json({ message: "OK", user: updateUser });
    }

    if (eventType === "user.deleted") {
      if (typeof id === 'string') {
        const deletedUser = await deleteUser(id);
        console.log("User deleted:", deletedUser);
        return NextResponse.json({ message: "OK", user: deletedUser });
      } else {
        throw new Error("Invalid user ID");
      }
      console.log("User deleted:", deleteUser);

      return NextResponse.json({ message: "OK", user: deleteUser });
    }
  } catch (error) {
    console.error(`Error handling event ${eventType} for user ${id}:`, error);
    return new Response(`Error occurred while handling ${eventType}`, {
      status: 500,
    });
  }

  console.log(`Unhandled event type: ${eventType}`);
  return new Response("", { status: 200 });
}

async function fetchWithBody(url: string | URL | Request, method: string, body: { clerkId: string | undefined; email: string; username: string | null; firstName: string; lastName: string; photo: string; }) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
}
