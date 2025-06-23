import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCreatorTiers,
  createSubscriptionTier,
  updateSubscriptionTier,
  deleteSubscriptionTier,
  SubscriptionTier
} from "@/api/subscriptionTiersApi";

const TierManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    benefits: ['']
  });

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['subscription-tiers', user?.id],
    queryFn: () => user ? getCreatorTiers(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', benefits: [''] });
    setIsCreating(false);
    setEditingTier(null);
  };

  const handleCreateTier = async () => {
    if (!user || !formData.name || !formData.price) return;

    const tierData = {
      creator_id: user.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      benefits: formData.benefits.filter(b => b.trim() !== ''),
      is_active: true,
      display_order: (tiers?.length || 0) + 1
    };

    const result = await createSubscriptionTier(tierData);
    if (result) {
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers', user.id] });
      resetForm();
    }
  };

  const handleUpdateTier = async (tierId: string) => {
    if (!formData.name || !formData.price) return;

    const updates = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      benefits: formData.benefits.filter(b => b.trim() !== '')
    };

    const result = await updateSubscriptionTier(tierId, updates);
    if (result) {
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers', user?.id] });
      resetForm();
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (window.confirm('Are you sure you want to delete this tier?')) {
      const success = await deleteSubscriptionTier(tierId);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['subscription-tiers', user?.id] });
      }
    }
  };

  const startEditing = (tier: SubscriptionTier) => {
    setFormData({
      name: tier.name,
      description: tier.description || '',
      price: tier.price.toString(),
      benefits: tier.benefits.length > 0 ? tier.benefits : ['']
    });
    setEditingTier(tier.id);
    setIsCreating(false);
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading tiers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Subscription Tiers</h3>
          <p className="text-gray-400">Manage your subscription offerings</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingTier !== null}
          className="bg-aura-blue hover:bg-aura-blue/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingTier) && (
        <Card className="bg-aura-charcoal border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              {isCreating ? 'Create New Tier' : 'Edit Tier'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier-name" className="text-gray-300">Tier Name</Label>
                <Input
                  id="tier-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Basic, Premium, VIP"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="tier-price" className="text-gray-300">Price (USD)</Label>
                <Input
                  id="tier-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="9.99"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tier-description" className="text-gray-300">Description</Label>
              <Textarea
                id="tier-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this tier offers..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Benefits</Label>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Enter benefit..."
                      className="bg-white/5 border-white/10 text-white"
                    />
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeBenefit(index)}
                        className="border-white/10 text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBenefit}
                  className="border-white/10 text-gray-400 hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={() => isCreating ? handleCreateTier() : handleUpdateTier(editingTier!)}
                disabled={!formData.name || !formData.price}
                className="bg-aura-blue hover:bg-aura-blue/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Create Tier' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Tiers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiers?.map((tier) => (
          <Card key={tier.id} className="bg-aura-charcoal border-white/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{tier.name}</CardTitle>
                  {tier.description && (
                    <CardDescription className="text-gray-400">
                      {tier.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary" className="bg-aura-blue text-white">
                  ${tier.price}/mo
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {tier.benefits?.map((benefit, index) => (
                  <div key={index} className="text-sm text-gray-300">
                    • {benefit}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(tier)}
                  disabled={editingTier !== null || isCreating}
                  className="border-white/10 text-gray-400 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTier(tier.id)}
                  disabled={editingTier !== null || isCreating}
                  className="border-red-500/20 text-red-400 hover:text-red-300 hover:border-red-500/40"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tiers?.length === 0 && (
        <Card className="bg-aura-charcoal border-white/10">
          <CardContent className="pt-6">
            <p className="text-center text-gray-400">
              No subscription tiers created yet. Create your first tier to start accepting subscriptions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TierManagement;
