
import React from "react";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/MainLayout";

const ProfileLoading = () => {
  return (
    <MainLayout title="MY PROFILE" backButton={true}>
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-aura-purple" />
      </div>
    </MainLayout>
  );
};

export default ProfileLoading;
