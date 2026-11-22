import { Card } from '@/components/ui/card';

const FAQS = [
  {
    question: 'How does booking a repair work?',
    answer:
      'Browse approved services on the Services page, open the one you need, and send a repair request with your address, a preferred date and a short description of the problem. The technician who owns that service will accept, reject or start working on your request from their dashboard.',
  },
  {
    question: 'When do I actually pay?',
    answer:
      'FixMate uses a pay after service model. You never pay a deposit or an upfront fee. Once your technician marks the job as completed and sets the final amount, a Pay Now button appears on your booking and you can pay securely through Stripe.',
  },
  {
    question: 'How do I become a technician on FixMate?',
    answer:
      'Sign up and choose the Technician role. From your dashboard, add a service with a title, category, description, price, estimated duration and a photo. Your service stays pending until an admin reviews and approves it, after which it becomes visible to customers.',
  },
  {
    question: 'Why is my service still pending?',
    answer:
      'Every new or edited service is reviewed by an admin before it goes live. This keeps the marketplace trustworthy for customers. Approval is usually quick, and you can see the current status on your My Services page at any time.',
  },
  {
    question: 'Can I cancel a repair request?',
    answer:
      'Yes, but only while the request is still in the Requested stage, before a technician has accepted it. Once a technician accepts your request, cancellation is no longer available since they may have already scheduled time for the job.',
  },
  {
    question: 'How do ratings and reviews work?',
    answer:
      'After a job is marked completed and you have paid for it, you can leave a star rating and a short review for that technician. Ratings are shown as an average on the technician profile and on each of their services, so other customers can see real feedback.',
  },
  {
    question: 'What does the Verified badge mean?',
    answer:
      'A technician earns a Verified badge once they have at least one service approved by an admin. It is a quick signal that the technician has been reviewed and is actively offering approved work on the platform.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Reach us at support@fixmate.app or the phone number listed in the footer. For issues with a specific booking, include the booking details so we can help faster.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Answers to the most common questions about booking, payments and becoming a technician on
          FixMate.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq) => (
          <Card key={faq.question} className="p-6">
            <h2 className="mb-2 font-semibold">{faq.question}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
