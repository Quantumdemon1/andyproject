
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TierManagement from "@/components/stripe/TierManagement";

const SubscriptionsTab: React.FC = () => {
  const { toast } = useToast();
  const [subscriptionPrice, setSubscriptionPrice] = useState("9.99");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setSubscriptionPrice(value);
  };
  
  const saveSubscriptionPrice = () => {
    toast({
      title: "Price updated",
      description: `Your subscription price has been set to $${subscriptionPrice}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Legacy subscription settings - now secondary */}
      <Card>
        <CardHeader>
          <CardTitle>Legacy Subscription Settings</CardTitle>
          <CardDescription>
            Legacy single-tier subscription (consider migrating to tier system below)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subscription-price">Monthly Subscription Price ($)</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input 
                    id="subscription-price" 
                    value={subscriptionPrice}
                    onChange={handlePriceChange}
                    className="pl-8"
                  />
                </div>
                <Button onClick={saveSubscriptionPrice}>Save</Button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Platform fee: 20%. You'll receive ${(Number(subscriptionPrice) * 0.8).toFixed(2)} per subscription.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Subscription Benefits</h3>
              <p className="text-sm text-gray-400 mb-4">
                Let subscribers know what they'll get when they subscribe to your content
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <div className="flex-1">Exclusive content</div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <div className="flex-1">Direct messaging</div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <div className="flex-1">Early access to new releases</div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <Button variant="outline" className="w-full">
                  <PlusCircle size={16} className="mr-2" />
                  Add Benefit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Tier Management System */}
      <TierManagement />
    </div>
  );
};

export default SubscriptionsTab;
