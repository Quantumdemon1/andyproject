
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Heart, MessageCircle } from "lucide-react";
import { fetchCreators } from "@/api/userProfilesApi";
import { Skeleton } from "@/components/ui/skeleton";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: creators, isLoading, error } = useQuery({
    queryKey: ['discover-creators'],
    queryFn: fetchCreators,
  });

  const filteredCreators = creators?.filter(creator => 
    creator.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.tags?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Discover Creators</h1>
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Discover Creators</h1>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search creators, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Failed to load creators. Please try again later.</p>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery ? 'No creators found matching your search.' : 'No creators found.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCreators.map((creator) => (
                <Card key={creator.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator.avatar_url || undefined} />
                        <AvatarFallback>
                          {(creator.display_name || creator.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {creator.display_name || creator.username || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">@{creator.username || 'unknown'}</p>
                      </div>
                    </div>

                    {creator.bio && (
                      <p className="text-gray-700 mb-4 text-sm line-clamp-3">{creator.bio}</p>
                    )}

                    {creator.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {creator.tags.split(',').slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {creator.follower_count || 0} followers
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {creator.post_count || 0} posts
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Discover;
