
import React from "react";
import MainLayout from "@/components/MainLayout";
import CreatorCard from "@/components/CreatorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SidebarContent = () => (
  <div className="space-y-6">
    <Card className="bg-aura-charcoal border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">SUBSCRIPTION</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Subscription price and promotions</h3>
            <span className="text-gray-400">&gt;</span>
          </div>
          <p className="text-sm text-gray-400">Free subscription</p>
        </div>
      </CardContent>
    </Card>
    
    <Card className="bg-aura-charcoal border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">SCHEDULED EVENTS</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400">Now you can schedule Posts, Messages and Streams to grow your online presence, and view it in Calendar</p>
        
        <div className="flex justify-center my-6">
          <div className="h-16 w-16 rounded-lg flex items-center justify-center bg-white/5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          </div>
        </div>
        
        <p className="text-sm text-center text-gray-400">You have no scheduled events.</p>
        
        <div className="bg-white/5 h-12 flex items-center justify-center mt-4 rounded-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus text-gray-400"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </div>
        
        <div className="mt-4 flex justify-end">
          <span className="text-aura-blue text-sm cursor-pointer">VIEW QUEUE</span>
        </div>
      </CardContent>
    </Card>
    
    <Card className="bg-aura-charcoal border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-aura-blue">P-P-V MESSAGES</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-br from-aura-blue to-aura-purple/50 p-6 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail text-white"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <div className="absolute transform translate-x-6 translate-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign text-white"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const Index = () => {
  // Mock data for creators
  const creators = [
    {
      id: "1",
      name: "Emma Johnson",
      username: "emmaphotography",
      description: "Nature photographer capturing landscapes and wildlife in their natural habitats.",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces&q=80",
      price: "5.99",
    },
    {
      id: "2",
      name: "Marcus Lee",
      username: "marcusarts",
      description: "Contemporary artist specializing in abstract paintings and digital illustrations.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&q=80",
      isSubscribed: true,
      price: "7.99",
    },
    {
      id: "3",
      name: "Sophia Rivera",
      username: "sophiadesigns",
      description: "Graphic designer and illustrator creating minimalist designs and custom logos.",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces&q=80",
      price: "4.99",
    },
    {
      id: "4",
      name: "David Wilson",
      username: "davestudios",
      description: "Fashion photographer working with top models and clothing brands globally.",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces&q=80",
      price: "9.99",
    },
    {
      id: "5",
      name: "Olivia Chen",
      username: "oliviascreations",
      description: "Watercolor artist creating delicate landscapes and botanical illustrations.",
      imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=faces&q=80",
      price: "6.99",
    },
    {
      id: "6",
      name: "James Peterson",
      username: "jamesvisuals",
      description: "Filmmaker and photographer specializing in cinematic storytelling.",
      imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop&crop=faces&q=80",
      price: "8.99",
    },
  ];

  return (
    <MainLayout title="HOME" icons searchBar rightSidebar={<SidebarContent />}>
      <div>
        <div className="mb-6">
          <Input 
            className="bg-white/5 border-white/10 focus:border-aura-blue p-6 text-lg placeholder:text-gray-500"
            placeholder="Compose new post..."
          />
          
          <div className="flex items-center gap-4 mt-4 text-gray-400">
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </button>
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
            </button>
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/><path d="M8 22h8"/></svg>
            </button>
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
            </button>
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            </button>
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
            </button>
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-at-sign"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
            </button>
            <button className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <Button className="rounded-full bg-white/10 text-white hover:bg-white/20">
            All
          </Button>
          <Button className="rounded-full bg-transparent text-gray-400 hover:bg-white/10 hover:text-white">
            Purchased
          </Button>
        </div>
        
        <div className="flex border border-aura-blue/30 p-3 rounded-lg mb-6 items-center bg-aura-blue/5">
          <div className="text-aura-blue mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm">Your subscription to <span className="font-semibold">Marcus Lee</span> has expired on Feb 23</p>
          </div>
          <Button variant="link" className="text-aura-blue font-normal px-3">
            DISMISS
          </Button>
        </div>
        
        <div className="mb-6">
          <Button className="w-full bg-aura-blue hover:bg-aura-blue/80 text-white py-6">
            LOAD NEW POSTS
          </Button>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Discover Creators</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map(creator => (
            <CreatorCard 
              key={creator.id}
              name={creator.name}
              username={creator.username}
              description={creator.description}
              imageUrl={creator.imageUrl}
              isSubscribed={creator.isSubscribed}
              price={creator.price}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
