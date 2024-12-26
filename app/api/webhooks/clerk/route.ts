import { clerkClient, UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { CreateUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET not found.");
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature =  (await headerPayload).get("svix-signature");

  // Log headers for debugging
  // Log headers for debugging
  console.log("Headers received:", {
    svix_id,
    svix_timestamp,
    svix_signature,
  }) as unknown as WebhookEvent;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return new Response("Error occurred -- no Svix headers", {
      status: 400,
    }) as unknown as WebhookEvent;
  }

  // Get the body
  const payload = await req.json();
  console.log("Payload received:", payload); // Log the payload
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent | undefined;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verified:", evt); // Log the verified event
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Get the ID and type
  if (!evt) {
    console.error("Event is undefined");
    return new Response("Error occurred -- event is undefined", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Handling event ${eventType} for user ${id}`); // Log event type

  // CREATE
  if (eventType === "user.created") {
    const { email_addresses, image_url, first_name, last_name, username } = evt.data as UserJSON;

    if (!id) {
      console.error("User ID is undefined");
      return new Response("Error occurred -- user ID is undefined", {
        status: 400,
      });
    }

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username || '',
      firstName: first_name || '',
      lastName: last_name || '',
      photo: image_url,
    };

    try {
      const newUser = await CreateUser(user);
      console.log("New user created:", newUser); // Log the new user

      if (newUser) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error occurred while creating user", {
        status: 500,
      });
    }
  }

  // UPDATE
  if (eventType === "user.updated" && evt) {
    let image_url, first_name, last_name, username;
    if (evt.data && 'image_url' in evt.data) {
      ({ image_url, first_name, last_name, username } = evt.data as UserJSON);
    }

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username,
      photo: image_url,
    };

    try {
      if (!id) {
        console.error("User ID is undefined");
        return new Response("Error occurred -- user ID is undefined", {
          status: 400,
        });
      }
      const updatedUser = await updateUser(id, user);
      console.log("User updated:", updatedUser); // Log the updated user

      return NextResponse.json({ message: "OK", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response("Error occurred while updating user", {
        status: 500,
      });
    }
  }

  // DELETE
  if (eventType === "user.deleted") {
    try {
      const deletedUser = await deleteUser(id);
      console.log("User deleted:", deletedUser); // Log the deleted user

      return NextResponse.json({ message: "OK", user: deletedUser });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error occurred while deleting user", {
        status: 500,
      });
    }
  }

  console.log(`Unhandled event type: ${eventType}`);
  return new Response("", { status: 200 });
}
