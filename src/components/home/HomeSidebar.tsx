
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Dollar, Svg, Calendar } from "lucide-react";

const HomeSidebar = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-aura-charcoal border-white/10">
        <CardHeader className="w-full bg-gradient-to-r from-aura-blue to-aura-purple hover:from-aura-purple hover:to-aura-blue transition-colors duration-300 text-white py-6">
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
        <CardHeader className="w-full bg-gradient-to-r from-aura-blue to-aura-purple hover:from-aura-purple hover:to-aura-blue transition-colors duration-300 text-white py-6">
          <CardTitle className="text-lg">SCHEDULED EVENTS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Now you can schedule Posts, Messages and Streams to grow your online presence, and view it in Calendar</p>
          
          <div className="flex justify-center my-6">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center bg-white/5 text-gray-400">
              <Calendar size={24} />
            </div>
          </div>
          
          <p className="text-sm text-center text-gray-400">You have no scheduled events.</p>
          
          <div className="bg-white/5 h-12 flex items-center justify-center mt-4 rounded-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus text-gray-400"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
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
            <Mail size={60} className="text-white" />
            <div className="absolute transform translate-x-6 translate-y-4">
              <Dollar size={30} className="text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeSidebar;
