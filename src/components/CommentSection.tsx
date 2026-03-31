"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleMoreIcon, SendIcon } from "lucide-react";
import { createComment, getPosts, toggleCommentLike } from "@/actions/post.action";
import { toast } from "sonner";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import EmojiPicker from "./EmojiPicker";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Comment = Posts[number]["comments"][number];

type CommentSectionProps = {
    postId: string;
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    dbUserId?: string | null;
};

type ThreadComment = Comment & {
    replies: ThreadComment[];
};

function buildCommentTree(comments: Comment[], parentId: string | null = null): ThreadComment[] {
    return comments
        .filter((comment) => (comment.parentId ?? null) === parentId)
        .map((comment) => ({
            ...comment,
            replies: buildCommentTree(comments, comment.id),
        }));
}

function toggleCommentLikeState(comments: Comment[], commentId: string, userId: string): Comment[] {
    return comments.map((comment) => {
        if (comment.id !== commentId) {
            return comment;
        }

        const hasLiked = comment.likes.some((like) => like.userId === userId);

        return {
            ...comment,
            likes: hasLiked
                ? comment.likes.filter((like) => like.userId !== userId)
                : [...comment.likes, { userId }],
        };
    });
}

function CommentComposer({
    value,
    onChange,
    onSubmit,
    isSubmitting,
    placeholder,
    buttonLabel,
}: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
    placeholder: string;
    buttonLabel: string;
}) {
    const { user } = useUser();
    const appendEmoji = (emoji: string) => {
        onChange(`${value}${emoji}`);
    };

    if (!user) {
        return (
            <SignInButton mode="modal">
                <Button variant="outline">Sign in to join the discussion</Button>
            </SignInButton>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-3">
                <Avatar className="size-8 shrink-0">
                    <AvatarImage src={user.imageUrl || "/avatar.png"} />
                </Avatar>
                {buttonLabel === "Reply" ? (
                    <p className="text-sm text-muted-foreground">{placeholder}</p>
                ) : null}
            </div>
            <div className="w-full">
                <Textarea
                    placeholder={buttonLabel === "Reply" ? "Write your reply..." : placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-h-20 w-full resize-none"
                />
                <div className="mt-2 flex items-center justify-between">
                    <EmojiPicker onSelect={appendEmoji} />
                    <div className="flex items-center">
                    <Button
                        size="sm"
                        onClick={onSubmit}
                        className="flex items-center gap-2"
                        disabled={!value.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            buttonLabel === "Reply" ? "Replying..." : "Posting..."
                        ) : (
                            <>
                                <SendIcon className="size-4" />
                                {buttonLabel}
                            </>
                        )}
                    </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CommentItem({
    comment,
    depth,
    dbUserId,
    onReply,
    onToggleLike,
}: {
    comment: ThreadComment;
    depth: number;
    dbUserId?: string | null;
    onReply: (content: string, parentId?: string) => Promise<boolean>;
    onToggleLike: (commentId: string) => Promise<void>;
}) {
    const { user } = useUser();
    const [reply, setReply] = useState("");
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const hasLiked = comment.likes.some((like) => like.userId === dbUserId);

    const handleReply = async () => {
        if (!reply.trim() || isReplying) return;

        try {
            setIsReplying(true);
            const success = await onReply(reply, comment.id);

            if (success) {
                setReply("");
                setShowReplyBox(false);
            }
        } finally {
            setIsReplying(false);
        }
    };

    const handleLike = async () => {
        if (!user || !dbUserId || isLiking) return;

        try {
            setIsLiking(true);
            await onToggleLike(comment.id);
        } finally {
            setIsLiking(false);
        }
    };

    const visualDepth = Math.min(depth, 2);
    const indentClass =
        visualDepth === 0
            ? ""
            : visualDepth === 1
              ? "ml-4 border-l pl-4"
              : "ml-6 border-l pl-4";

    return (
        <div className={indentClass}>
            <div className="flex space-x-3">
                <Avatar className="size-8 shrink-0">
                    <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link href={`/profile/${comment.author.username}`} className="text-sm font-medium">
                            {comment.author.name || comment.author.username}
                        </Link>
                        <span className="text-sm text-muted-foreground">@{comment.author.username}</span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                    </div>
                    <p className="mt-1 text-sm wrap-break-word">{comment.content}</p>

                    <div className="mt-2 flex items-center gap-2">
                        {user ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`gap-2 px-2 text-muted-foreground ${hasLiked ? "text-red-500 hover:text-red-600" : ""}`}
                                onClick={handleLike}
                                disabled={isLiking}
                            >
                                <HeartIcon className={`size-4 ${hasLiked ? "fill-current" : ""}`} />
                                <span>{comment.likes.length}</span>
                            </Button>
                        ) : (
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm" className="gap-2 px-2 text-muted-foreground">
                                    <HeartIcon className="size-4" />
                                    <span>{comment.likes.length}</span>
                                </Button>
                            </SignInButton>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 px-2 text-muted-foreground hover:text-blue-500"
                            onClick={() => setShowReplyBox((prev) => !prev)}
                        >
                            <MessageCircleMoreIcon className="size-4" />
                            <span>Reply</span>
                        </Button>
                    </div>

                    {showReplyBox ? (
                        <div className="mt-3">
                            <CommentComposer
                                value={reply}
                                onChange={setReply}
                                onSubmit={handleReply}
                                isSubmitting={isReplying}
                                placeholder={`Reply to @${comment.author.username}`}
                                buttonLabel="Reply"
                            />
                        </div>
                    ) : null}

                    {comment.replies.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {comment.replies.map((replyComment) => (
                                <CommentItem
                                    key={replyComment.id}
                                    comment={replyComment}
                                    depth={depth + 1}
                                    dbUserId={dbUserId}
                                    onReply={onReply}
                                    onToggleLike={onToggleLike}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function CommentSection({ postId, comments, setComments, dbUserId }: CommentSectionProps) {
    const [newComment, setNewComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const threadedComments = useMemo(() => buildCommentTree(comments), [comments]);

    const handleAddComment = async (content: string, parentId?: string) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return false;

        try {
            const result = await createComment(postId, trimmedContent, parentId);
            const createdComment = result?.comment;

            if (result?.success && createdComment) {
                setComments((prev) => [...prev, createdComment]);
                toast.success(parentId ? "Reply posted successfully" : "Comment posted successfully");
                return true;
            }

            throw new Error(result?.error);
        } catch (error) {
            toast.error(parentId ? "Failed to post reply" : "Failed to add comment");
            return false;
        }
    };

    const handleRootComment = async () => {
        if (!newComment.trim() || isCommenting) return;

        try {
            setIsCommenting(true);
            const success = await handleAddComment(newComment);

            if (success) {
                setNewComment("");
            }
        } finally {
            setIsCommenting(false);
        }
    };

    const handleCommentLike = async (commentId: string) => {
        if (!dbUserId) return;

        const previousComments = comments;
        setComments((prev) => toggleCommentLikeState(prev, commentId, dbUserId));

        const result = await toggleCommentLike(commentId);

        if (!result?.success) {
            setComments(previousComments);
            toast.error("Failed to update comment like");
        }
    };

    return (
        <div className="space-y-4 border-t pt-5">
            <CommentComposer
                value={newComment}
                onChange={setNewComment}
                onSubmit={handleRootComment}
                isSubmitting={isCommenting}
                placeholder="Write a comment..."
                buttonLabel="Comment"
            />
            
            <div className="space-y-4">
                {threadedComments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet. Start the thread.</p>
                ) : (
                    threadedComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            depth={0}
                            dbUserId={dbUserId}
                            onReply={handleAddComment}
                            onToggleLike={handleCommentLike}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
