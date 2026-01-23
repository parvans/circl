"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, imageUrl: string) => {
    try {
        const userId = await getDbUserId();
        const post = await prisma.posts.create({
            data:{
                content,
                image:imageUrl,
                authorId:userId
            }
        });

        revalidatePath("/"); // Revalidate the home page to show the new post
        return {success:true, post};

    } catch (error) {
        console.log("Error creating post", error);
        return {success:false, error:"Failed to create post"};
    }
}