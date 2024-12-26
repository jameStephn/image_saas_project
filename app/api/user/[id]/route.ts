import User from "@/lib/database/models/user.model";
import { connectDB } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from 'next';

export async function getUserById(userId:string) {
    try {
        await connectDB();
        const user = await User.findOne({clerkId:userId});
        if(!user)throw new Error("User is Not Found");
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        handleError(error)
    }
}



export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    
        try {
            
            const user = await getUserById(id as string);
            res.status(200).json(user);
        } catch (error) {
           handleError(error)
        }
   
}