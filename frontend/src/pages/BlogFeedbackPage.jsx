import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, BadgeCheckIcon, LayoutDashboardIcon, ListChecksIcon, MedalIcon, MessageSquareHeartIcon } from 'lucide-react';
import { Navbar } from '../Components/layout/Navbar';
import { Card } from '../Components/ui/Card';
import { Badge } from '../Components/ui/Badge';
import { FeedbackForm } from '../Components/feedback/FeedbackForm';
import { FeedbackList } from '../Components/feedback/FeedbackList';
import { feedbackApi } from '../Services/feedbackApi';

const DEMO_FEEDBACK = [
  {
    _id: 'demo-1',
    studentId: { name: 'Ayesha K.' },
    rating: 5,
    comment: 'Fresh rice, neat packaging, and the queue moved surprisingly fast.',
    sentiment: 'Positive',
    createdAt: '2026-03-20T11:20:00.000Z',
  },
  {
    _id: 'demo-2',
    studentId: { name: 'Ravindu M.' },
    rating: 3,
    comment: 'Food quality was okay, but pickup instructions could be clearer.',
    sentiment: 'Neutral',
    createdAt: '2026-03-19T08:45:00.000Z',
  },
  {
    _id: 'demo-3',
    studentId: { name: 'Nethmi P.' },
    rating: 2,
    comment: 'Order arrived late and the drink was warm instead of cold.',
    sentiment: 'Negative',
    createdAt: '2026-03-18T06:15:00.000Z',
  },
];

const QUICK_LINKS = [
  {
    title: 'Student History',
    description: 'Review feedback, edit recent submissions, and remove mistakes within the time window.',
    icon: ListChecksIcon,
    path: '/student/feedback/history',
  },
  {
    title: 'Manager Dashboard',
    description: 'See rating trends, sentiment breakdown, and recent reviews for each canteen.',
    icon: LayoutDashboardIcon,
    path: '/vendor/canteens/:canteenId/feedback-dashboard',
  },
  {
    title: 'Canteen Ranking',
    description: 'Compare canteens by average rating, review volume, and sentiment score.',
    icon: MedalIcon,
    path: '/admin/canteens/ranking',
  },
];

export function BlogFeedbackPage() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId') || '';
  const orderId = searchParams.get('orderId') || '';

  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmitRealFeedback = Boolean(vendorId && orderId);
  const canSubmitDemoFeedback = true; // Demo mode always allowed
  const canSubmitFeedback = canSubmitRealFeedback || canSubmitDemoFeedback;

  const submissionHint = useMemo(() => {
    if (canSubmitRealFeedback) {
      return '';
    }
    return 'Submit feedback in demo mode (no order required). Add vendorId in the URL to link to a specific canteen, e.g. /#/blog?vendorId=YOUR_VENDOR_ID';
  }, [canSubmitRealFeedback]);

  const quickLinks = useMemo(
    () =>
      QUICK_LINKS.map((item) => ({
        ...item,
        path:
          item.path === '/vendor/canteens/:canteenId/feedback-dashboard'
            ? vendorId
              ? `/vendor/canteens/${vendorId}/feedback-dashboard`
              : '/vendor'
            : item.path,
      })),
    [vendorId]
  );

  useEffect(() => {
    const loadFeedback = async () => {
      if (!vendorId) {
        setFeedback(DEMO_FEEDBACK);
        setStats({ averageRating: 3.3, totalReviews: DEMO_FEEDBACK.length });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [feedbackResponse, statsResponse] = await Promise.all([
          feedbackApi.getVendorFeedback(vendorId),
          feedbackApi.getVendorStats(vendorId),
        ]);

        setFeedback(feedbackResponse.data || []);
        setStats(statsResponse.data || { averageRating: 0, totalReviews: 0 });
      } catch (requestError) {
        setError(requestError.message || 'Unable to load canteen feedback right now.');
        setFeedback(DEMO_FEEDBACK);
        setStats({ averageRating: 3.3, totalReviews: DEMO_FEEDBACK.length });
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [vendorId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,173,71,0.18),_transparent_26%),linear-gradient(180deg,_#fffaf5_0%,_#f8fafc_100%)]">
      <Navbar />

      <section className="px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Badge variant="warm" className="px-3 py-1 text-xs uppercase tracking-[0.3em]">
                Easy Food Feedback
              </Badge>
              <div>
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
                  Modern <span className="text-brand-500">feedback management</span> for student food orders.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-surface-600">
                  Collect ratings, comments, and sentiment in one clean workflow. Optimized for 
                  transparency and speed between students and canteens.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-none bg-surface-900 text-white shadow-elevated">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/60">Average Rating</p>
                  <p className="mt-4 text-4xl font-bold">{stats.averageRating || '0.0'}</p>
                </Card>
                <Card className="border border-surface-100 bg-white/85 backdrop-blur">
                  <p className="text-sm uppercase tracking-[0.25em] text-surface-400">Reviews</p>
                  <p className="mt-4 text-4xl font-bold text-surface-900">{stats.totalReviews}</p>
                </Card>
                <Card className="border border-surface-100 bg-white/85 backdrop-blur">
                  <p className="text-sm uppercase tracking-[0.25em] text-surface-400">Status</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-success-700">
                    <BadgeCheckIcon size={18} />
                    <span>{vendorId ? 'Live canteen mode' : 'Demo preview mode'}</span>
                  </div>
                </Card>
              </div>
            </div>

            <Card className="border border-surface-100 bg-white/90 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
                  <MessageSquareHeartIcon size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-900">Feedback module screens</h2>
                  <p className="text-sm text-surface-500">Open the other parts of the system directly.</p>
                </div>
              </div>
              <div className="space-y-4">
                {quickLinks.map((item) => (
                  <Card key={item.title} className="border border-surface-100 bg-surface-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="rounded-2xl bg-white p-3 text-surface-700 shadow-sm">
                          <item.icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-surface-900">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-surface-500">{item.description}</p>
                        </div>
                      </div>
                      <Link
                        to={item.path}
                        className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-surface-200 text-surface-600 transition hover:border-brand-300 hover:text-brand-600"
                      >
                        <ArrowRightIcon size={16} />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <FeedbackForm
            title="Rate Your Order"
            submitLabel="Submit Feedback"
            orderId={orderId}
            vendorId={vendorId}
            demoMode={!canSubmitRealFeedback}
            disabled={!canSubmitFeedback}
            disabledMessage={submissionHint}
            onSuccess={(createdFeedback) => {
              setFeedback((current) => [createdFeedback, ...current]);
              setStats((current) => ({
                totalReviews: current.totalReviews + 1,
                averageRating: current.totalReviews
                  ? (
                      (current.averageRating * current.totalReviews + createdFeedback.rating) /
                      (current.totalReviews + 1)
                    ).toFixed(1)
                  : createdFeedback.rating.toFixed(1),
              }));
            }}
          />

          <div className="space-y-6">
            <Card className="border-none bg-gradient-to-r from-brand-500 via-brand-400 to-warm-500 text-white shadow-elevated">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-white/70">Public Reviews</p>
                  <h2 className="mt-2 text-3xl font-bold">Newest feedback first</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                    Students can review completed orders, while managers and admins can monitor the same data through analytics dashboards.
                  </p>
                </div>
                <div className="rounded-3xl bg-white/15 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70">Review Count</p>
                  <p className="mt-2 text-3xl font-bold">{stats.totalReviews}</p>
                </div>
              </div>
            </Card>

            {error ? (
              <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
            ) : null}

            <FeedbackList
              feedback={feedback}
              loading={loading}
              emptyMessage="No feedback has been submitted yet for this canteen."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
