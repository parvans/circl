import { getProfileByUser, getUserLikedPosts, getUserPosts, isFollowing } from '@/actions/profile.action'
import { getDbUserId } from '@/actions/user.action';
import { notFound } from 'next/navigation';
import React from 'react'
import ProfilePageClient from './ProfilePageClient';

export async function generateMetadata({params}:{params:Promise<{username:string}>}){
  const {username} = await params;
  const user = await getProfileByUser(username);
  if(!user) return;

  return {
    title: `${user.name ?? user.username} | Circl`,
    description: user.bio || `Checkout @${user.username}'s profile`
  }
}
const ProfilePageServer = async({ params }:{params:Promise<{username:string}>}) => {
  const {username} = await params;
  const user = await getProfileByUser(username);
  if(!user) notFound()
  
  const [posts, likedPosts, isCurrentUserFollowing, dbUserId] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
    getDbUserId(),
  ]);


  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
      dbUserId={dbUserId}
    />
  )
}

export default ProfilePageServer
