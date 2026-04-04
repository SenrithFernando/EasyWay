import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquareHeartIcon } from 'lucide-react';
import { DashboardLayout } from "../Components/layout/DashboardLayout";
import { FeedbackList } from "../Components/feedback/FeedbackList";
import { Badge } from "../Components/ui/Badge";
import { Card } from "../Components/ui/Card";
import { feedbackApi } from "../Services/feedbackApi";

export function CanteenFeedbackPage() {
  const { vendorId } = useParams();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFeedback = async () => {
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
        setError(requestError.message || 'Unable to load vendor feedback.');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      loadFeedback();
    }
  }, [vendorId]);

  return (
    <DashboardLayout role="student">
      <Card className="mb-8 border-none bg-gradient-to-r from-surface-900 via-surface-800 to-brand-700 text-white shadow-elevated">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="warm" className="border-none bg-white/15 text-white">
              Public Reviews
            </Badge>
            <h1 className="mt-4 text-3xl font-bold">Canteen Feedback</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Browse what students are saying about this canteen. Reviews are sorted newest first, with sentiment and ratings visible at a glance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Average Rating</p>
              <p className="mt-3 text-3xl font-bold">{stats.averageRating}</p>
            </div>
            <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Total Reviews</p>
              <p className="mt-3 text-3xl font-bold">{stats.totalReviews}</p>
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="mb-6 border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}

      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
          <MessageSquareHeartIcon size={18} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Latest student reviews</h2>
          <p className="text-sm text-surface-500">Live canteen feedback with ratings and sentiment.</p>
        </div>
      </div>

      <FeedbackList
        feedback={feedback}
        loading={loading}
        emptyMessage="No reviews have been submitted for this canteen yet."
      />
    </DashboardLayout>
  );
}
