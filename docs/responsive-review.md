# Responsive coverage report

Validated on 2026-11-22 using an optimized production build in Chromium with an isolated local fixture API. No production accounts, bookings, or payments were changed.

- Source routes discovered: 23. Every page.tsx route is included.
- Page/role/state checks: 186, across widths 320, 390, 768, 1024, 1366, 1920px.
- Interaction/state checks: 74, across 320x740, 390x844, 768x1024, and 844x390.
- Horizontal document overflow: none. Desktop sidebar/content overlap: none.
- Body typography resolves to Geist. No unexpected browser runtime errors in page checks.

| Route | Session | Result |
| --- | --- | --- |
| /about | Guest | Pass at all six widths |
| /faq | Guest | Pass at all six widths |
| / | Guest | Pass at all six widths |
| /payment/cancel | Customer | Pass at all six widths |
| /payment/success | Customer | Pass at all six widths |
| /services | Guest | Pass at all six widths |
| /services/[id] | Guest | Pass at all six widths |
| /sign-in | Guest | Pass at all six widths |
| /sign-up | Guest | Pass at all six widths |
| /technicians/[email] | Guest | Pass at all six widths |
| /dashboard/admin/bookings | admin | Pass at all six widths |
| /dashboard/admin | admin | Pass at all six widths |
| /dashboard/admin/services | admin | Pass at all six widths |
| /dashboard/admin/transactions | admin | Pass at all six widths |
| /dashboard/admin/users | admin | Pass at all six widths |
| /dashboard/customer/bookings | customer | Pass at all six widths |
| /dashboard/customer | customer | Pass at all six widths |
| /dashboard/customer/payments | customer | Pass at all six widths |
| /dashboard/profile | Admin, customer, technician | Pass at all six widths |
| /dashboard/technician/add-service | technician | Pass at all six widths |
| /dashboard/technician/my-services | technician | Pass at all six widths |
| /dashboard/technician | technician | Pass at all six widths |
| /dashboard/technician/requests | technician | Pass at all six widths |

Additional page states: empty service search, missing service, missing technician, general 404, payment verification failure, and payment verification success. Profile is tested for all three roles.

Interactions: account and notification menus for all roles; mobile drawer navigation and desktop resize cleanup; public mobile navigation; real file-chooser activation, no visible filename and discard; service edit/delete; completion; category selection; repair request; booking cancellation; rating dialog; expanded booking details; loading skeletons and the error boundary.

Screenshots were visually inspected for the mobile profile and landscape repair request. Screenshot files and raw JSON remain in the ignored .responsive-review directory. Image responses are fixture pixels; the audit verifies layout and interaction rather than production imagery or external payment processing.

The existing image-upload and review/transaction browser suites are run separately to guard upload and live-update behavior.

Reproduce with the responsive scripts documented in README.md. Route discovery makes newly added pages part of future checks automatically.
