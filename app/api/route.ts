import { connectDB } from "@/lib/database/mongoose";

export async function GET() {
    try {
      await  connectDB();
      const jsonResponse = JSON.stringify({
        "message": "Hello World"
   });
   return new Response(jsonResponse, {
       headers: { 'Content-Type': 'application/json' }
   });
    } catch (error) {
        return new Response("Error verifying webhook", { status: 400 });
    }
   
}