import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquareIcon, StoreIcon } from 'lucide-react';
import { DashboardLayout } from '../Components/layout/DashboardLayout';
import { FeedbackList } from '../Components/feedback/FeedbackList';
import { Badge } from '../Components/ui/Badge';
import { Card } from '../Components/ui/Card';
import { feedbackApi } from '../Services/feedbackApi';
import { RatingStars } from '../Components/feedback/RatingStars';

function CanteenAccordionItem({ canteen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const vendorId = canteen.vendorId || canteen._id;

  const toggleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !hasLoaded) {
      setLoading(true);
      try {
        const response = await feedbackApi.getVendorFeedback(vendorId);
        setFeedback(response.data || []);
        setHasLoaded(true);
      } catch (err) {
        setError(err.message || 'Failed to load feedback for this canteen.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border border-surface-200 bg-white transition-all hover:shadow-md">
      <div 
        className="flex cursor-pointer items-center justify-between p-6 hover:bg-surface-50"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <StoreIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900">{canteen.vendorName || canteen.name || 'Unnamed Canteen'}</h3>
            <div className="mt-1 flex items-center gap-3">
              <RatingStars value={Math.round(canteen.averageRating || 0)} />
              <span className="text-sm font-medium text-surface-500">
                {canteen.totalReviews || 0} reviews
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="neutral" icon={<MessageSquareIcon size={14} />}>
            View Feedback
          </Badge>
          <div className="text-surface-400">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-surface-100 bg-surface-50 p-6">
          {loading ? (
            <div className="flex justify-center p-8 text-surface-400">Loading feedback...</div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">{error}</div>
          ) : feedback.length === 0 ? (
            <div className="rounded-lg border border-dashed border-surface-200 p-8 text-center text-surface-500">
              No feedback has been submitted for this canteen yet.
            </div>
          ) : (
            <FeedbackList feedback={feedback} />
          )}
        </div>
      )}
    </Card>
  );
}

export function AdminCanteenFeedbacksPage() {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCanteens = async () => {
      try {
        const response = await feedbackApi.getVendorRanking();
        setCanteens(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load canteens list.');
      } finally {
        setLoading(false);
      }
    };

    loadCanteens();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl bg-[linear-gradient(135deg,_#1e293b_0%,_#0f172a_100%)] p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold tracking-tight">Canteen Feedback Records</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Expand any canteen below to review all detailed student feedback submissions in chronological order.
          </p>
        </header>

        {error ? (
          <Card className="border-red-200 bg-red-50 text-red-700">{error}</Card>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-2xl bg-surface-200" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {canteens.map((canteen) => (
              <CanteenAccordionItem key={canteen.vendorId || canteen._id} canteen={canteen} />
            ))}
            
            {canteens.length === 0 && (
              <div className="rounded-2xl border border-dashed border-surface-300 p-12 text-center text-surface-500">
                No canteens available yet.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
