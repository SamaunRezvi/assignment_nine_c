'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import type { Service } from '@/lib/types';

export function RequestRepairDialog({ service }: { service: Service }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (problemDescription.trim().length < 20) {
      setError('Problem description must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/bookings', {
        serviceId: service._id,
        phone,
        address,
        preferredDate,
        problemDescription,
      });
      toast.success('Repair request sent successfully');
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('You already have an active request for this service');
      } else {
        toast.error('Could not send the request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          Request Repair
        </Button>
      </DialogTrigger>
      <DialogContent>
        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <DialogTitle>Request Sent</DialogTitle>
            <p className="text-muted-foreground">
              Your repair request has been sent to {service.technicianName}. You can track its status
              from your bookings.
            </p>
            <Button asChild>
              <Link href="/dashboard/customer/bookings">Go to My Bookings</Link>
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request Repair for {service.title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={user?.name ?? ''} readOnly disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ''} readOnly disabled />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  required
                  min={today}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="problemDescription">Problem Description</Label>
                <Textarea
                  id="problemDescription"
                  required
                  rows={4}
                  placeholder="Describe what is wrong with your device (at least 20 characters)"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Sending...' : 'Send Request'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
