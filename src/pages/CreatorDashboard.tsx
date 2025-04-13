import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Upload, Image as ImageIcon, Video, FileText, Paintbrush, 
  TrendingUp, DollarSign, Users, MessageSquare, Settings, 
  ChevronRight, PlusCircle, CreditCard, BanknoteIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import BankAccountForm from "@/components/stripe/BankAccountForm";
import BankAccountsList from "@/components/stripe/BankAccountsList";
import StripeConnect from "@/components/stripe/StripeConnect";

interface AnalyticItem {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

interface ContentItem {
  id: string;
  title: string;
  type: "image" | "video" | "text";
  thumbnail?: string;
  likes: number;
  comments: number;
  createdAt: Date;
}

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [subscriptionPrice, setSubscriptionPrice] = useState("9.99");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  
  const analyticItems: AnalyticItem[] = [
    {
      label: "Subscribers",
      value: 1243,
      change: 12.5,
      icon: <Users className="h-4 w-4 text-blue-500" />
    },
    {
      label: "Revenue",
      value: "$3,854",
      change: 8.2,
      icon: <DollarSign className="h-4 w-4 text-green-500" />
    },
    {
      label: "Engagement",
      value: "24%",
      change: -2.4,
      icon: <TrendingUp className="h-4 w-4 text-purple-500" />
    },
    {
      label: "Messages",
      value: 87,
      change: 15.8,
      icon: <MessageSquare className="h-4 w-4 text-orange-500" />
    }
  ];
  
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
    <MainLayout title="CREATOR DASHBOARD" backButton>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {analyticItems.map((item, index) => (
            <Card key={index} className="bg-aura-charcoal border-white/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                  </div>
                  {item.icon}
                </div>
                <div className="mt-2 text-sm">
                  <span className={`font-medium ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                  <span className="text-gray-400 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="upload" className="mb-8">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="upload">
              <Upload size={16} className="mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <DollarSign size={16} className="mr-2" /> Subscriptions
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp size={16} className="mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard size={16} className="mr-2" /> Payments
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings size={16} className="mr-2" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
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
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Settings</CardTitle>
                <CardDescription>
                  Manage your subscription plans and pricing
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
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Track your growth and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="mb-2">Analytics visualization coming soon</p>
                    <p className="text-sm text-gray-500">
                      Track content performance, subscriber growth, and engagement metrics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Connect with Stripe</CardTitle>
                    <CardDescription>
                      Set up your payment processing to receive funds
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StripeConnect />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Bank Accounts</CardTitle>
                      <CardDescription>
                        Manage your connected bank accounts
                      </CardDescription>
                    </div>
                    <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <PlusCircle size={16} className="mr-2" />
                          Add Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add Bank Account</DialogTitle>
                          <DialogDescription>
                            Enter your bank account details to receive payments
                          </DialogDescription>
                        </DialogHeader>
                        <BankAccountForm />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <BankAccountsList />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      Your recent payments and transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <div className="text-center">
                        <BanknoteIcon size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No transactions yet</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">View all transactions</Button>
                    <span className="text-xs text-muted-foreground">Updated just now</span>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
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
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CreatorDashboard;
