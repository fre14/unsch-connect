"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { getImageUrl } from '@/lib/placeholder-images';
import { useUser as useFirebaseUser, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UserProfile {
  id: string;
  email: string;
  studentCode?: string;
  firstName: string;
  lastName: string;
  school?: string;
  cycle?: string;
  profilePicture?: string;
  coverImage?: string;
  description?: string;
  website?: string;
  followers?: string[];
  following?: string[];
  role: 'student_teacher' | 'official' | 'admin';
}

interface UserContextType {
  avatar: string;
  setAvatar: (newAvatar: string) => void;
  coverImage: string;
  setCoverImage: (newCoverImage: string) => void;
  userProfile: UserProfile | null;
  isUserLoading: boolean;
  refetchUserProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useFirebaseUser();
  const firestore = useFirestore();
  
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const userDocRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'userProfiles', user.uid);
    }
    return null;
  }, [firestore, user, refetchTrigger]); 

  const { data: userProfileData, isLoading: isProfileLoading } = useDoc<DocumentData>(userDocRef);

  const isUserLoading = isAuthLoading || (!!user && isProfileLoading);
  
  const userProfile: UserProfile | null = useMemo(() => {
    if (user && userProfileData) {
        return {
            id: user.uid,
            email: user.email!,
            ...userProfileData
        } as UserProfile;
    }
    return null;
  }, [user, userProfileData]);

  const [avatar, setAvatar] = useState<string>(getImageUrl('default-user-avatar'));
  const [coverImage, setCoverImage] = useState<string>(getImageUrl('cover-default'));
  
  useEffect(() => {
    setAvatar(userProfile?.profilePicture || getImageUrl('default-user-avatar'));
    setCoverImage(userProfile?.coverImage || getImageUrl('cover-default'));
  }, [userProfile]);

  const refetchUserProfile = useCallback(() => {
      setRefetchTrigger(prev => prev + 1);
  }, []);

  return (
    <UserContext.Provider value={{ avatar, setAvatar, coverImage, setCoverImage, userProfile, isUserLoading, refetchUserProfile }}>
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
