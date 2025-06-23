
import { useQuery } from "@tanstack/react-query";
import { fetchCreators } from "@/api/userProfilesApi";
import { CreatorCard } from "@/components/CreatorCard";
import { Skeleton } from "@/components/ui/skeleton";

const CreatorsListing = () => {
  const { data: creators, isLoading, error } = useQuery({
    queryKey: ['creators'],
    queryFn: fetchCreators,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load creators. Please try again later.</p>
      </div>
    );
  }

  if (!creators || creators.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No creators found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map((creator) => (
        <CreatorCard
          key={creator.id}
          id={creator.id}
          name={creator.display_name || creator.username || 'Unknown'}
          username={creator.username || ''}
          avatar={creator.avatar_url || ''}
          cover={creator.cover_url || ''}
          bio={creator.bio || ''}
          followers={creator.follower_count || 0}
          posts={creator.post_count || 0}
          tags={creator.tags ? creator.tags.split(',').map(tag => tag.trim()) : []}
        />
      ))}
    </div>
  );
};

export default CreatorsListing;
