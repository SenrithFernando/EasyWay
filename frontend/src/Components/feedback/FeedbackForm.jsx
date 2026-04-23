import React, { useMemo, useState } from 'react';
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon, MessageSquareMoreIcon, SendIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RatingStars } from './RatingStars';
import { feedbackApi } from '../../Services/feedbackApi';

const getInitialState = (initialValues = {}) => ({
  rating: initialValues.rating || 0,
  comment: initialValues.comment || '',
});

const validateFeedbackForm = ({ rating, comment }) => {
  const errors = {};
  const normalizedComment = comment.trim();

  if (!rating) {
    errors.rating = 'Select a rating from 1 to 5.';
  }

  if (!normalizedComment) {
    errors.comment = 'Comment is required.';
  } else if (normalizedComment.length < 5) {
    errors.comment = 'Comment must be at least 5 characters.';
  } else if (normalizedComment.length > 300) {
    errors.comment = 'Comment cannot exceed 300 characters.';
  } else if (/^(.)\1{4,}$/.test(normalizedComment)) {
    errors.comment = 'Comment cannot contain only repeated characters.';
  } else if (!/[A-Za-z0-9]/.test(normalizedComment)) {
    errors.comment = 'Comment must include meaningful text.';
  }

  return errors;
};

export function FeedbackForm({
  mode = 'create',
  orderId,
  vendorId,
  feedbackId,
  initialValues,
  title,
  submitLabel,
  onSuccess,
  onCancel,
  disabled = false,
  disabledMessage = '',
  demoMode = false,
}) {
  const [formData, setFormData] = useState(getInitialState(initialValues));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedTitle = useMemo(() => {
    if (title) {
      return title;
    }

    return mode === 'edit' ? 'Update Feedback' : 'Share Your Experience';
  }, [mode, title]);

  const resolvedSubmitLabel =
    submitLabel || (mode === 'edit' ? 'Update Feedback' : 'Submit Feedback');

  const validationErrors = useMemo(() => validateFeedbackForm(formData), [formData]);
  const isFormValid = Object.keys(validationErrors).length === 0;
  const isSubmitDisabled = disabled || isSubmitting || !isFormValid;

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent submission if form is disabled
    if (disabled || isSubmitting) {
      return;
    }

    const nextErrors = validateFeedbackForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const payload =
        mode === 'edit'
          ? { rating: formData.rating, comment: formData.comment.trim() }
          : demoMode
            ? { vendorId: vendorId || undefined, rating: formData.rating, comment: formData.comment.trim() }
            : {
                orderId,
                vendorId: vendorId,
                rating: formData.rating,
                comment: formData.comment.trim(),
              };

      const response =
        mode === 'edit'
          ? await feedbackApi.updateFeedback(feedbackId, payload)
          : demoMode
            ? await feedbackApi.createDemoFeedback(payload)
            : await feedbackApi.createFeedback(payload);

      setStatus({
        type: 'success',
        message: response.message || 'Feedback saved successfully.',
      });

      if (mode === 'create') {
        setFormData(getInitialState());
      }

      onSuccess?.(response.data);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to save feedback.',
      });

      if (error.errors) {
        setErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-surface-100">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
          <MessageSquareMoreIcon size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-surface-900">{resolvedTitle}</h3>
          <p className="mt-1 text-sm text-surface-500">
            Rate the order and share a short comment.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-surface-700">
            Rating
          </label>
          <RatingStars
            interactive
            value={formData.rating}
            onChange={(value) => handleChange('rating', value)}
            size={28}
          />
          {errors.rating ? <p className="mt-2 text-sm text-red-600">{errors.rating}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-surface-700">
            Comment
          </label>
          <textarea
            rows={5}
            value={formData.comment}
            onChange={(event) => handleChange('comment', event.target.value)}
            className={`w-full rounded-2xl border px-4 py-3 text-surface-900 outline-none transition focus:bg-surface-0 ${
              errors.comment
                ? 'border-red-300 bg-red-50/60 focus:border-red-400'
                : 'border-surface-200 bg-surface-50 focus:border-brand-400'
            }`}
            placeholder="Tell us what went well or what should improve..."
          />
          <div className="mt-2 flex items-center justify-between text-xs text-surface-500">
            <span>{errors.comment || 'Use 5 to 300 characters.'}</span>
            <span>{formData.comment.trim().length}/300</span>
          </div>
        </div>

        {disabledMessage ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircleIcon size={18} className="mt-0.5 flex-shrink-0" />
            <span>{disabledMessage}</span>
          </div>
        ) : null}

        {status.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'bg-success-50 text-success-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {status.type === 'success' ? (
                <CheckCircle2Icon size={16} />
              ) : (
                <AlertCircleIcon size={16} />
              )}
              <span>{status.message}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" fullWidth disabled={isSubmitDisabled}>
            {isSubmitting ? (
              <>
                Saving Feedback
                <Loader2Icon size={16} className="ml-2 animate-spin" />
              </>
            ) : (
              <>
                {resolvedSubmitLabel}
                <SendIcon size={16} className="ml-2" />
              </>
            )}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
