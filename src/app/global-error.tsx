'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="mb-6 text-muted-foreground">
              A critical error occurred in the application.
            </p>
            <Button 
              onClick={reset}
              className="mb-2"
            >
              Try again
            </Button>
            <div className="mt-4">
              <a href="/" className="text-blue-600 hover:underline">
                Return to home page
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 