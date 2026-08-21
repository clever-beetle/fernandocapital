'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">System Error</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-[500px]">
        We encountered a temporary issue while fetching the data. Our systems have been notified.
      </p>
      <Button 
        onClick={() => reset()} 
        size="lg" 
        variant="outline"
        className="h-12 px-8 text-base"
      >
        Try Again
      </Button>
    </div>
  );
}
