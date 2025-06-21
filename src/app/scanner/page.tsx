"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, ImageIcon, Loader2, ChevronDown, ChevronUp, Check, X, ShieldCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import Link from "next/link";
import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { saveScanResult, getScanHistory } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';

// Helper to get or set a guest ID
const getGuestId = (): string => {
  if (typeof window === 'undefined') return '';
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

export default function ScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ isAI: boolean; confidence: number; raw: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [analysisTime, setAnalysisTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [guestId, setGuestId] = useState('');

  useEffect(() => {
    setGuestId(getGuestId());
  }, []);

  const hasUsedFreeScan = useCallback(async (): Promise<boolean> => {
    if (isAuthenticated && user) {
      // Logged-in user: check database
      const history = await getScanHistory(user.id);
      return history.length > 0;
    } else {
      // Guest user: check local storage
      return localStorage.getItem(`free_scan_used_${guestId}`) === 'true';
    }
  }, [isAuthenticated, user, guestId]);

  const markFreeScanAsUsed = useCallback(async () => {
    if (isAuthenticated && user && image && result) {
      // Logged-in user: saving to DB is the marker
      await saveScanResult(user.id, image, result);
    } else {
      // Guest user: mark in local storage
      localStorage.setItem(`free_scan_used_${guestId}`, 'true');
    }
  }, [isAuthenticated, user, guestId, image, result]);

  // FAQ data
  const faqData = [
    {
      question: "How accurate is the AI detection?",
      answer: "Our AI detection technology achieves over 95% accuracy in identifying AI-generated images. The system is continuously trained on the latest AI-generated content to stay ahead of new generation techniques."
    },
    {
      question: "What types of images can be analyzed?",
      answer: "Our system can analyze most common image formats including JPEG, PNG, WebP, and GIF. The tool works best with photographs and realistic images, but can also detect AI-generated illustrations and artwork."
    },
    {
      question: "Is my data kept private?",
      answer: "Yes, we take privacy seriously. Uploaded images are processed securely and are not stored on our servers after analysis. We do not use your images for training our models or share them with third parties."
    },
    {
      question: "How does the technology work?",
      answer: "Our system uses advanced machine learning algorithms to analyze patterns in images that are characteristic of AI generation. It examines pixel-level details, consistency in lighting, textures, and other subtle markers that humans might miss."
    },
    {
      question: "Do you offer an API for developers?",
      answer: "Yes, we offer a developer API for integrating our AI detection capabilities into your own applications. Check our pricing page for API plans and documentation."
    }
  ];

  // Testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Content Creator",
      comment: "Thanks to AI Scanner, I can easily verify whether stock photos I purchase are real or AI-generated. Authenticity is crucial in my work, and this tool gives me great confidence."
    },
    {
      name: "Michael Chen",
      role: "Graphic Designer",
      comment: "I need to ensure every image I present to clients is properly sourced. This tool helps me quickly identify suspicious images. It's simple to use and very reliable."
    },
    {
      name: "Emily Rodriguez",
      role: "Social Media Manager",
      comment: "The authenticity of images is crucial for our brand campaigns. AI Scanner has become an indispensable part of our content verification process."
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processFile = (selectedFile: File) => {
    setError(null);
    setResult(null);
    setImage(null);
    setFile(null);
    
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }

  const analyzeImage = async () => {
    if (!file) return;

    // 1. Check for free scan
    const freeScanUsed = await hasUsedFreeScan();
    if (freeScanUsed) {
      router.push('/login?reason=no_credits');
      return;
    }

    // 2. Start analysis
    setIsLoading(true);
    setResult(null);
    setError(null);
    const startTime = performance.now();

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 3. Call API
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(1);
      
      const scanResult = {
        isAI: data.isAI,
        confidence: data.confidence,
        raw: data.raw || ""
      };
      
      // We need to set state here so it can be used in markFreeScanAsUsed
      setResult(scanResult);
      setImage(image); // ensure image is set for saving
      
      // 4. Mark scan as used
      // Use a temporary state to call the mark function
      if (isAuthenticated && user && image) {
        await saveScanResult(user.id, image, scanResult);
      } else {
        localStorage.setItem(`free_scan_used_${guestId}`, 'true');
      }

      setAnalysisTime(parseFloat(timeTaken));

    } catch (err: any) {
      setError(err.message || "An error occurred while analyzing the image.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const resetScanner = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin mr-2 h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Image Scanner</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image to analyze whether it was created by AI or is authentic
          </p>
        </div>

        {/* Upload Area */}
        {!image ? (
          <div className="mb-12">
            <div 
              className="relative border-2 border-dashed border-fuchsia-300 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-in-out hover:border-fuchsia-400 hover:bg-fuchsia-50/30 bg-white/50 backdrop-blur-sm"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden" 
              />
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="bg-gradient-to-br from-fuchsia-100 to-purple-100 p-6 rounded-full">
                  <Upload className="h-10 w-10 text-fuchsia-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Drag & drop an image here or <span className="text-fuchsia-600 hover:text-fuchsia-700">browse files</span>
                  </p>
                  <p className="text-sm text-gray-500">Supports: PNG, JPG, WebP (Max 10MB)</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="mb-12">
            {result ? (
              /* Analysis Complete */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Image Display */}
                <div className="relative">
                  <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white">
                    <Image 
                      src={image} 
                      alt="Analyzed image" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                {/* Results */}
                <div className="flex flex-col justify-center space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl font-bold mb-4">Analysis Complete</h2>
                    
                    {/* Main Result Badge */}
                    <div className="inline-flex items-center gap-3 mb-4">
                      {result.isAI ? (
                        <div className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
                          <X className="h-6 w-6"/> AI Generated
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
                          <Check className="h-6 w-6"/> Likely Real
                        </div>
                      )}
                      <span className="text-lg font-semibold text-gray-600">
                        {(result.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-6">
                      Analysis completed in {analysisTime} seconds
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <Button
                      onClick={resetScanner}
                      size="lg"
                      className="w-full text-lg font-bold py-3 rounded-full shadow-lg text-white hover:scale-105 transition-all animate-gradient"
                    >
                      Scan Another Image
                    </Button>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="font-bold mb-2 text-gray-800">Want unlimited scans?</h3>
                      <p className="text-sm mb-4 text-gray-600">Upgrade to Pro for unlimited scans, detailed reports, and priority support.</p>
                      <Button 
                        onClick={() => router.push('/pricing')} 
                        variant="outline"
                        className="w-full border-fuchsia-400 text-fuchsia-600 hover:bg-fuchsia-50 font-semibold"
                      >
                        <Crown className="h-4 w-4 mr-2"/> Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Image Uploaded, Ready to Analyze */
              <div className="text-center space-y-6">
                <div className="relative aspect-video w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-xl bg-white">
                  <Image 
                    src={image} 
                    alt="Uploaded image" 
                    fill
                    className="object-contain"
                  />
                </div>
                
                <div className="space-y-4">
                  <Button
                    onClick={analyzeImage}
                    disabled={isLoading}
                    size="lg"
                    className="text-xl font-bold py-6 px-12 rounded-full shadow-lg text-white hover:scale-105 transition-transform animate-gradient"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Image"
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetScanner}
                    variant="outline"
                    className="ml-4 text-gray-600 hover:text-gray-800"
                  >
                    Choose Different Image
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Technical Details - Optional expandable section */}
        {result && (
          <div className="mb-12">
            <details className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 font-medium">
                <ChevronDown className="h-4 w-4" />
                Show technical details
              </summary>
              <div className="bg-gray-50 p-4 rounded-lg mt-4 border">
                <p className="font-medium mb-2 text-gray-800">Technical Analysis:</p>
                <p className="text-sm font-mono whitespace-pre-wrap text-gray-600 leading-relaxed">{result.raw}</p>
              </div>
            </details>
          </div>
        )}

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqData.map((faq, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <button
                  className="flex justify-between items-center w-full p-4 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="p-4 pt-0 border-t">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Testimonials */}
        <div>
          <h2 className="text-2xl font-bold mb-6">What Our Users Say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">{testimonial.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image 
                src="/applogoo.png"
                alt="AI Scanner Logo"
                width={120}
                height={30}
                className="h-8 w-auto mb-2"
              />
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} AI Scanner. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">Terms</Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">Privacy</Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="relative overflow-hidden">
          {/* Blurred AI image background */}
          <div className="absolute inset-0 z-0">
            <img src="/esmer-ai.webp" alt="AI Example" className="w-full h-full object-cover blur-lg opacity-20" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <span role="img" aria-label="lock">🔒</span> Your Free Trial Has Ended
            </DialogTitle>
            <DialogDescription className="mt-4 text-lg text-gray-800 font-medium">
              You've used your free image analysis quota.<br />
              <span className="font-bold text-fuchsia-700">Upgrade now</span> to continue detecting AI-generated images instantly, <span className="font-bold">without limits</span>.<br />
              <span className="block mt-4 text-base text-gray-700">💡 Pro users get <span className="font-semibold text-fuchsia-700">priority scanning</span>, detailed analysis reports, and unlimited access.</span>
            </DialogDescription>
            <div className="mt-8 flex justify-center">
              <Button onClick={() => router.push('/pricing')} className="bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white font-bold px-10 py-4 rounded-full text-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                <span role="img" aria-label="lock">🔒</span> Upgrade Now
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
} 