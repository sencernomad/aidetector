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

export default function CreatePage() {
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
    if (!file) return;
    
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending request to API...'); // Debug log
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData); // Debug log
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(1);
      setAnalysisTime(parseFloat(timeTaken));
      
      setResult({
        isAI: data.isAI,
        confidence: data.confidence,
        raw: data.raw || ""
      });

    } catch (err: any) {
      console.error('Error in analyzeImage:', err);
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
        <div className="container mx-auto py-10 px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-2">AI Image Scanner</h1>
          <p className="text-center text-muted-foreground mb-8">
            Upload an image to check if it was generated by AI
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Upload the image you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition ${
                  image ? "border-primary" : "border-muted-foreground/20"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-md mx-auto aspect-video mb-4">
                      <img
                        src={image}
                        alt="Uploaded image"
                        className="rounded-md object-contain w-full h-full"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click or drag to upload another image
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Drag your image here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or GIF (max. 10MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={analyzeImage}
                disabled={!image || isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Analyze Image
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {result && (
            <Card className="mb-16 overflow-hidden shadow-lg border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 pt-6">
                <div className="flex justify-between items-start px-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Analysis Result</h2>
                    <p className="text-muted-foreground text-sm">
                      Powered by advanced AI detection technology
                    </p>
                  </div>
                  <div className="bg-background rounded-full px-3 py-1 flex items-center gap-2 shadow-md animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium">
                      Analyzed in {analysisTime || 0.8} seconds
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <div className="relative py-8">
                    <div className={`text-6xl font-bold ${
                      result.isAI ? "text-purple-500" : "text-green-500"
                    }`}>
                      {result.confidence.toFixed(0)}%
                    </div>
                    
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 ${
                        result.isAI ? "border-purple-500 bg-purple-50" : "border-green-500 bg-green-50"
                      }`}>
                        <span className={`text-sm font-bold ${
                          result.isAI ? "text-purple-700" : "text-green-700"
                        }`}>
                          {result.isAI ? "AI" : "REAL"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-6 bg-background">
                <div className="flex flex-col gap-4">
                  <div className={`p-4 rounded-lg ${
                    result.isAI ? "bg-purple-50 border border-purple-100" : "bg-green-50 border border-green-100"
                  }`}>
                    <h3 className={`font-medium mb-1 ${
                      result.isAI ? "text-purple-700" : "text-green-700"
                    }`}>
                      {result.isAI ? "AI-Generated Image Detected" : "Likely Authentic Image"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.isAI 
                        ? "Our analysis indicates this image was generated by AI with high confidence." 
                        : "Our analysis indicates this image is likely a real photograph."
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Confidence Score</span>
                        <span className="text-sm font-medium">{result.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${result.isAI ? "bg-purple-500" : "bg-green-500"}`} 
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" className="flex-1">
                        Share Result
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Download Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Trusted By Section */}
          <section className="mb-16 py-8 bg-muted/30 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-8">Trusted By Leading Organizations</h2>
            <div className="relative overflow-hidden">
              <div className="flex animate-marquee">
                <div className="logo-container">
                  <Image 
                    src="/adobe-logo.svg" 
                    alt="Adobe" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/getty-images-1-logo-black-and-white.png" 
                    alt="Getty Images" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/openai-logo-black-and-white.png" 
                    alt="OpenAI" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/reuters-logo-black-transparent.png" 
                    alt="Reuters" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/nvidia-logo.png" 
                    alt="NVIDIA" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/Canva-Logo.png" 
                    alt="Canva" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/bogazici.png" 
                    alt="Bogazici University" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/vestelventures.png" 
                    alt="Vestel Ventures" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/Wikipedia-logo-v2-en.svg.png" 
                    alt="Wikipedia" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/neohub.png" 
                    alt="NeoHub" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/colendi.png" 
                    alt="Colendi" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                
                {/* Duplicate logos for continuous scrolling effect */}
                <div className="logo-container">
                  <Image 
                    src="/adobe-logo.svg" 
                    alt="Adobe" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/getty-images-1-logo-black-and-white.png" 
                    alt="Getty Images" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/openai-logo-black-and-white.png" 
                    alt="OpenAI" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/reuters-logo-black-transparent.png" 
                    alt="Reuters" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/nvidia-logo.png" 
                    alt="NVIDIA" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/Canva-Logo.png" 
                    alt="Canva" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/bogazici.png" 
                    alt="Bogazici University" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/vestelventures.png" 
                    alt="Vestel Ventures" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/Wikipedia-logo-v2-en.svg.png" 
                    alt="Wikipedia" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/neohub.png" 
                    alt="NeoHub" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="logo-container">
                  <Image 
                    src="/colendi.png" 
                    alt="Colendi" 
                    width={120} 
                    height={40}
                    className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                <span className="font-semibold">18,739,045</span> users trust our technology
                &nbsp;&nbsp;•&nbsp;&nbsp;
                <span className="font-semibold">138,742</span> new users this week
              </p>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                        <span className="text-primary font-medium">{testimonial.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{testimonial.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFaq(index)}
                  >
                    <h3 className="font-medium">{faq.question}</h3>
                    <Button variant="ghost" size="icon">
                      {openFaqIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  {openFaqIndex === index && (
                    <CardContent className="pt-0 pb-4 border-t">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} AI Scanner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
