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


// export async function getUserById(userId:string) {
//     try {
//         await connectDB();
//         const user = await User.findOne({clerkId:userId});
//         if(!user)throw new Error("User is Not Found");
//         return JSON.parse(JSON.stringify(user));
//     } catch (error) {
//         handleError(error)
//     }
// }

// import { UpdateQuery } from "mongoose";

// export async function updateUser(id: string, user: UpdateQuery<unknown>) {
//     try {
//         await connectDB();
//         const updateUser = await User.findOneAndUpdate({ clerkId: id }, user, { new: true });
//         if (!updateUser) throw new Error("User update failed");
//         return JSON.parse(JSON.stringify(updateUser));
//     } catch (error) {
//         handleError(error);
//     }
// }
// export async function deleteUser(clerkId:string) {
//     try {
//         await connectDB();
//         const deleteUser = await User.findOneAndDelete({clerkId});
//         if(!deleteUser) throw new Error("User delete failed");
//         return JSON.parse(JSON.stringify(deleteUser));
//     } catch (error) {
//         handleError(error)
//     }
// }







