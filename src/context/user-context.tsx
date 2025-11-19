"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getImageUrl } from '@/lib/placeholder-images';

interface UserContextType {
  avatar: string;
  setAvatar: (newAvatar: string) => void;
  coverImage: string;
  setCoverImage: (newCoverImage: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [avatar, setAvatar] = useState<string>(getImageUrl('user-avatar-main'));
  const [coverImage, setCoverImage] = useState<string>(getImageUrl('aniversary-banner'));

  return (
    <UserContext.Provider value={{ avatar, setAvatar, coverImage, setCoverImage }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
