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
  const { user, isAuthenticated, signOut } = useAuth();
  
  // Değişen görsel ve sonuçlar için state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Görseller ve sonuçlar
  const images = [
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497078/ChatGPT_Image_21_Haz_2025_12_10_16_hvulnt.png", result: "95% AI", analysisTime: "1.2", aiPercentage: 95, isAI: true },
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497080/ChatGPT_Image_21_Haz_2025_12_10_21_d44a6s.png", result: "92% Real", analysisTime: "0.8", aiPercentage: 92, isAI: false },
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497082/ChatGPT_Image_21_Haz_2025_12_10_14_hugyqv.png", result: "98% AI", analysisTime: "1.5", aiPercentage: 98, isAI: true },
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497082/ChatGPT_Image_21_Haz_2025_12_10_25_pzizo0.png", result: "91% Real", analysisTime: "2.1", aiPercentage: 91, isAI: false },
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497083/ChatGPT_Image_21_Haz_2025_12_10_23_j6rold.png", result: "97% AI", analysisTime: "0.6", aiPercentage: 97, isAI: true },
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497083/ChatGPT_Image_21_Haz_2025_12_10_19_wgsqdn.png", result: "94% Real", analysisTime: "1.8", aiPercentage: 94, isAI: false },
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497084/ChatGPT_Image_21_Haz_2025_12_10_18_viodx8.png", result: "96% AI", analysisTime: "1.0", aiPercentage: 96, isAI: true },
    { src: "https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_800,c_limit/v1750497183/ChatGPT_Image_21_Haz_2025_12_12_52_pwoscp.png", result: "93% Real", analysisTime: "1.4", aiPercentage: 93, isAI: false }
  ];
  
  // Dinamik sayaçlar için state
  const [totalUsers, setTotalUsers] = useState(10453);
  const [weeklyUsers, setWeeklyUsers] = useState(3439);
  const [displayTotalUsers, setDisplayTotalUsers] = useState(10453);
  const [displayWeeklyUsers, setDisplayWeeklyUsers] = useState(3439);
  const [isCounterAnimating, setIsCounterAnimating] = useState(false);
  
  // Rastgele analiz süresi için state - artık her görsel için sabit
  const [analysisTime, setAnalysisTime] = useState("1.2");
  
  // Add this state at the beginning of your Home component
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  // Preload all images to prevent white flash
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = images.map((image) => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = image.src;
        });
      });
      
      await Promise.all(imagePromises);
      setImagesPreloaded(true);
    };
    
    preloadImages();
  }, [images]);
  
  // 2 saniyede bir görsel değiştirme - tam olarak 2 saniye
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Exactly 2 seconds
    
    return () => clearInterval(interval);
  }, [images.length]);

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

  // Görsel değiştiğinde analiz süresini o görselin sabit süresine ayarla
  useEffect(() => {
    setAnalysisTime(images[currentImageIndex].analysisTime);
  }, [currentImageIndex, images]);

  // Sayıları formatlama fonksiyonu
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    console.log('Analyze My Image button clicked!');
    router.push('/scanner');
  };

  // Handle "See It In Action" click
  const handleSeeItInAction = () => {
    console.log('Try For Free button clicked!');
    router.push('/scanner');
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
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                  Spot AI-Generated Images Instantly
                </h1>
                <p className="text-lg md:text-2xl text-gray-800 mb-8 leading-snug">
                  98% accuracy in seconds. <span className="font-bold text-gray-900">No more guessing what's real.</span>
                </p>
                
                <div className="flex justify-center md:justify-start mt-8 md:mt-16">
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto text-xl py-6 px-10 md:px-14 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-all animate-gradient"
                    onClick={handleUploadClick}
                  >
                    Analyze My Image
                  </Button>
                </div>
              </div>
              <div className="relative flex flex-col items-center mt-8 md:mt-0">
                {/* Container tam fotoğraf boyutuna ayarlandı - yan boşluklar yok */}
                <div className="relative w-full max-w-[500px] aspect-square flex flex-col items-center group">
                  {/* Image container - tam boyut, smooth transition, no black flash */}
                  <div className="relative overflow-hidden rounded-xl shadow-2xl w-full h-full">
                    {/* Background image to prevent flash */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                    
                    {/* Current image with crossfade transition */}
                    <Image 
                      src={images[currentImageIndex].src}
                      alt="AI Detection in action"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="w-full h-full transition-opacity duration-1000 ease-in-out"
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    
                    {/* AI Detection Result Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-3 py-2 rounded-full text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-all duration-500 ${
                        images[currentImageIndex].isAI 
                          ? 'bg-red-500/80 border border-red-400/50' 
                          : 'bg-green-500/80 border border-green-400/50'
                      }`}>
                        {images[currentImageIndex].aiPercentage}% {images[currentImageIndex].isAI ? 'AI' : 'Real'}
                      </div>
                    </div>
                    
                    {/* Analiz süresi badge'i */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-black/50 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-500">
                          Analyzed in {analysisTime}s
                      </div>
                    </div>
                  </div>
                </div>
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
        {/* Features Section has been removed as per the instructions */}

        {/* Call to Action */}
        <section id="cta" className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto text-center max-w-4xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to See It in Action?
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Don't get fooled by AI. Upload an image and get a real-time analysis now.
            </p>
              <Button 
                size="lg" 
              className="text-xl py-6 px-10 md:px-14 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-all animate-gradient"
              onClick={handleSeeItInAction}
              >
              Try For Free
              </Button>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-2">What Our Users Say</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Thousands of professionals trust our AI detection technology
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-fuchsia-300 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full mr-4 overflow-hidden">
                    <Image 
                      src="https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_100,c_limit/v1750497080/ChatGPT_Image_21_Haz_2025_12_10_21_d44a6s.png"
                      alt="Sarah Johnson"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Digital Content Creator</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "AI Scanner has become an essential tool in my workflow. I can quickly verify if stock photos I purchase are AI-generated or authentic. The accuracy is impressive!"
                </p>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-fuchsia-300 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full mr-4 overflow-hidden">
                    <Image 
                      src="https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_100,c_limit/v1750497082/ChatGPT_Image_21_Haz_2025_12_10_25_pzizo0.png"
                      alt="Michael Chen"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-muted-foreground">Graphic Designer</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "I need to ensure every image I present to clients is properly sourced. This tool helps me quickly identify suspicious images. It's simple to use and very reliable."
                </p>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-fuchsia-300 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full mr-4 overflow-hidden">
                    <Image 
                      src="https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_100,c_limit/v1750497083/ChatGPT_Image_21_Haz_2025_12_10_19_wgsqdn.png"
                      alt="Emily Rodriguez"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Emily Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">Social Media Manager</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "The authenticity of images is crucial for our brand campaigns. AI Scanner has become an indispensable part of our content verification process."
                </p>
              </div>

              {/* Testimonial 4 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-fuchsia-300 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full mr-4 overflow-hidden">
                    <Image 
                      src="https://res.cloudinary.com/dvo6rqrpd/image/upload/f_auto,q_auto,w_100,c_limit/v1750497084/ChatGPT_Image_21_Haz_2025_12_10_18_viodx8.png"
                      alt="David Park"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">David Park</h4>
                    <p className="text-sm text-muted-foreground">Journalist</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "In journalism, image authenticity is critical. This tool gives me confidence that the visuals I use in my articles are genuine and haven't been manipulated by AI."
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
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Innovation Hub, 123 Tech Lane, San Francisco, CA 94105</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>© 2025 AI Scanner by TechVision. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
