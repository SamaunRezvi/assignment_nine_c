import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Wrench className="h-12 w-12 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-lg font-medium">This page could not be fixed</p>
        <p className="mt-1 text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
