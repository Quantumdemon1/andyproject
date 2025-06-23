import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Calendar, Clock, CheckCircle, XCircle, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
const Queue = () => {
  const [filter, setFilter] = useState("all");
  const queueItems = [{
    id: 1,
    title: "Weekly Photography Roundup",
    scheduledTime: "Apr 15, 2025 - 10:00 AM",
    type: "post",
    status: "scheduled"
  }, {
    id: 2,
    title: "Q2 Art Collection Launch",
    scheduledTime: "Apr 18, 2025 - 2:00 PM",
    type: "collection",
    status: "scheduled"
  }, {
    id: 3,
    title: "Photography Tips & Tricks",
    scheduledTime: "Apr 20, 2025 - 11:30 AM",
    type: "post",
    status: "draft"
  }, {
    id: 4,
    title: "Autumn Landscape Series",
    scheduledTime: "Apr 22, 2025 - 4:00 PM",
    type: "collection",
    status: "scheduled"
  }, {
    id: 5,
    title: "Behind the Scenes: Studio Tour",
    scheduledTime: "Apr 25, 2025 - 1:00 PM",
    type: "video",
    status: "draft"
  }];
  const filteredItems = filter === "all" ? queueItems : queueItems.filter(item => item.status === filter);
  return <MainLayout title="QUEUE" backButton={true}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Content Queue</h2>
          <Button variant="gradient" className="btn-pulse">
            <Calendar size={18} className="mr-2" /> Schedule New
          </Button>
        </div>

        <div className="mb-6 flex gap-2">
          <Button variant={filter === "all" ? "gradient" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "scheduled" ? "gradient" : "outline"} size="sm" onClick={() => setFilter("scheduled")} className="text-slate-950">
            Scheduled
          </Button>
          <Button variant={filter === "draft" ? "gradient" : "outline"} size="sm" onClick={() => setFilter("draft")}>
            Drafts
          </Button>
        </div>

        <div className="space-y-4">
          {filteredItems.map(item => <div key={item.id} className="bg-aura-charcoal border border-white/10 rounded-lg p-4 flex items-center justify-between hover:border-aura-purple transition-all">
              <div className="flex items-center">
                <div className="mr-4 bg-gradient-to-r from-aura-charcoal to-aura-blue p-3 rounded-md">
                  {item.type === "post" && <CheckCircle size={20} />}
                  {item.type === "collection" && <Calendar size={20} />}
                  {item.type === "video" && <Clock size={20} />}
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.scheduledTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.status === "scheduled" ? "notification" : "default"}>
                  {item.status === "scheduled" ? "Scheduled" : "Draft"}
                </Badge>
                <Button variant="ghost" size="sm">
                  <ArrowUpDown size={16} />
                </Button>
              </div>
            </div>)}
        </div>
      </div>
    </MainLayout>;
};
export default Queue;