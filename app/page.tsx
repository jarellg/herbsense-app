'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Scan, BookOpen, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/provider';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const { user, loading, signInAnonymously } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/scan');
    }
  }, [user, loading, router]);

  const handleGetStarted = async () => {
    setIsVerifying(true);
    try {
      await signInAnonymously();
      router.push('/scan');
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign in failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Leaf className="w-8 h-8 text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900">
            Welcome to HerbSense
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Identify plants instantly and explore evidence-based herbal medicine
            information. Your personal guide to the world of medicinal plants.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 text-left">
                <strong>Educational Use Only:</strong> This application provides
                information for educational purposes. Always consult healthcare
                professionals before using any herbal remedies. Never
                self-diagnose or self-treat serious conditions.
              </p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleGetStarted}
            disabled={isVerifying}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg px-8 py-6 h-auto disabled:opacity-50"
          >
            <Scan className="w-5 h-5 mr-2" />
            {isVerifying ? 'Starting...' : 'Get Started - Free'}
          </Button>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <Scan className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Instant Identification</h3>
                <p className="text-sm text-gray-600">
                  Upload or capture a photo to identify plants with AI-powered recognition
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Comprehensive Monographs</h3>
                <p className="text-sm text-gray-600">
                  Access detailed herbal information with evidence grades and citations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg">Pro Features</h3>
                <p className="text-sm text-gray-600">
                  Upgrade for unlimited scans and expanded content
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
