
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PostProps } from '@/components/post-card';

interface PostContextType {
  posts: PostProps[];
  addPost: (post: PostProps) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostProps[]>([]);

  const addPost = (post: PostProps) => {
    setPosts(prevPosts => [...prevPosts, post]);
  };

  return (
    <PostContext.Provider value={{ posts, addPost }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}

    