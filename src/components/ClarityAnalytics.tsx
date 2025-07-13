"use client";

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    clarity: any;
  }
}

export default function ClarityAnalytics() {
  // Microsoft Clarity Project ID - Replace with your actual project ID
  const clarityProjectId = "abc123def456"; // Gerçek Project ID buraya
  
  useEffect(() => {
    // Initialize Clarity when component mounts
    if (typeof window !== 'undefined' && window.clarity) {
      // You can add custom tracking here
      // window.clarity.identify("user-id", "session-id", "page-id", "friendly-name");
      // window.clarity.setTag("page", "home");
      // window.clarity.event("page-view");
    }
  }, []);

  return (
    <>
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityProjectId}");
        `}
      </Script>
    </>
  );
} 