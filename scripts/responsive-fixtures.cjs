// Isolated local API for responsive browser coverage, including server-rendered pages.
const http = require('node:http');
const now = new Date().toISOString();
const service = {
  _id: '507f1f77bcf86cd799439011', title: 'Professional laptop and smartphone display diagnosis and replacement', category: 'Laptop & PC',
  description: 'Careful diagnostics and replacement with clear pricing. '.repeat(8), image: 'https://i.ibb.co/audit/photo.png',
  basePrice: 60, estimatedDuration: '2 to 3 working days', serviceMode: 'Home Visit', serviceArea: 'Ashulia, Savar, Dhaka',
  technicianName: 'Rafiq Hasan', technicianEmail: 'technician@example.test', approvalStatus: 'approved', isAvailable: true,
  averageRating: 4.8, reviewCount: 12, isVerified: true, createdAt: now,
};
const users = ['admin', 'customer', 'technician'].map(role => ({
  _id: `${role}-id`, id: `${role}-id`, name: role === 'technician' ? 'Rafiq Hasan' : role === 'customer' ? 'Tanvir Ahmed' : 'FixMate Admin',
  email: `${role}@example.test`, role, phone: '01722366777', area: 'Ashulia, Savar, Dhaka',
  bio: 'Experienced in professional device and appliance repairs.', image: service.image,
}));
const bookings = ['requested', 'accepted', 'in-progress', 'completed', 'completed', 'cancelled', 'rejected', 'completed'].map((status, index) => ({
  _id: `booking-${index}`, serviceId: service._id, serviceTitle: service.title, serviceImage: service.image,
  category: service.category, basePrice: 60, finalAmount: 60, technicianName: 'Rafiq Hasan', technicianEmail: 'technician@example.test',
  customerName: index === 1 ? 'A customer with a long but realistic full name' : 'Tanvir Ahmed', customerEmail: 'customer@example.test',
  customerPhone: '01722366777', address: 'Daffodil International University, Ashulia, Savar, Dhaka',
  preferredDate: '2026-11-23', problemDescription: 'iPhone 16 Pro Max, intermittent display and touchscreen issue. '.repeat(3),
  status, paymentStatus: [3, 4].includes(index) ? 'paid' : 'unpaid', createdAt: now,
  statusHistory: [{ status: 'requested', changedAt: now }, ...(status === 'completed' ? [{ status: 'completed', changedAt: now }] : [])],
  ...(index === 3 ? { rating: 5, review: 'Excellent service and communication. '.repeat(8), ratedAt: now } : {}),
}));
const payment = {
  _id: 'payment', bookingId: 'booking-3', serviceTitle: service.title, customerName: 'Tanvir Ahmed', customerEmail: 'customer@example.test',
  technicianName: 'Rafiq Hasan', technicianEmail: 'technician@example.test', amount: 60, currency: 'usd',
  transactionId: 'pi_test_transaction_with_a_very_long_reference_0123456789abcdefghijklmnopqrstuvwxyz',
  stripeSessionId: 'cs_audit', paymentStatus: 'paid', paidAt: now,
};
const notification = { id: 'notification', title: 'New customer feedback', message: 'Tanvir Ahmed rated your service 5/5. Excellent work and clear communication.', createdAt: now, href: '/dashboard/technician/requests' };
const notifications = Array.from({ length: 8 }, (_, index) => ({ ...notification, id: `notification-${index}` }));

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  const role = /audit_role=(admin|customer|technician)/.exec(req.headers.cookie || '')?.[1];
  const user = users.find(user => user.role === role);
  function json(data, status = 200) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); }
  if (p === '/health') return json({ status: 'ok' });
  if (p === '/api/auth/get-session') return json(user ? {
    session: { id: 'session', token: 'session', userId: user.id, expiresAt: '2099-01-01T00:00:00.000Z' },
    user: { ...user, emailVerified: true, createdAt: now, updatedAt: now },
  } : null);
  if (p === '/api/jwt') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const email = JSON.parse(body || '{}').email;
    return json({ token: `audit-${users.find(user => user.email === email)?.role || 'customer'}` });
  }
  if (p === '/api/users/me') return json(users.find(user => req.headers.authorization === `Bearer audit-${user.role}`) || user || users[0]);
  if (p.includes('/stats')) return json({ totalUsers: 120, totalTechnicians: 25, pendingServices: 8, totalRequests: 40, activeJobs: 6, completedJobs: 28, totalServices: 15, approvedServices: 12, pendingRequests: 4 });
  if (p === '/api/notifications/stream') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    res.write(`event: notifications\ndata: ${JSON.stringify({ enabled: true, readAt: '1970-01-01', unreadCount: notifications.length, items: notifications })}\n\n`);
    const timer = setInterval(() => res.write(': heartbeat\n\n'), 5_000);
    res.on('close', () => clearInterval(timer));
    return;
  }
  if (p.startsWith('/api/notifications')) return json({ enabled: true, readAt: '1970-01-01', unreadCount: notifications.length, items: notifications });
  if (p === '/api/services/featured' || p === '/api/services/mine/list' || p === '/api/admin/services') return json([service, { ...service, _id: '507f1f77bcf86cd799439012', approvalStatus: 'pending' }]);
  if (p === '/api/services' && url.searchParams.get('search') === 'audit-slow') await new Promise(resolve => setTimeout(resolve, 2_500));
  if (p === '/api/services' && url.searchParams.get('search') === 'audit-error') return json({ services: null, page: 1, totalPages: 1 });
  if (p === '/api/services') return json({ services: url.searchParams.get('search') === 'empty' ? [] : [service, { ...service, _id: '507f1f77bcf86cd799439012' }], total: 26, page: 1, totalPages: 3 });
  if (p.startsWith('/api/services/')) return p.endsWith('missing') ? json({}, 404) : json(service);
  if (p.startsWith('/api/technicians/')) return p.endsWith('missing') ? json({}, 404) : json({ ...users[2], isVerified: true, services: [service] });
  if (p === '/api/admin/users') return json(users);
  if (p === '/api/admin/payments') return json({ payments: [payment], totalRevenue: payment.amount });
  if (p === '/api/payments/my') return json([payment]);
  if (p === '/api/payments/verify') return url.searchParams.get('session_id') === 'invalid' ? json({}, 409) : json(payment);
  if (p.includes('/bookings')) {
    const status = url.searchParams.get('status');
    return json(status && status !== 'all' ? bookings.filter(booking => booking.status === status) : bookings);
  }
  return json({ message: 'Fixture endpoint not found' }, 404);
});
server.listen(5038, '127.0.0.1', () => console.log('Responsive fixtures ready on http://127.0.0.1:5038'));
