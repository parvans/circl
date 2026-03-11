import Link from "next/link";
import { searchUsers } from "@/actions/user.action";
import { searchPosts } from "@/actions/post.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import PostCard from "./PostCard";

type SearchResultsProps = {
  query: string;
  dbUserId?: string | null;
};

export default async function SearchResults({ query, dbUserId }: SearchResultsProps) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Keep typing to search users and posts.
        </CardContent>
      </Card>
    );
  }

  const [users, posts] = await Promise.all([
    searchUsers(trimmedQuery),
    searchPosts(trimmedQuery),
  ]);

  if (users.length === 0 && posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          No results found for &quot;{trimmedQuery}&quot;.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search results for &quot;{trimmedQuery}&quot;</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Users</h3>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching users.</p>
            ) : (
              users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={user.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name || user.username}</p>
                      <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {user._count.followers} followers • {user._count.posts} posts
                  </p>
                </Link>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Posts</h3>
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching posts.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} id={`post-${post.id}`}>
                  <PostCard post={post} dbUserId={dbUserId} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
