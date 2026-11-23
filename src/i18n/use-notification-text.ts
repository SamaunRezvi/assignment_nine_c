'use client';

import { useTranslations } from 'next-intl';
import { useFormat, useLabels } from './use-format';
import type { AppNotification } from '@/lib/notification-stream';

const KNOWN_STATUSES = ['requested', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled', 'paid', 'rated', 'reschedule-proposed'];

export function useNotificationText() {
  const t = useTranslations('notifications');
  const labels = useLabels();
  const format = useFormat();

  return (item: AppNotification) => {
    // Older API responses only carry English text; show it as sent.
    if (!item.status || !KNOWN_STATUSES.includes(item.status) || !item.serviceTitle) {
      return { title: item.title, message: item.message };
    }
    const service = item.serviceTitle;
    let message = service;
    if (item.status === 'rated') {
      message = t('messages.rated', {
        name: item.customerName || t('messages.customer'),
        service,
        rating: item.rating ?? 0,
        review: (item.review || '').slice(0, 160),
      });
    } else if (item.status === 'accepted' && item.shift) {
      const shift = labels.shiftName(item.shift);
      message = item.assignedTimeSlot
        ? t('messages.acceptedWithSlot', { service, shift, slot: item.assignedTimeSlot })
        : t('messages.accepted', { service, shift });
    } else if (item.status === 'reschedule-proposed' && item.proposedShift) {
      message = t('messages.rescheduled', {
        service,
        shift: labels.shiftName(item.proposedShift),
        date: item.proposedDate ? format.date(item.proposedDate) : '',
      });
    }
    return { title: t(`titles.${item.status}`), message };
  };
}
