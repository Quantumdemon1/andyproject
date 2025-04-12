
import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PlusCircle, Folder, Image, Video, FileText, MoreHorizontal } from "lucide-react";

const Collections = () => {
  const [activeTab, setActiveTab] = useState("my-collections");
  
  // Mock collections data
  const myCollections = [
    {
      id: "1",
      title: "Nature Photography",
      itemCount: 24,
      thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop&q=80",
      type: "photos"
    },
    {
      id: "2",
      title: "Urban Landscapes",
      itemCount: 16,
      thumbnailUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=200&fit=crop&q=80",
      type: "photos"
    },
    {
      id: "3",
      title: "Portrait Photography",
      itemCount: 32,
      thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=200&fit=crop&q=80",
      type: "photos"
    },
    {
      id: "4",
      title: "Photography Tutorials",
      itemCount: 8,
      thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=200&fit=crop&q=80",
      type: "videos"
    }
  ];
  
  const savedCollections = [
    {
      id: "5",
      title: "Inspirational Art",
      creator: "Marcus Lee",
      itemCount: 18,
      thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&h=200&fit=crop&q=80",
      type: "photos"
    },
    {
      id: "6",
      title: "Digital Illustrations",
      creator: "Sophia Rivera",
      itemCount: 12,
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop&q=80",
      type: "photos"
    }
  ];

  const CollectionCard = ({ collection, isSaved = false }) => {
    const getTypeIcon = (type) => {
      switch (type) {
        case "photos": return <Image size={18} />;
        case "videos": return <Video size={18} />;
        default: return <FileText size={18} />;
      }
    };

    return (
      <Card className="bg-aura-charcoal border-white/10 overflow-hidden hover:border-aura-blue/50 transition-colors cursor-pointer">
        <div className="relative h-40">
          <img 
            src={collection.thumbnailUrl} 
            alt={collection.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-sm">
              {getTypeIcon(collection.type)}
              <span>{collection.itemCount} items</span>
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-medium line-clamp-1">{collection.title}</h3>
              {isSaved && <p className="text-sm text-gray-400">by {collection.creator}</p>}
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout title="COLLECTIONS" backButton searchBar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Tabs 
            defaultValue="my-collections" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-white/5 w-fit">
              <TabsTrigger value="my-collections" className="data-[state=active]:bg-aura-blue">
                My Collections
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-aura-blue">
                Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button className="bg-aura-blue hover:bg-aura-blue/80 text-white">
            <PlusCircle size={18} className="mr-2" />
            New Collection
          </Button>
        </div>
        
        <div>
          <TabsContent value="my-collections" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-center bg-white/5 border border-white/10 border-dashed rounded-lg h-64 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="text-center">
                  <Folder size={48} className="mx-auto mb-3 text-aura-blue" />
                  <p className="text-lg font-medium">Create Collection</p>
                  <p className="text-sm text-gray-400 mt-1">Organize your content</p>
                </div>
              </div>
              
              {myCollections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-0">
            {savedCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCollections.map(collection => (
                  <CollectionCard key={collection.id} collection={collection} isSaved={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="glass-morphism inline-flex p-6 rounded-full mb-4">
                  <Folder size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">No saved collections</h3>
                <p className="text-gray-400">Discover creators and save their collections</p>
              </div>
            )}
          </TabsContent>
        </div>
      </div>
    </MainLayout>
  );
};

export default Collections;
