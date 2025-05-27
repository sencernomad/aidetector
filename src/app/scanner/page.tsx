"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, ImageIcon, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
import { saveScanResult } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';

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
  const [userUuid, setUserUuid] = useState<string>('');

  // On mount, determine uuid: from query string or localStorage
  useEffect(() => {
    let uuid = '';
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      uuid = searchParams.get('uuid') || '';
      if (!uuid) {
        // Try to get from localStorage
        uuid = localStorage.getItem('local-user-uuid') || '';
        if (!uuid) {
          uuid = uuidv4();
          localStorage.setItem('local-user-uuid', uuid);
        }
      }
      setUserUuid(uuid);
    }
  }, []);

  // Helper: check usage from localStorage
  const checkUsage = () => {
    if (!userUuid) return false;
    return localStorage.getItem(`scan-usage-${userUuid}`) === 'used';
  };
  // Helper: mark usage in localStorage
  const trackUsage = () => {
    if (!userUuid) return;
    localStorage.setItem(`scan-usage-${userUuid}`, 'used');
  };

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
    setError(null);
    
    if (!selectedFile) return;
    
    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    
    setFile(selectedFile);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    
    const droppedFile = e.dataTransfer.files?.[0];
    
    if (!droppedFile) return;
    
    // Check if file is an image
    if (!droppedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    
    setFile(droppedFile);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const analyzeImage = async () => {
    if (!file || !user) return;
    // Check usage before allowing scan
    if (checkUsage()) {
      setShowUpgradeModal(true);
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    const startTime = performance.now();
    try {
      const formData = new FormData();
      formData.append('file', file);
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
      setAnalysisTime(parseFloat(timeTaken));
      const result = {
        isAI: data.isAI,
        confidence: data.confidence,
        raw: data.raw || ""
      };
      setResult(result);
      // Save scan result to database
      try {
        await saveScanResult(user.id, image!, result);
      } catch (saveError) {
        // ignore
      }
      // Mark usage after successful scan
      trackUsage();
    } catch (err: any) {
      setError("An error occurred while analyzing the image");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin mr-2 h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span>Loading...</span>
      </div>
    );
  }

  // If not authenticated, show login button
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-6">
            <Image 
              src="/applogo.png"
              alt="AI Scanner Logo"
              width={180}
              height={60}
              className="mx-auto mb-8"
            />
            <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access the AI Image Scanner
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Sign In
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Main upload card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">AI Image Scanner</CardTitle>
                <CardDescription>
                  Upload an image to analyze whether it was created by AI or is authentic
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!image ? (
                  <div 
                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Upload your image</p>
                        <p className="text-muted-foreground text-sm">Drag and drop or click to browse</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative aspect-video w-full max-h-[400px] overflow-hidden rounded-lg border">
                      <Image 
                        src={image} 
                        alt="Uploaded image" 
                        fill
                        className="object-contain"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="default" 
                        onClick={analyzeImage} 
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : 'Analyze Image'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setImage(null);
                          setFile(null);
                          setResult(null);
                          setError(null);
                        }}
                        className="flex-1"
                      >
                        Upload Different Image
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Results */}
                {result && (
                  <div className="mt-6 p-6 border rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-lg font-medium">
                          This image is {result.isAI ? 
                            <span className="text-destructive font-bold">very likely AI-generated</span> : 
                            <span className="text-primary font-bold">likely authentic</span>}
                        </p>
                        <p className="text-muted-foreground">
                          {analysisTime && `Analysis completed in ${analysisTime} seconds`}
                        </p>
                      </div>
                      <div className={`text-2xl font-bold ${result.isAI ? 'text-destructive' : 'text-primary'}`}>
                        {Math.round(result.confidence * 100)}% {result.isAI ? 'AI' : 'Real'}
                      </div>
                    </div>
                    
                    {/* Optional expandable technical details */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        Show technical details
                      </summary>
                      <div className="bg-muted p-4 rounded-md mt-2">
                        <p className="font-medium mb-2">Technical Details:</p>
                        <p className="text-sm font-mono whitespace-pre-wrap">{result.raw}</p>
                      </div>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>
            
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
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image 
                src="/applogo.png"
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