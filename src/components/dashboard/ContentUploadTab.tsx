
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Image as ImageIcon, Video, FileText, 
  ChevronRight, PlusCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RecentContentList from "./RecentContentList";

const ContentUploadTab: React.FC = () => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload complete",
            description: "Your content has been successfully uploaded.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload New Content</CardTitle>
          <CardDescription>
            Share your latest creations with your subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter a title for your content" />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your content..." className="resize-none" rows={4} />
            </div>
            
            <div>
              <Label>Content Type</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 border-dashed">
                  <ImageIcon size={24} className="mb-2" />
                  <span>Image</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 border-dashed">
                  <Video size={24} className="mb-2" />
                  <span>Video</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 border-dashed">
                  <FileText size={24} className="mb-2" />
                  <span>Text</span>
                </Button>
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline">Cancel</Button>
          <Button onClick={simulateUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Content"}
          </Button>
        </CardFooter>
      </Card>
      
      <RecentContentList />
    </>
  );
};

export default ContentUploadTab;
