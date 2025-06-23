
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, Video, FileText, 
  ChevronRight, PlusCircle
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: "image" | "video" | "text";
  thumbnail?: string;
  likes: number;
  comments: number;
  createdAt: Date;
}

const RecentContentList: React.FC = () => {
  const recentContent: ContentItem[] = [
    {
      id: "1",
      title: "Abstract Landscape Series #4",
      type: "image",
      thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=200&fit=crop",
      likes: 245,
      comments: 37,
      createdAt: new Date(2025, 3, 10)
    },
    {
      id: "2",
      title: "Behind the Scenes: My Creative Process",
      type: "video",
      thumbnail: "https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?w=300&h=200&fit=crop",
      likes: 512,
      comments: 98,
      createdAt: new Date(2025, 3, 8)
    },
    {
      id: "3",
      title: "Thoughts on Modern Digital Art",
      type: "text",
      likes: 89,
      comments: 23,
      createdAt: new Date(2025, 3, 5)
    }
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={16} className="text-blue-500" />;
      case 'video':
        return <Video size={16} className="text-red-500" />;
      case 'text':
        return <FileText size={16} className="text-green-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>
              Your recently uploaded content
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <PlusCircle size={16} className="mr-2" />
            New Content
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentContent.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center space-x-4">
                {item.thumbnail ? (
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {getContentIcon(item.type)}
                  </div>
                )}
                <div>
                  <div className="flex items-center">
                    {getContentIcon(item.type)}
                    <span className="ml-2 text-xs text-gray-400">
                      {item.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-400 space-x-2">
                    <span>{item.likes} likes</span>
                    <span>•</span>
                    <span>{item.comments} comments</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight size={16} />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentContentList;
