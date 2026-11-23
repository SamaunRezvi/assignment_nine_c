'use client';

import { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { SHIFTS, type Service, type Shift } from '@/lib/types';

export function RequestRepairDialog({ service }: { service: Service }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [shift, setShift] = useState<Shift | ''>('');
  const [problemDescription, setProblemDescription] = useState('');
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [shiftError, setShiftError] = useState('');
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [lockedShifts, setLockedShifts] = useState<{ date: string; shift: Shift }[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api
      .get<{ unavailableDates: string[]; lockedShifts: { date: string; shift: Shift }[] }>(
        `/api/technicians/${encodeURIComponent(service.technicianEmail)}`
      )
      .then((data) => {
        setUnavailableDates(data.unavailableDates ?? []);
        setLockedShifts(data.lockedShifts ?? []);
      })
      .catch(() => {
        setUnavailableDates([]);
        setLockedShifts([]);
      });
  }, [service.technicianEmail]);

  const isShiftLocked = (date: string, s: Shift | '') =>
    !!s && lockedShifts.some((entry) => entry.date === date && entry.shift === s);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDateError('');
    setShiftError('');

    if (unavailableDates.includes(preferredDate)) {
      setDateError('The technician is not available on this date. Please choose another date.');
      return;
    }

    if (!shift) {
      setShiftError('Please select a shift');
      return;
    }

    if (isShiftLocked(preferredDate, shift)) {
      setShiftError('This shift is fully booked. Please choose another shift or date.');
      return;
    }

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
        shift,
        problemDescription,
      });
      toast.success('Repair request sent successfully');
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.message || 'You already have an active request for this service');
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
              <div className="grid gap-4 sm:grid-cols-2">
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
                  onChange={(e) => {
                    setPreferredDate(e.target.value);
                    setDateError(unavailableDates.includes(e.target.value) ? 'The technician is not available on this date. Please choose another date.' : '');
                    setShiftError(
                      isShiftLocked(e.target.value, shift)
                        ? 'This shift is fully booked. Please choose another shift or date.'
                        : ''
                    );
                  }}
                />
                {dateError && <p className="text-sm text-destructive">{dateError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shift">Preferred Shift</Label>
                <Select
                  required
                  value={shift}
                  onValueChange={(value) => {
                    setShift(value as Shift);
                    setShiftError(
                      isShiftLocked(preferredDate, value as Shift)
                        ? 'This shift is fully booked. Please choose another shift or date.'
                        : ''
                    );
                  }}
                >
                  <SelectTrigger id="shift" className="w-full">
                    <SelectValue placeholder="Select a shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s.value} value={s.value} disabled={isShiftLocked(preferredDate, s.value)}>
                        {s.label}
                        {isShiftLocked(preferredDate, s.value) ? ' (fully booked)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shiftError && <p className="text-sm text-destructive">{shiftError}</p>}
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
