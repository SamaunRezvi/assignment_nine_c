import { getToken } from './api-client';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function downloadInvoice(bookingId: string): Promise<void> {
  const token = getToken();

  const res = await fetch(`${SERVER_URL}/api/payments/${bookingId}/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    throw new Error('Could not download the invoice');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fixmate-invoice-${bookingId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
