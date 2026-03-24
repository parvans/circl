"use client";

import { getProfileByUser, getUserLikedPosts, getUserPosts, updateUserProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { CalendarDaysIcon, GlobeIcon, Loader2Icon, MapPinIcon, PencilIcon } from "lucide-react";
import { format } from "date-fns";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type User = Awaited<ReturnType<typeof getProfileByUser>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;
type LikedPosts = Awaited<ReturnType<typeof getUserLikedPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: LikedPosts;
  isFollowing: boolean;
  dbUserId?: string | null;
}

type ActiveTab = "posts" | "likes";

const ProfilePageClient = ({
  user,
  posts,
  likedPosts,
  isFollowing: initialIsFollowing,
  dbUserId,
}: ProfilePageClientProps) => {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("posts");
  const [profile, setProfile] = useState(user);
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const isOwnProfile =
    currentUser?.username === profile.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === profile.username;

  const formattedDate = format(new Date(profile.createdAt), "MMMM yyyy");

  const tabPosts = useMemo(
    () => (activeTab === "posts" ? posts : likedPosts),
    [activeTab, likedPosts, posts]
  );

  const handleEdit = async () => {
    try {
      setIsSavingProfile(true);
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("bio", editForm.bio);
      formData.append("location", editForm.location);
      formData.append("website", editForm.website);

      const result = await updateUserProfile(formData);

      if (result.success) {
        setProfile((prev) => ({
          ...prev,
          name: result.updateUser.name,
          bio: result.updateUser.bio,
          location: result.updateUser.location,
          website: result.updateUser.website,
        }));
        setShowEditDialog(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || isUpdatingFollow) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(profile.id);
      setIsFollowing((prev) => !prev);
      setProfile((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (isFollowing ? -1 : 1),
        },
      }));
      toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="overflow-hidden py-0">
        <div className="h-32 bg-[linear-gradient(135deg,rgba(2,132,199,0.18),rgba(20,184,166,0.14),rgba(245,158,11,0.18))]" />
        <CardContent className="pt-0">
          <div className="-mt-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="size-28 border-4 border-background shadow-sm">
                <AvatarImage src={profile.image ?? "/avatar.png"} />
              </Avatar>

              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {profile.name || profile.username}
                  </h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                {profile.bio ? (
                  <p className="max-w-2xl text-sm leading-6 text-foreground/90">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No bio added yet.</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.location ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPinIcon className="size-4" />
                      {profile.location}
                    </span>
                  ) : null}
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 hover:text-primary hover:underline"
                    >
                      <GlobeIcon className="size-4" />
                      {profile.website}
                    </a>
                  ) : null}
                  <span className="inline-flex items-center gap-2">
                    <CalendarDaysIcon className="size-4" />
                    Joined {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button onClick={() => setShowEditDialog(true)} className="gap-2">
                  <PencilIcon className="size-4" />
                  Edit Profile
                </Button>
              ) : currentUser ? (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  disabled={isUpdatingFollow}
                  className="min-w-28"
                >
                  {isUpdatingFollow ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-muted/30 p-4 text-center">
              <p className="text-2xl font-semibold">{profile._count.posts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 text-center">
              <p className="text-2xl font-semibold">{profile._count.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 text-center">
              <p className="text-2xl font-semibold">{profile._count.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "posts" ? "default" : "ghost"}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </Button>
            <Button
              variant={activeTab === "likes" ? "default" : "ghost"}
              onClick={() => setActiveTab("likes")}
            >
              Liked Posts
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {tabPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <h2 className="text-lg font-medium">
                {activeTab === "posts" ? "No posts yet" : "No liked posts yet"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeTab === "posts"
                  ? "Once posts are published, they will show up here."
                  : "Liked posts will appear here when this user reacts to them."}
              </p>
            </div>
          ) : (
            tabPosts.map((post) => (
              <PostCard key={`${activeTab}-${post.id}`} post={post} dbUserId={dbUserId} />
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update the public information shown on your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={editForm.bio}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, bio: event.target.value }))
                }
                placeholder="Write a short bio"
                className="min-h-28 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={editForm.location}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, location: event.target.value }))
                }
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                value={editForm.website}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, website: event.target.value }))
                }
                placeholder="https://your-website.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSavingProfile}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSavingProfile}>
              {isSavingProfile ? <Loader2Icon className="size-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePageClient;
