"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageIcon, Loader2, UserCircle, Crown, ShieldCheck, LogOut, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { getScanHistory } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Bu tip daha sonra veritabanından gelen gerçek veri yapısı ile değiştirilecek
interface ImageResult {
  id: string;
  imageUrl: string;
  result: string;
  timestamp: Date;
  raw?: string;
}

interface ScanDetail {
  id: string;
  imageUrl: string;
  result: string;
  timestamp: Date;
  raw?: string;
}

// Force a re-commit to trigger a new build
export default function ProfilePage() {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const [uploadHistory, setUploadHistory] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Örnek abonelik durumu - gerçek uygulamada veritabanından alınacak
  const [subscriptionStatus, setSubscriptionStatus] = useState<'Not subscribed yet' | 'Lite' | 'Pro'>('Not subscribed yet');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && user) {
      // Fetch real scan history from database
      fetchUserHistory();
    }
  }, [loading, isAuthenticated, router, user]);

  const fetchUserHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const history = await getScanHistory(user.id);
      setUploadHistory(history.map(item => ({
        id: item.id,
        imageUrl: item.image_url,
        result: `${item.is_ai ? 'AI Generated' : 'Real Image'} (${Math.round(item.confidence * 100)}%)`,
        timestamp: new Date(item.created_at),
        raw: item.raw_result
      })));
    } catch (error) {
      console.error('Error fetching user history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Profile Card */}
      <div className="relative flex flex-col items-center bg-white rounded-2xl shadow-xl p-8 mb-12 border">
        {/* Sign Out top right */}
        <Button onClick={() => signOut()} variant="ghost" size="icon" className="absolute top-4 right-4" title="Sign Out">
          <LogOut className="h-5 w-5" />
        </Button>
        {/* Avatar */}
        <Avatar className="h-20 w-20 mb-4 shadow-lg border-4 border-fuchsia-100">
          {user?.user_metadata?.avatar_url ? (
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name || user.user_metadata.name || user.email} />
          ) : null}
          <AvatarFallback className="text-white text-3xl animate-text-gradient">
            {user?.user_metadata?.full_name?.[0] || user?.user_metadata?.name?.[0] || user?.email?.[0] || 'W'}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mb-1">
          {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Welcome!'}
        </h1>
        <p className="text-muted-foreground text-lg mb-4">{user?.email}</p>
        {/* Subscription Status */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            {subscriptionStatus === 'Pro' ? (
              <span className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
                <Crown className="h-4 w-4 mr-1" /> Pro Member
              </span>
            ) : subscriptionStatus === 'Lite' ? (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 mr-1" /> Lite Plan
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 mr-1" /> Not Subscribed
            </span>
            )}
            {subscriptionStatus === 'Not subscribed yet' && (
              <Button asChild size="sm" className="ml-2 text-white font-bold px-4 py-1 rounded-full shadow hover:scale-105 transition-all animate-gradient">
                <Link href="/pricing"><ArrowUpRight className="h-4 w-4 mr-1" /> Upgrade now</Link>
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {subscriptionStatus === 'Pro' && 'Unlimited scans, priority support, advanced analytics.'}
            {subscriptionStatus === 'Lite' && '5 scans/month, basic support, detailed reports.'}
            {subscriptionStatus === 'Not subscribed yet' && 'Upgrade for unlimited scans & premium features.'}
          </span>
        </div>
      </div>

      {/* Scan History */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Scan History</h2>
        {isLoading ? (
          <div className="flex justify-center my-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : uploadHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {uploadHistory.map((item) => (
              <Card key={item.id} className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow border border-fuchsia-100 group">
                <div className="aspect-square relative bg-muted flex items-center justify-center">
                  <img 
                    src={item.imageUrl} 
                    alt="Uploaded image" 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${item.result.includes('AI') ? 'bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'}`}>
                    {item.result}
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{item.timestamp.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full font-semibold border-fuchsia-200 hover:border-fuchsia-400"
                      onClick={() => {
                        setSelectedScan(item);
                        setIsModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border rounded-2xl bg-muted/50 shadow-inner">
            <div className="p-4 bg-gradient-to-br from-fuchsia-100 to-indigo-100 rounded-full mb-4">
                <ImageIcon className="h-16 w-16 text-fuchsia-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No images scanned yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first image to see if it's AI-generated or real. Start exploring the power of AI detection!
            </p>
            <Button asChild className="text-white font-bold px-6 py-3 rounded-full shadow hover:scale-105 transition-all animate-gradient">
              <Link href="/scanner">Scan Image</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Modal for scan details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2">Scan Details</DialogTitle>
            <DialogDescription>
              {selectedScan && (
                <div className="space-y-4 mt-2">
                  <img src={selectedScan.imageUrl} alt="Scan" className="w-full rounded-lg border shadow" />
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${selectedScan.result.includes('AI') ? 'bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'}`}>
                      {selectedScan.result}
                    </span>
                    <span className="text-xs text-muted-foreground">{selectedScan.timestamp.toLocaleString()}</span>
                  </div>
                  {selectedScan.raw && (
                    <div>
                      <span className="font-medium">Technical Details:</span>
                      <pre className="bg-muted p-2 rounded mt-1 text-xs whitespace-pre-wrap max-h-40 overflow-auto">{selectedScan.raw}</pre>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
} 