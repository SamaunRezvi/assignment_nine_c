import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Handshake, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified Technicians',
    desc: 'Every technician on FixMate is reviewed and approved by our team before their services go live, so you always know who is coming to fix your device.',
  },
  {
    icon: Handshake,
    title: 'Transparent Communication',
    desc: 'Every job has a visible status, from requested to completed, so you always know exactly where things stand without having to call anyone.',
  },
  {
    icon: Wallet,
    title: 'Pay After Service',
    desc: 'You never pay a deposit or an upfront fee. Payment only happens once your technician marks the job complete and you confirm you are happy.',
  },
];

const STEPS = [
  'Browse approved repair services by category or search for your exact device issue.',
  'Send a repair request with your address, preferred date and a short problem description.',
  'A verified technician accepts the job and updates its status as the work progresses.',
  'Once the job is marked completed, pay securely online and the job is closed out.',
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight">About FixMate</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Finding a repair technician you can actually trust is harder than it should be. FixMate was
          built to fix that, for both customers who need reliable repairs and technicians who deserve
          a proper place to run their work.
        </p>
      </div>

      <div className="mb-16 grid gap-6 sm:grid-cols-3">
        {VALUES.map((value) => (
          <Card key={value.title} className="space-y-3 p-6">
            <value.icon className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">{value.title}</h3>
            <p className="text-sm text-muted-foreground">{value.desc}</p>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl bg-secondary/40 p-8 sm:p-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">How It Works</h2>
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">Step {i + 1}: </span>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Have more questions?{' '}
        <Link href="/faq" className="font-medium text-primary hover:underline">
          Visit our FAQ page
        </Link>
      </p>
    </div>
  );
}
