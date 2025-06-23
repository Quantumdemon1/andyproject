
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Creator Settings</CardTitle>
        <CardDescription>
          Manage your creator account settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Account Privacy</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="private-account" className="text-sm">Private Account</label>
                <input type="checkbox" id="private-account" className="toggle" />
              </div>
              <p className="text-xs text-gray-500">
                When enabled, only your subscribers can view your content
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Payment Settings</h3>
            <Button variant="outline">Connect Payment Method</Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Creator Status</h3>
            <div className="bg-green-500/20 text-green-500 p-4 rounded-md">
              <p>Your account is verified as a creator</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
