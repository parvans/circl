import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import UserFollow from "@/components/UserFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost/> : (
          <div className="p-4 bg-secondary rounded-md text-center">
            <h2 className="text-lg font-medium mb-2">Welcome to Circl</h2>
            <p className="text-sm text-muted-foreground">
              Please sign in to create posts and interact with the community.
            </p>
          </div>
        )}
        <div className="space-y-6">
          {posts.map((post)=>(
            <PostCard key={post.id} post={post} dbUserId={dbUserId}/>
          ))}
        </div>        
      </div>
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <UserFollow/>
      </div>
    </div>
  );
}
