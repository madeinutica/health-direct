"use client";

import React, { useState, useEffect } from 'react';
import TabBar from '@/components/TabBar';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, updateProfile, allAvailableInsurances, loadingInsurances } = useUserProfile();
  const [insuranceSearchTerm, setInsuranceSearchTerm] = useState('');
  const [filteredInsurances, setFilteredInsurances] = useState<string[]>([]);

  useEffect(() => {
    if (allAvailableInsurances.length > 0) {
      setFilteredInsurances(
        allAvailableInsurances.filter(ins =>
          ins.toLowerCase().includes(insuranceSearchTerm.toLowerCase())
        )
      );
    }
  }, [insuranceSearchTerm, allAvailableInsurances]);

  const handleInsuranceToggle = (insuranceName: string, checked: boolean) => {
    let newSelectedPlans: string[];
    if (checked) {
      newSelectedPlans = [...profile.selectedInsurancePlans, insuranceName];
    } else {
      newSelectedPlans = profile.selectedInsurancePlans.filter(
        (plan) => plan !== insuranceName
      );
    }
    updateProfile({ selectedInsurancePlans: newSelectedPlans });
    toast.success(`Insurance plan ${checked ? 'added' : 'removed'}.`);
  };

  const handleMedicaidToggle = (checked: boolean) => {
    updateProfile({ acceptsMedicaid: checked });
    toast.success(`Medicaid preference ${checked ? 'enabled' : 'disabled'}.`);
  };

  const handleMedicareToggle = (checked: boolean) => {
    updateProfile({ acceptsMedicare: checked });
    toast.success(`Medicare preference ${checked ? 'enabled' : 'disabled'}.`);
  };

  return (
    <div className="min-h-screen bg-background pb-tab-safe flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-top">
        <div className="container py-4">
          <h1 className="text-large-title text-foreground mb-1">
            My Profile & Insurance
          </h1>
          <p className="text-subhead text-muted-foreground">
            Manage your healthcare preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container py-6 space-y-8">
        {/* Insurance Selection */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-title-2 text-foreground mb-4">Your Insurance Plans</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicaid"
                checked={profile.acceptsMedicaid}
                onCheckedChange={handleMedicaidToggle}
              />
              <Label htmlFor="medicaid" className="text-body font-medium">
                Medicaid
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicare"
                checked={profile.acceptsMedicare}
                onCheckedChange={handleMedicareToggle}
              />
              <Label htmlFor="medicare" className="text-body font-medium">
                Medicare
              </Label>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for your insurance plan..."
              value={insuranceSearchTerm}
              onChange={(e) => setInsuranceSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {loadingInsurances ? (
            <div className="text-center py-8 text-muted-foreground">Loading insurance plans...</div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 hide-scrollbar">
              {filteredInsurances.length === 0 && insuranceSearchTerm ? (
                <p className="text-muted-foreground text-center py-4">No matching insurance plans found.</p>
              ) : (
                filteredInsurances.map((insurance) => (
                  <div key={insurance} className="flex items-center space-x-2">
                    <Checkbox
                      id={insurance}
                      checked={profile.selectedInsurancePlans.includes(insurance)}
                      onCheckedChange={(checked) =>
                        handleInsuranceToggle(insurance, checked as boolean)
                      }
                    />
                    <Label htmlFor={insurance} className="text-body">
                      {insurance}
                    </Label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Currently Selected Plans */}
        {profile.selectedInsurancePlans.length > 0 || profile.acceptsMedicaid || profile.acceptsMedicare ? (
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-title-2 text-foreground mb-4">Your Current Coverage</h2>
            <div className="flex flex-wrap gap-2">
              {profile.acceptsMedicaid && (
                <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
                  Medicaid
                </span>
              )}
              {profile.acceptsMedicare && (
                <span className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  Medicare
                </span>
              )}
              {profile.selectedInsurancePlans.map((plan) => (
                <span
                  key={plan}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold"
                >
                  {plan}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No insurance plans selected. Select your plans above to see in-network providers.
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
}