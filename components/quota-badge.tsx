'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, Scan } from 'lucide-react';
import { useLimits } from '@/hooks/use-limits';
import { useEntitlement } from '@/hooks/use-entitlement';

export function QuotaBadge() {
  const { scansRemaining, loading: limitsLoading } = useLimits();
  const { isPro, loading: entitlementLoading } = useEntitlement();

  if (limitsLoading || entitlementLoading) {
    return null;
  }

  if (isPro) {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
        <Sparkles className="w-3 h-3 mr-1" />
        Pro - Unlimited
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-white">
      <Scan className="w-3 h-3 mr-1" />
      {scansRemaining} scans left today
    </Badge>
  );
}
