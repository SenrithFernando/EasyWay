import React, { useEffect, useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RatingStars } from '../components/feedback/RatingStars';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { feedbackApi } from '../services/feedbackApi';
import { formatTimeAgo } from '../utils/feedbackDate';

const EDIT_WINDOW_MINUTES = 30;
const sentimentVariantMap = {
  Positive: 'success',
  Neutral: 'neutral',
  Negative: 'warning',
};

const canStillManage = (createdAt) => {
  const createdTimestamp = new Date(createdAt).getTime();
  return Date.now() - createdTimestamp <= EDIT_WINDOW_MINUTES * 60 * 1000;
};

export function StudentFeedbackHistory() {
  const [feedback, setFeedback] = useState([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const editingItem = useMemo(
    () => feedback.find((item) => item._id === editingFeedbackId),
    [editingFeedbackId, feedback]
  );

  const loadFeedback = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await feedbackApi.getMyFeedback();
      setFeedback(response.data || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to load your feedback history.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleDelete = async (feedbackId) => {
    try {
      await feedbackApi.deleteFeedback(feedbackId);
      setFeedback((current) => current.filter((item) => item._id !== feedbackId));
      setMessage({ type: 'success', text: 'Feedback deleted successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to delete feedback.',
      });
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-surface-900">My Feedback History</h1>
        <p className="text-surface-500">
          Review, edit, or delete your recent feedback within the allowed time window.
        </p>
      </div>

      {message.text ? (
        <Card
          className={`mb-6 ${
            message.type === 'success'
              ? 'border border-success-100 bg-success-50 text-success-700'
              : 'border border-red-100 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </Card>
      ) : null}

      {editingItem ? (
        <div className="mb-8">
          <FeedbackForm
            key={editingItem._id}
            mode="edit"
            feedbackId={editingItem._id}
            initialValues={{
              rating: editingItem.rating,
              comment: editingItem.comment,
            }}
            onCancel={() => setEditingFeedbackId('')}
            onSuccess={(updatedFeedback) => {
              setFeedback((current) =>
                current.map((item) =>
                  item._id === updatedFeedback._id ? updatedFeedback : item
                )
              );
              setEditingFeedbackId('');
              setMessage({ type: 'success', text: 'Feedback updated successfully.' });
            }}
          />
        </div>
      ) : null}

      <div className="grid gap-5">
        {loading ? (
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl border border-surface-100 bg-surface-100"
            />
          ))
        ) : feedback.length ? (
          feedback.map((item) => {
            const withinWindow = canStillManage(item.createdAt);

            return (
              <Card key={item._id} className="border border-surface-100">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-surface-900">
                        {item.canteenId?.name || 'Canteen'}
                      </h3>
                      <Badge variant={sentimentVariantMap[item.sentiment] || 'neutral'}>
                        {item.sentiment}
                      </Badge>
                      <Badge variant={sentimentVariantMap[item.status] || 'neutral'}>
                        Status: {item.status || item.sentiment || 'Neutral'}
                      </Badge>
                      <Badge variant={withinWindow ? 'brand' : 'warning'}>
                        {withinWindow ? 'Editable' : 'Expired'}
                      </Badge>
                    </div>
                    <RatingStars value={item.rating} />
                    <p className="max-w-3xl leading-7 text-surface-700">{item.comment}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-surface-500">
                      <span>Order: {item.orderId?._id || 'N/A'}</span>
                      <span>Access: {withinWindow ? 'Can update or delete' : 'Locked'}</span>
                      <span>Submitted {formatTimeAgo(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex min-w-[230px] flex-col gap-3 rounded-2xl bg-surface-50 p-4">
                    <p className="text-sm font-medium text-surface-600">
                      {withinWindow
                        ? `Editable for ${EDIT_WINDOW_MINUTES} minutes after submission`
                        : 'Edit and delete window has expired'}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => setEditingFeedbackId(item._id)}
                      disabled={!withinWindow}
                    >
                      <PencilIcon size={16} className="mr-2" />
                      Edit Feedback
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(item._id)}
                      disabled={!withinWindow}
                      className="border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2Icon size={16} className="mr-2" />
                      Delete Feedback
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="border border-dashed border-surface-200 text-center text-surface-500">
            You have not submitted any feedback yet.
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
