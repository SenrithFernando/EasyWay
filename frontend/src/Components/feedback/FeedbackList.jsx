import React from 'react';
import { MessageSquareQuoteIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RatingStars } from './RatingStars';
import { formatFeedbackDate } from '../../utils/feedbackDate';

const getReviewerName = (student) => {
  if (!student) {
    return 'Anonymous Student';
  }

  return student.name || [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Student';
};

const sentimentVariantMap = {
  Positive: 'success',
  Neutral: 'neutral',
  Negative: 'warning',
};

export function FeedbackList({
  feedback = [],
  loading = false,
  emptyMessage = 'No feedback available yet.',
  showBorderAccent = true,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-2xl border border-surface-100 bg-surface-100"
          />
        ))}
      </div>
    );
  }

  if (!feedback.length) {
    return (
      <Card className="border border-dashed border-surface-200 text-center text-surface-500">
        {emptyMessage}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card
          key={item._id || item.feedbackId}
          className={`border border-surface-100 ${showBorderAccent ? 'relative overflow-hidden' : ''}`}
        >
          {showBorderAccent ? (
            <div className="absolute inset-y-0 left-0 w-1.5 rounded-r-full bg-gradient-to-b from-brand-500 via-warm-500 to-success-500" />
          ) : null}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="pl-0 sm:pl-2">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h4 className="text-lg font-semibold text-surface-900">
                  {getReviewerName(item.studentId || item.student)}
                </h4>
                <Badge variant={sentimentVariantMap[item.sentiment] || 'brand'}>
                  {item.sentiment || 'Neutral'}
                </Badge>
              </div>
              <RatingStars value={item.rating} />
            </div>
            <p className="text-sm text-surface-500">{formatFeedbackDate(item.createdAt)}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-surface-50 px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-surface-400">
              <MessageSquareQuoteIcon size={16} />
              <span className="text-xs font-medium uppercase tracking-[0.2em]">Student Review</span>
            </div>
            <p className="leading-7 text-surface-700">{item.comment}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
