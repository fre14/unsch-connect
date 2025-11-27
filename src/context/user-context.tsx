
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { getImageUrl } from '@/lib/placeholder-images';
import { useUser as useFirebaseUser, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UserProfile {
  id: string;
  email: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  school: string;
  cycle: string;
  profilePicture: string;
  description: string;
}

interface UserContextType {
  avatar: string;
  setAvatar: (newAvatar: string) => void;
  coverImage: string;
  setCoverImage: (newCoverImage: string) => void;
  userProfile: UserProfile | null;
  isUserLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useFirebaseUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'userProfiles', user.uid);
    }
    return null;
  }, [firestore, user]);

  const { data: userProfileData, isLoading: isProfileLoading } = useDoc<Omit<UserProfile, 'id'>>(userDocRef);

  const isUserLoading = isAuthLoading || isProfileLoading;
  
  const userProfile: UserProfile | null = user && userProfileData ? { id: user.uid, ...userProfileData } : null;

  const [avatar, setAvatar] = useState<string>(getImageUrl('user-avatar-main'));
  const [coverImage, setCoverImage] = useState<string>(getImageUrl('aniversary-banner'));
  
  useEffect(() => {
    if (userProfile?.profilePicture) {
      setAvatar(userProfile.profilePicture);
    }
  }, [userProfile]);


  return (
    <UserContext.Provider value={{ avatar, setAvatar, coverImage, setCoverImage, userProfile, isUserLoading }}>
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
