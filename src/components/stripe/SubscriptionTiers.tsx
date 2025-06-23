
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { getCreatorTiers, SubscriptionTier } from "@/api/subscriptionTiersApi";
import SubscribeButton from "./SubscribeButton";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionTiersProps {
  creatorId: string;
  className?: string;
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({ creatorId, className }) => {
  const { data: tiers, isLoading, error } = useQuery({
    queryKey: ['subscription-tiers', creatorId],
    queryFn: () => getCreatorTiers(creatorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-aura-charcoal border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-24 bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-4 bg-white/10" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full bg-white/10" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full bg-white/10" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !tiers || tiers.length === 0) {
    return (
      <Card className="bg-aura-charcoal border-white/10">
        <CardContent className="pt-6">
          <p className="text-center text-gray-400">
            {error ? 'Failed to load subscription tiers' : 'No subscription tiers available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {tiers.map((tier) => (
        <Card key={tier.id} className="bg-aura-charcoal border-white/10 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{tier.name}</CardTitle>
              {tier.display_order === 1 && (
                <Badge variant="secondary" className="bg-aura-blue text-white">
                  Popular
                </Badge>
              )}
            </div>
            {tier.description && (
              <CardDescription className="text-gray-400">
                {tier.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="flex-1">
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">${tier.price}</span>
              <span className="text-gray-400">/month</span>
            </div>
            
            <div className="space-y-3">
              {tier.benefits?.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-aura-blue flex-shrink-0" />
                  <span className="text-sm text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter>
            <SubscribeButton
              creatorId={creatorId}
              price={tier.price}
              tierId={tier.id}
              tierName={tier.name}
              variant="default"
              className="w-full bg-aura-blue hover:bg-aura-blue/90"
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionTiers;
