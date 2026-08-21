import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-4xl font-bold tracking-tight mb-2">404 - Page Not Found</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-[500px]">
        The financial data or page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button size="lg" className="h-12 px-8 text-base">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
