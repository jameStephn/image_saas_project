"use server";

import User from "../database/models/user.model";
import { connectDB } from "../database/mongoose";
import { handleError } from "../utils";

export interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
}

export async function CreateUser(user: CreateUserParams) {
  try {
    await connectDB();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
    throw new Error("Database error while creating user");
  }
}

export async function getUserById(userId: string) {
  try {
      const conn = await connectDB();
      console.log(`Connected to DB: ${!!conn}`);
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
          console.error(`User not found with Clerk ID: ${userId}`);
          throw new Error("User is Not Found");
      }
      return JSON.parse(JSON.stringify(user));
  } catch (error) {
      console.error("Error in getUserById:", error);
      if (error instanceof Error) {
        throw new Error(`Error in getUserById: ${error.message}`);
      } else {
        throw new Error("Unknown error in getUserById");
      }
  }
}


import { UpdateQuery } from "mongoose";

export async function updateUser(id: string, user: UpdateQuery<unknown>) {
    try {
        await connectDB();
        const updateUser = await User.findOneAndUpdate({ clerkId: id }, user, { new: true });
        if (!updateUser) throw new Error("User update failed");
        return JSON.parse(JSON.stringify(updateUser));
    } catch (error) {
        handleError(error);
    }
}
export async function deleteUser(clerkId:string) {
    try {
        await connectDB();
        const deleteUser = await User.findOneAndDelete({clerkId});
        if(!deleteUser) throw new Error("User delete failed");
        return JSON.parse(JSON.stringify(deleteUser));
    } catch (error) {
        handleError(error)
    }
}

// use credit balance
export async function updateCredits(userId:string,creditFee:number){
    try {
        await connectDB();
        const updateUserCredits= await User.findOneAndUpdate({_id:userId},{$inc:{credits:creditFee}},{new:true});
        if(!updateUserCredits) throw new Error("User credits update failed");
        return JSON.parse(JSON.stringify(updateUserCredits));
 
    }catch(error){
        handleError(error)
    }
  
}





