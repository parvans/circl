import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import SearchResults from "@/components/SearchResults";
import UserFollow from "@/components/UserFollow";
import { currentUser } from "@clerk/nextjs/server";

type HomeProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await currentUser();
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q ?? "";
  const isSearching = query.trim().length > 0;
  const posts = isSearching ? [] : await getPosts();
  const dbUserId = await getDbUserId();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className={isSearching ? "lg:col-span-10" : "lg:col-span-6"}>
        {isSearching ? <SearchResults query={query} dbUserId={dbUserId} /> : null}
        {!isSearching ? (
          <>
            {user && <CreatePost/> }
            <div className="space-y-6">
              {posts.map((post)=>(
                <PostCard key={post.id} post={post} dbUserId={dbUserId}/>
              ))}
            </div>
          </>
        ) : null}
      </div>
      {!isSearching ? (
        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          <UserFollow/>
        </div>
      ) : null}
    </div>
  );
}
