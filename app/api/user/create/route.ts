import User from "@/lib/database/models/user.model";
import { connectDB } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        await connectDB();
        const newUser = await User.create(body);
        
        return new Response(JSON.stringify(newUser), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error creating user:', error); // Enhanced logging
        handleError(error);
        
       
    }
}
