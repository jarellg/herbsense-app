'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/provider';
import { useEntitlement } from '@/hooks/use-entitlement';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { Settings as SettingsIcon, Sparkles, Crown, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { isPro, daysRemaining, loading: entitlementLoading } = useEntitlement();
  const supabase = useSupabaseBrowser();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return;
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-gray-600 mt-2">Manage your account and subscription</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <div className="flex items-center gap-2 mt-1">
                  {user?.is_anonymous ? (
                    <Badge variant="secondary">Anonymous User</Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Mail className="w-3 h-3 mr-1" />
                      Email User
                    </Badge>
                  )}
                </div>
              </div>

              {user?.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-xs text-gray-600 mt-1 font-mono">{user?.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entitlementLoading ? (
                <p className="text-gray-500">Loading subscription status...</p>
              ) : isPro ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro Member
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan Benefits</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>✓ Unlimited plant scans</li>
                      <li>✓ Expanded monograph content</li>
                      <li>✓ Priority support</li>
                    </ul>
                  </div>
                  {daysRemaining !== null && (
                    <div>
                      <p className="text-sm text-gray-500">Subscription Status</p>
                      <p className="text-gray-900 mt-1">
                        {daysRemaining > 0
                          ? `Active - ${daysRemaining} days remaining`
                          : 'Active'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <Badge variant="secondary">Free Plan</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Limits</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>• 5 scans per day</li>
                      <li>• Basic monograph access</li>
                    </ul>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {upgrading ? 'Loading...' : 'Upgrade to Pro - $9.99/mo'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About HerbSense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>
                HerbSense is an educational platform for plant identification and herbal
                medicine information.
              </p>
              <p className="font-semibold text-gray-900">
                Always consult healthcare professionals before using herbal remedies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
