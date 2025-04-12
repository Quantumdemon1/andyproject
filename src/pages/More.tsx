
import React from "react";
import MainLayout from "@/components/MainLayout";
import { Settings, HelpCircle, CreditCard, Shield, Bell, Moon, Globe, LifeBuoy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const More = () => {
  const menuGroups = [
    {
      title: "Account",
      items: [
        { icon: Settings, label: "Account Settings", action: "link" },
        { icon: CreditCard, label: "Billing & Subscriptions", action: "link" },
        { icon: Shield, label: "Privacy & Security", action: "link" }
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", action: "link" },
        { icon: Moon, label: "Dark Mode", action: "toggle", active: true },
        { icon: Globe, label: "Language", action: "link", info: "English (US)" }
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", action: "link" },
        { icon: LifeBuoy, label: "Contact Support", action: "link" }
      ]
    }
  ];

  return (
    <MainLayout title="MORE" backButton={true}>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">More Options</h1>
          <p className="text-gray-400">
            Manage your account settings, preferences, and get help with your account.
          </p>
        </div>

        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-8">
            <h2 className="text-lg font-medium text-gray-300 mb-4">{group.title}</h2>
            <div className="space-y-1 bg-aura-charcoal rounded-lg overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <div className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-aura-charcoal to-aura-blue p-2 rounded-md mr-3">
                        <item.icon size={18} />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {item.info && <span className="text-sm text-gray-500 mr-3">{item.info}</span>}
                      {item.action === "toggle" ? (
                        <Switch checked={item.active} />
                      ) : (
                        <ChevronIcon />
                      )}
                    </div>
                  </div>
                  {itemIndex < group.items.length - 1 && <Separator className="bg-white/10" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-12">
          <Button variant="outline" className="text-red-400 border-red-800/30 hover:bg-red-900/20 hover:text-red-300 w-full">
            <Trash2 size={16} className="mr-2" /> Delete Account
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

const ChevronIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-gray-500"
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default More;
