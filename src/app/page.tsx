"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon, ArrowRight, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/hooks/useTranslations";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  // Debug: Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey;
  
  // Değişen görsel ve sonuçlar için state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Görseller ve sonuçlar
  const images = [
    { src: "/esmer-ai.webp", result: "90% AI" },
    { src: "/cemai.jpeg", result: "100% Real" },
    { src: "/sarisin-ai.jpg", result: "100% AI" },
    { src: "/ceket.jpg", result: "99% Real" }
  ];
  
  // Dinamik sayaçlar için state
  const [totalUsers, setTotalUsers] = useState(10453);
  const [weeklyUsers, setWeeklyUsers] = useState(3439);
  const [displayTotalUsers, setDisplayTotalUsers] = useState(10453);
  const [displayWeeklyUsers, setDisplayWeeklyUsers] = useState(3439);
  const [isCounterAnimating, setIsCounterAnimating] = useState(false);
  
  // Rastgele analiz süresi için state
  const [analysisTime, setAnalysisTime] = useState("0.8");
  
  // Add this state at the beginning of your Home component
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // 2 saniyede bir görsel değiştirme
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setShowResult(true);
      
      // Sonucu 1.5 saniye göster, sonra gizle
      const hideTimeout = setTimeout(() => {
        setShowResult(false);
      }, 1500);
      
      return () => clearTimeout(hideTimeout);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Sayaçları artırmak için effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Random artış miktarı (1-5 arası)
      const randomIncrease = Math.floor(Math.random() * 5) + 1;
      
      setTotalUsers(prev => prev + randomIncrease);
      setWeeklyUsers(prev => prev + randomIncrease);
    }, 
    // Random interval (1000ms - 3000ms arası)
    Math.floor(Math.random() * 2000) + 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Animasyonlu sayı gösterimi için effect
  useEffect(() => {
    // Eğer değerler aynıysa animasyon yapmaya gerek yok
    if (totalUsers === displayTotalUsers && weeklyUsers === displayWeeklyUsers) {
      return;
    }
    
    // Animasyon başladığını belirt
    setIsCounterAnimating(true);
    
    // Animasyon için frame sayısı
    const frames = 30;
    let frame = 0;
    
    // Animasyon için başlangıç değerleri
    const startTotalUsers = displayTotalUsers;
    const startWeeklyUsers = displayWeeklyUsers;
    
    // Animasyon için hedef değerler
    const targetTotalUsers = totalUsers;
    const targetWeeklyUsers = weeklyUsers;
    
    // Animasyon için adım değerleri
    const stepTotalUsers = (targetTotalUsers - startTotalUsers) / frames;
    const stepWeeklyUsers = (targetWeeklyUsers - startWeeklyUsers) / frames;
    
    // Animasyon için interval
    const animationInterval = setInterval(() => {
      frame++;
      
      // Yeni değerleri hesapla
      const newTotalUsers = Math.floor(startTotalUsers + (stepTotalUsers * frame));
      const newWeeklyUsers = Math.floor(startWeeklyUsers + (stepWeeklyUsers * frame));
      
      // State'i güncelle
      setDisplayTotalUsers(newTotalUsers);
      setDisplayWeeklyUsers(newWeeklyUsers);
      
      // Animasyon tamamlandı mı?
      if (frame >= frames) {
        clearInterval(animationInterval);
        setDisplayTotalUsers(targetTotalUsers);
        setDisplayWeeklyUsers(targetWeeklyUsers);
        
        // Animasyon bittiğini belirt (300ms sonra)
        setTimeout(() => {
          setIsCounterAnimating(false);
        }, 300);
      }
    }, 1000 / 60); // 60fps
    
    return () => clearInterval(animationInterval);
  }, [totalUsers, weeklyUsers]);

  // Görsel değiştiğinde rastgele analiz süresi oluşturma
  useEffect(() => {
    // 0.2 ile 3.7 arasında rastgele bir sayı oluştur
    const randomTime = (Math.random() * 3.5 + 0.2).toFixed(1);
    setAnalysisTime(randomTime);
  }, [currentImageIndex]);

  // Sayıları formatlama fonksiyonu
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Handle upload button click with auth check
  const handleUploadClick = () => {
    if (isAuthenticated) {
      router.push('/scanner');
    } else {
      router.push('/login?from=/scanner');
    }
  };

  // Handle "See It In Action" click with auth check
  const handleSeeItInAction = () => {
    if (isAuthenticated) {
      router.push('/scanner');
    } else {
      router.push('/login?from=/scanner');
    }
  };

  // Add this function to toggle FAQ items
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Debug Info - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Debug Info</p>
          <p>Supabase Configuration: {isSupabaseConfigured ? 'OK' : 'Missing'}</p>
          {!isSupabaseConfigured && (
            <p className="text-sm mt-2">
              Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
            </p>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
                Spot AI-Generated Images Instantly
              </h1>
              <p className="text-[1.375rem] md:text-2xl text-gray-800 mb-8 leading-snug">
                98% accuracy in seconds. <span className="font-bold text-gray-900">No more guessing what's real.</span>
              </p>
              
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-fuchsia-600 via-purple-500 to-indigo-500 text-white shadow-xl text-2xl font-extrabold px-10 py-5 rounded-full border-4 border-white hover:scale-105 hover:shadow-2xl transition-all duration-200 animate-pulse"
                  onClick={handleUploadClick}
                >
                  Analyze My Image
                </Button>
              </div>
            </div>
            <div className="relative flex flex-col items-center">
              {/* Dikkat çekici AI/REAL badge */}
              {showResult && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                  <div className={`flex items-center gap-3 px-8 py-3 rounded-full shadow-xl text-white text-2xl font-extrabold tracking-wide animate-pulse ${images[currentImageIndex].result.includes('AI') ? 'bg-gradient-to-r from-fuchsia-600 to-purple-500' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`}
                  >
                    <span className="drop-shadow-lg">
                      {images[currentImageIndex].result.includes('AI') ? 'AI GENERATED' : 'REAL PHOTO'}
                    </span>
                    <span className="text-3xl font-black ml-2 drop-shadow-lg">
                      {images[currentImageIndex].result}
                    </span>
                  </div>
                </div>
              )}
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <Image 
                  src={images[currentImageIndex].src}
                  alt="AI Detection in action"
                  width={600} 
                  height={400}
                  className="w-full object-cover aspect-[4/3]"
                  priority
                />
                {/* Overlay kaldırıldı, badge ve analiz süresi dışarıda */}
              </div>
              {/* Analiz süresi badge'i */}
              {showResult && (
                <div className="mt-6 flex justify-center w-full">
                  <div className="bg-black text-white text-lg font-semibold px-6 py-2 rounded-full shadow-lg border-2 border-fuchsia-400 animate-fade-in">
                    Analyzed in {analysisTime} seconds
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Trusted by Leading Organizations</h2>
            <div className="h-1 w-32 bg-primary/40 mx-auto mb-6" />
          </div>
          
          <div className="relative overflow-hidden mb-12">
            <div className="flex animate-marquee">
              <div className="logo-container">
                <Image 
                  src="/adobe-logo.svg" 
                  alt="Adobe" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/getty-images-1-logo-black-and-white.png" 
                  alt="Getty Images" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/openai-logo-black-and-white.png" 
                  alt="OpenAI" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/reuters-logo-black-transparent.png" 
                  alt="Reuters" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/nvidia-logo.png" 
                  alt="NVIDIA" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/Canva-Logo.png" 
                  alt="Canva" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/bogazici.png" 
                  alt="Bogazici University" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/vestelventures.png" 
                  alt="Vestel Ventures" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/Wikipedia-logo-v2-en.svg.png" 
                  alt="Wikipedia" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/neohub.png" 
                  alt="NeoHub" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/colendi.png" 
                  alt="Colendi" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* Duplicate logos for continuous scrolling effect */}
              <div className="logo-container">
                <Image 
                  src="/adobe-logo.svg" 
                  alt="Adobe" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/getty-images-1-logo-black-and-white.png" 
                  alt="Getty Images" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/openai-logo-black-and-white.png" 
                  alt="OpenAI" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/reuters-logo-black-transparent.png" 
                  alt="Reuters" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/nvidia-logo.png" 
                  alt="NVIDIA" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/Canva-Logo.png" 
                  alt="Canva" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/bogazici.png" 
                  alt="Bogazici University" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/vestelventures.png" 
                  alt="Vestel Ventures" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/Wikipedia-logo-v2-en.svg.png" 
                  alt="Wikipedia" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/neohub.png" 
                  alt="NeoHub" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="logo-container">
                <Image 
                  src="/colendi.png" 
                  alt="Colendi" 
                  width={140} 
                  height={50}
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="flex flex-wrap justify-center items-center gap-4">
              <div 
                className={`text-3xl font-bold transition-all duration-300 ${
                  isCounterAnimating ? 'text-green-500' : 'text-foreground'
                }`}
              >
                {formatNumber(displayTotalUsers)}
              </div>
              <div className="text-lg text-muted-foreground">trusted by users</div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
              <div 
                className={`text-3xl font-bold transition-all duration-300 ${
                  isCounterAnimating ? 'text-green-500' : 'text-foreground'
                }`}
              >
                {formatNumber(displayWeeklyUsers)}
              </div>
              <div className="text-lg text-muted-foreground">new users this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Advanced AI Image Detection Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay Ahead of Deepfakes with the Latest Technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-medium">Instant AI Detection</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-medium">98% Accuracy Rate</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-medium">Deepfake Recognition</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-medium">Batch Processing</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-medium">Detailed Analysis Reports</span>
            </div>
          </div>

          <div className="space-y-24">
            {/* Algorithm Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">State-of-the-Art Detection Algorithm</h3>
                <p className="text-muted-foreground mb-6">
                  Our proprietary AI technology can identify even the most sophisticated AI-generated images. 
                  Simply upload any photo and get instant verification results that highlight artificial elements.
                </p>
              </div>
              <div className="bg-muted rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-[16/9] relative">
                  <Image
                    src="/usecasekadın.png"
                    alt="Woman using AI detection technology"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
              <div>
                <h3 className="text-2xl font-bold mb-4">Comprehensive Analysis Reports</h3>
                <p className="text-muted-foreground mb-6">
                  Receive detailed reports showing confidence scores, detected manipulation markers, 
                  and authenticity verification. Perfect for professionals needing documented evidence of image authenticity.
                </p>
              </div>
              <div className="bg-muted rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-[16/9] relative">
                  <Image
                    src="/usecasekodlama.png"
                    alt="Coding and analysis of AI image detection"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Detect AI-Generated Images?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start using our advanced AI detection technology today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={handleUploadClick}
            >
              Try It Now
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">What Our Users Say</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Thousands of professionals trust our AI detection technology
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                  <span className="text-primary font-medium">S</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">Digital Content Creator</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "AI Scanner has become an essential tool in my workflow. I can quickly verify if stock photos I purchase are AI-generated or authentic. The accuracy is impressive!"
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                  <span className="text-primary font-medium">M</span>
                </div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-muted-foreground">Graphic Designer</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I need to ensure every image I present to clients is properly sourced. This tool helps me quickly identify suspicious images. It's simple to use and very reliable."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                  <span className="text-primary font-medium">E</span>
                </div>
                <div>
                  <h4 className="font-semibold">Emily Rodriguez</h4>
                  <p className="text-sm text-muted-foreground">Social Media Manager</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The authenticity of images is crucial for our brand campaigns. AI Scanner has become an indispensable part of our content verification process."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20" id="faq">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-2">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-center mb-12">
            Everything you need to know about our AI detection technology
          </p>
          
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="border rounded-lg overflow-hidden">
              <button 
                className="flex justify-between items-center w-full p-4 text-left font-medium"
                onClick={() => toggleFaq(0)}
              >
                <span>How accurate is the AI detection?</span>
                {openFaqIndex === 0 ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
              </button>
              {openFaqIndex === 0 && (
                <div className="p-4 border-t">
                  <p className="text-muted-foreground">
                    Our AI detection technology achieves over 95% accuracy in identifying AI-generated images. The system is continuously trained on the latest AI-generated content to stay ahead of new generation techniques.
                  </p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 2 */}
            <div className="border rounded-lg overflow-hidden">
              <button 
                className="flex justify-between items-center w-full p-4 text-left font-medium"
                onClick={() => toggleFaq(1)}
              >
                <span>What types of images can be analyzed?</span>
                {openFaqIndex === 1 ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
              </button>
              {openFaqIndex === 1 && (
                <div className="p-4 border-t">
                  <p className="text-muted-foreground">
                    Our system can analyze most common image formats including JPEG, PNG, WebP, and GIF. The tool works best with photographs and realistic images, but can also detect AI-generated illustrations and artwork.
                  </p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 3 */}
            <div className="border rounded-lg overflow-hidden">
              <button 
                className="flex justify-between items-center w-full p-4 text-left font-medium"
                onClick={() => toggleFaq(2)}
              >
                <span>Is my data kept private?</span>
                {openFaqIndex === 2 ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
              </button>
              {openFaqIndex === 2 && (
                <div className="p-4 border-t">
                  <p className="text-muted-foreground">
                    Yes, we take privacy seriously. Uploaded images are processed securely and are not stored on our servers after analysis. We do not use your images for training our models or share them with third parties.
                  </p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 4 */}
            <div className="border rounded-lg overflow-hidden">
              <button 
                className="flex justify-between items-center w-full p-4 text-left font-medium"
                onClick={() => toggleFaq(3)}
              >
                <span>How does the technology work?</span>
                {openFaqIndex === 3 ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
              </button>
              {openFaqIndex === 3 && (
                <div className="p-4 border-t">
                  <p className="text-muted-foreground">
                    Our system uses advanced machine learning algorithms to analyze patterns in images that are characteristic of AI generation. It examines pixel-level details, consistency in lighting, textures, and other subtle markers that humans might miss.
                  </p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 5 */}
            <div className="border rounded-lg overflow-hidden">
              <button 
                className="flex justify-between items-center w-full p-4 text-left font-medium"
                onClick={() => toggleFaq(4)}
              >
                <span>Do you offer an API for developers?</span>
                {openFaqIndex === 4 ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
              </button>
              {openFaqIndex === 4 && (
                <div className="p-4 border-t">
                  <p className="text-muted-foreground">
                    Yes, we offer a developer API for integrating our AI detection capabilities into your own applications. Check our pricing page for API plans and documentation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
            {/* About Us */}
            <div>
              <h3 className="text-xl font-bold mb-6">About Us</h3>
              <ul className="space-y-3">
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">AI Scanner is a TechVision product</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">NEURALWORKS LLC (TechVision)</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Innovation Hub, 123 Tech Lane</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">San Francisco, CA 94105</Link>
                </li>
              </ul>
              <div className="flex space-x-4 mt-6">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap space-x-3">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
              </div>
            </div>
            
            {/* Alternatives */}
            <div>
              <h3 className="text-xl font-bold mb-6">Alternatives</h3>
              <ul className="space-y-3">
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">DeepDetect</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">AIChecker</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Forensic AI</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">TruthSight</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">DeepFake Detector</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">ImgAuth</Link>
                </li>
              </ul>
            </div>

            {/* Best Products */}
            <div>
              <h3 className="text-xl font-bold mb-6">Best Products</h3>
              <ul className="space-y-3">
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">AI Image Detection API</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Deepfake Analysis Tools</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Content Verification Suite</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Media Authentication Software</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Enterprise Security Solutions</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Real-Time Verification Tools</Link>
                </li>
              </ul>
            </div>

            {/* AI Scanner */}
            <div>
              <h3 className="text-xl font-bold mb-6">AI Scanner</h3>
              <ul className="space-y-3">
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Image Analysis Technology</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">AI Detection Metrics</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Media Integrity Tools</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Content Authentication</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Deepfake Prevention</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Image Verification API</Link>
                </li>
              </ul>
            </div>

            {/* How-To Guides */}
            <div>
              <h3 className="text-xl font-bold mb-6">How-To Guides</h3>
              <ul className="space-y-3">
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Identifying AI-Generated Portraits</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Detecting Deepfakes in Videos</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Verifying Image Authenticity</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Spotting AI Text-to-Image Content</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Using AI Detection for Journalism</Link>
                </li>
                <li className="text-muted-foreground hover:text-foreground transition">
                  <Link href="#">Protecting Brand Visual Identity</Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AI Scanner by TechVision. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
