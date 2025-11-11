"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProcessedProvider, HealthcareData } from '@/lib/types';
import { processProviders } from '@/lib/dataUtils';

interface UserProfile {
  selectedInsurancePlans: string[];
  acceptsMedicaid: boolean;
  acceptsMedicare: boolean;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  allAvailableInsurances: string[];
  loadingInsurances: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('userProfile');
      return savedProfile ? JSON.parse(savedProfile) : {
        selectedInsurancePlans: [],
        acceptsMedicaid: false,
        acceptsMedicare: false,
      };
    }
    return { selectedInsurancePlans: [], acceptsMedicaid: false, acceptsMedicare: false };
  });

  const [allAvailableInsurances, setAllAvailableInsurances] = useState<string[]>([]);
  const [loadingInsurances, setLoadingInsurances] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    setLoadingInsurances(true);
    fetch('/data.json')
      .then(res => res.json())
      .then((jsonData: HealthcareData) => {
        const processed = processProviders(jsonData.containsPlace);
        const uniqueInsurances = new Set<string>();
        processed.forEach(p => {
          p.acceptsInsurance?.forEach(ins => uniqueInsurances.add(ins));
        });
        setAllAvailableInsurances(Array.from(uniqueInsurances).sort());
        setLoadingInsurances(false);
      })
      .catch(err => {
        console.error('Error loading insurance data:', err);
        setLoadingInsurances(false);
      });
  }, []);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, allAvailableInsurances, loadingInsurances }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}