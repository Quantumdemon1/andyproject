
import React from "react";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/MainLayout";

const ProfileLoading = () => {
  return (
    <MainLayout title="MY PROFILE" backButton={true}>
      <div className="flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-aura-purple mb-4" />
        <p className="text-gray-400 text-sm">Loading profile data...</p>
      </div>
    </MainLayout>
  );
};

export default ProfileLoading;
