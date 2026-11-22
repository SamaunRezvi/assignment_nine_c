import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServiceNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Wrench className="h-12 w-12 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Service not found</h1>
        <p className="mt-2 text-muted-foreground">
          This service does not exist, is pending approval, or is no longer available.
        </p>
      </div>
      <Button asChild>
        <Link href="/services">Browse Services</Link>
      </Button>
    </div>
  );
}
