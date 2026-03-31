"use server";

import { createCloudinarySignature, getCloudinaryUploadConfig } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

const commentInclude = {
    author: {
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
        },
    },
    likes: {
        select: {
            userId: true,
        },
    },
};

export type PostImageUploadSignatureResult =
    | {
          success: true;
          apiKey: string;
          cloudName: string;
          folder: string;
          signature: string;
          timestamp: number;
      }
    | {
          success: false;
          error: string;
      };

export const createPost = async (content: string, imageUrl: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) {
            return { success: false, error: "You need to sign in to post." };
        }

        const trimmedContent = content.trim();
        const normalizedImageUrl = imageUrl.trim();

        if (!trimmedContent && !normalizedImageUrl) {
            return { success: false, error: "Add some text or an image to post." };
        }

        const post = await prisma.posts.create({
            data: {
                content: trimmedContent || null,
                image: normalizedImageUrl || null,
                authorId: userId,
            },
        });

        revalidatePath("/");
        return { success: true, post };
    } catch (error) {
        console.log("Error creating post", error);
        return { success: false, error: "Failed to create post" };
    }
};

export const getPostImageUploadSignature = async (): Promise<PostImageUploadSignatureResult> => {
    try {
        const userId = await getDbUserId();
        if (!userId) {
            return { success: false, error: "You need to sign in to upload an image." };
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const { apiKey, cloudName, folder } = getCloudinaryUploadConfig();
        const signature = createCloudinarySignature({ folder, timestamp });

        return {
            success: true,
            apiKey,
            cloudName,
            folder,
            signature,
            timestamp,
        };
    } catch (error) {
        console.log("Error preparing Cloudinary upload", error);
        return { success: false, error: "Cloudinary image uploads are not configured yet." };
    }
};

export const getPosts = async () => {
    try {
        const posts = await prisma.posts.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                comments: {
                    include: commentInclude,
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });

        return posts;
    } catch (error) {
        console.log("Error fetching posts", error);
        throw new Error("Failed to fetch posts");
    }
};

export const searchPosts = async (rawQuery: string) => {
    try {
        const query = rawQuery.trim();
        if (query.length < 2) return [];

        return prisma.posts.findMany({
            where: {
                OR: [
                    {
                        content: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        author: {
                            OR: [
                                {
                                    username: {
                                        contains: query,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    name: {
                                        contains: query,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                comments: {
                    include: commentInclude,
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
            take: 5,
        });
    } catch (error) {
        console.log("Error in searchPosts", error);
        return [];
    }
};

export const toggleLike = async (postId: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) return;

        const existingLike = await prisma.likes.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        const post = await prisma.posts.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });
        if (!post) throw new Error("Post not found");

        if (existingLike) {
            await prisma.likes.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
        } else {
            await prisma.$transaction([
                prisma.likes.create({
                    data: {
                        userId,
                        postId,
                    },
                }),
                ...(post.authorId !== userId
                    ? [
                          prisma.notifications.create({
                              data: {
                                  type: "LIKE",
                                  userId: post.authorId,
                                  creatorId: userId,
                                  postId,
                              },
                          }),
                      ]
                    : []),
            ]);
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.log("Error in toggleLike", error);
        return { success: false, error: "Failed to toggle like" };
    }
};

export const createComment = async (postId: string, content: string, parentId?: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) return;
        if (!content.trim()) throw new Error("Content is required");
        let targetPostId = postId;
        let notificationRecipientId: string;

        if (parentId) {
            const parentComment = await prisma.comments.findUnique({
                where: { id: parentId },
                select: { id: true, postId: true, authorId: true },
            });

            if (!parentComment) {
                throw new Error("Parent comment not found");
            }

            targetPostId = parentComment.postId;
            notificationRecipientId = parentComment.authorId;
        } else {
            const post = await prisma.posts.findUnique({
                where: { id: postId },
                select: { authorId: true },
            });
            if (!post) throw new Error("Post not found");
            notificationRecipientId = post.authorId;
        }

        const comment = await prisma.$transaction(async (tx) => {
            const newComment = await tx.comments.create({
                data: {
                    content: content.trim(),
                    postId: targetPostId,
                    authorId: userId,
                    parentId,
                },
            });

            if (notificationRecipientId !== userId) {
                await tx.notifications.create({
                    data: {
                        type: "COMMENT",
                        userId: notificationRecipientId,
                        creatorId: userId,
                        postId: targetPostId,
                        commentId: newComment.id,
                    },
                });
            }

            return tx.comments.findUnique({
                where: { id: newComment.id },
                include: commentInclude,
            });
        });

        revalidatePath("/");
        return { success: true, comment };
    } catch (error) {
        console.log("Failed to create comment:", error);
        return { success: false, error: "Failed to create comment" };
    }
};

export const toggleCommentLike = async (commentId: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) return;

        const existingLike = await prisma.commentLikes.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId,
                },
            },
        });

        if (existingLike) {
            await prisma.commentLikes.delete({
                where: {
                    userId_commentId: {
                        userId,
                        commentId,
                    },
                },
            });
        } else {
            await prisma.commentLikes.create({
                data: {
                    userId,
                    commentId,
                },
            });
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.log("Error in toggleCommentLike", error);
        return { success: false, error: "Failed to toggle comment like" };
    }
};

export const deletePost = async (postId: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) return;

        const post = await prisma.posts.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });
        if (!post) throw new Error("Post not found");
        if (post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

        await prisma.posts.delete({
            where: { id: postId },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.log("Failed to delete post:", error);
        return { success: true, error: "Failed to delete post" };
    }
};
