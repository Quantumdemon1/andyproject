
import React from "react";
import MainLayout from "@/components/MainLayout";
import { FolderArchive, Lock, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Vault = () => {
  const vaultItems = [
    { id: 1, name: "Secure Documents", count: 12, icon: FileText },
    { id: 2, name: "Private Collection", count: 7, icon: FolderArchive },
    { id: 3, name: "Encrypted Files", count: 9, icon: Lock },
  ];

  return (
    <MainLayout title="VAULT" backButton={true}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Secured Content</h2>
          <Button variant="gradient" className="btn-pulse">
            <Plus size={18} className="mr-2" /> Add to Vault
          </Button>
        </div>

        <p className="text-gray-400 mb-6">
          Your vault keeps your most valuable content secure and private. Only you can access these items.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaultItems.map((item) => (
            <Card key={item.id} className="bg-aura-charcoal border-white/10 hover:border-aura-purple transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{item.name}</CardTitle>
                <div className="bg-gradient-to-r from-aura-charcoal to-aura-blue p-2 rounded-md">
                  <item.icon size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  {item.count} items stored
                </p>
                <div className="h-1 w-full bg-gray-700 mt-4 rounded-full overflow-hidden">
                  <div 
                    className="h-1 bg-gradient-to-r from-aura-charcoal to-aura-purple" 
                    style={{ width: `${(item.count / 20) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Vault;
