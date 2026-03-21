import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRightIcon,
  FlameIcon,
  MessageCircleWarningIcon,
  MessageSquareQuoteIcon,
  SparklesIcon,
  StarIcon,
  UtensilsCrossedIcon,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RatingStars } from '../components/feedback/RatingStars';
import { feedbackApi } from '../services/feedbackApi';
import { formatFeedbackDate } from '../utils/feedbackDate';

const chartColors = ['#7C2D12', '#C2410C', '#FB923C', '#FACC15', '#16A34A'];

const moodCards = {
  Positive: {
    icon: SparklesIcon,
    tone: 'success',
    shell: 'bg-[linear-gradient(135deg,_#ecfdf5_0%,_#d1fae5_100%)] border-emerald-100',
    accent: 'text-emerald-700',
  },
  Neutral: {
    icon: UtensilsCrossedIcon,
    tone: 'neutral',
    shell: 'bg-[linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_100%)] border-slate-100',
    accent: 'text-slate-700',
  },
  Negative: {
    icon: MessageCircleWarningIcon,
    tone: 'warning',
    shell: 'bg-[linear-gradient(135deg,_#fff7ed_0%,_#fed7aa_100%)] border-orange-100',
    accent: 'text-orange-700',
  },
};

export function CanteenFeedbackDashboard() {
  const { canteenId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await feedbackApi.getCanteenDashboard(canteenId, 6);
        setDashboard(response.data);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (canteenId) {
      loadDashboard();
    }
  }, [canteenId]);

  const dominantSentiment = useMemo(() => {
    if (!dashboard) {
      return 'Neutral';
    }

    return Object.entries(dashboard.sentimentBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';
  }, [dashboard]);

  const strongestRating = useMemo(() => {
    if (!dashboard?.ratingDistribution?.length) {
      return 0;
    }

    return [...dashboard.ratingDistribution].sort((a, b) => b.count - a.count)[0]?.rating || 0;
  }, [dashboard]);

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,196,107,0.35),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(248,113,113,0.25),_transparent_20%),linear-gradient(135deg,_#1c1917_0%,_#292524_35%,_#7c2d12_100%)] px-6 py-8 text-white shadow-[0_28px_80px_rgba(120,53,15,0.28)] sm:px-8 lg:px-10">
          <div className="absolute -right-12 top-8 h-36 w-36 rounded-full border border-white/10 bg-white/5 blur-sm" />
          <div className="absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-orange-300/10 blur-2xl" />
          <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Badge variant="warm" className="border-none bg-white/10 text-white">
                Manager View
              </Badge>
              <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                Your canteen's reputation, plated as a live story.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                This dashboard turns raw feedback into a mood board for food quality, service speed,
                and student satisfaction. Spot patterns fast, then act before the next lunch rush.
              </p>

              {dashboard ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">Average Rating</p>
                      <StarIcon size={18} className="fill-amber-300 text-amber-300" />
                    </div>
                    <p className="mt-4 text-5xl font-bold">{dashboard.summary.averageRating}</p>
                    <div className="mt-4">
                      <RatingStars value={Math.round(dashboard.summary.averageRating)} />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">House Mood</p>
                      <FlameIcon size={18} className="text-orange-300" />
                    </div>
                    <p className="mt-4 text-4xl font-bold">{dominantSentiment}</p>
                    <p className="mt-3 text-sm text-white/70">
                      Most visible emotional trend in current reviews
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {loading
                ? [1, 2, 3].map((item) => (
                    <div key={item} className="h-36 animate-pulse rounded-[1.75rem] bg-white/10" />
                  ))
                : [
                    {
                      label: 'Reviews Collected',
                      value: dashboard?.summary?.totalReviews || 0,
                      detail: 'Across completed orders',
                    },
                    {
                      label: 'Strongest Star Band',
                      value: strongestRating ? `${strongestRating} Star` : 'N/A',
                      detail: 'Most frequent rating bucket',
                    },
                    {
                      label: 'Service Pulse',
                      value:
                        (dashboard?.sentimentBreakdown?.Negative || 0) >
                        (dashboard?.sentimentBreakdown?.Positive || 0)
                          ? 'Needs Attention'
                          : 'Healthy',
                      detail: 'Instant operator signal',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur"
                    >
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">
                        {item.label}
                      </p>
                      <p className="mt-4 text-3xl font-bold">{item.value}</p>
                      <p className="mt-3 text-sm text-white/70">{item.detail}</p>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {error ? (
          <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
        ) : null}

        {loading ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[2rem] border border-surface-100 bg-surface-100"
              />
            ))}
          </div>
        ) : dashboard ? (
          <>
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card className="border-none bg-[linear-gradient(180deg,_#fff_0%,_#fff7ed_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-surface-400">
                      Rating Terrain
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-surface-900">
                      The shape of customer satisfaction
                    </h2>
                  </div>
                  <Badge variant="warm" icon={<ArrowUpRightIcon size={12} />}>
                    Live pattern
                  </Badge>
                </div>

                <div className="h-80 rounded-[1.5rem] bg-white/70 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboard.ratingDistribution} barGap={10}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#E7E5E4" vertical={false} />
                      <XAxis dataKey="rating" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(251, 146, 60, 0.08)' }}
                        contentStyle={{
                          borderRadius: '20px',
                          border: '1px solid #FED7AA',
                          boxShadow: '0 24px 50px rgba(124, 45, 18, 0.12)',
                        }}
                      />
                      <Bar dataKey="count" radius={[18, 18, 0, 0]}>
                        {dashboard.ratingDistribution.map((entry, index) => (
                          <Cell key={`${entry.rating}-${index}`} fill={chartColors[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid gap-4">
                {Object.entries(dashboard.sentimentBreakdown).map(([label, value]) => {
                  const config = moodCards[label] || moodCards.Neutral;
                  const Icon = config.icon;
                  const total = Math.max(dashboard.summary.totalReviews, 1);
                  const percentage = Math.round((value / total) * 100);

                  return (
                    <Card
                      key={label}
                      className={`border ${config.shell} shadow-[0_16px_40px_rgba(15,23,42,0.06)]`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-[1.25rem] bg-white/80 p-3 ${config.accent}`}>
                            <Icon size={22} />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
                              Sentiment Layer
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-surface-900">{label}</h3>
                          </div>
                        </div>
                        <Badge variant={config.tone}>{value} reviews</Badge>
                      </div>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-surface-500">Share of overall voice</span>
                          <span className="font-semibold text-surface-900">{percentage}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-white/80">
                          <div
                            className={`h-3 rounded-full ${
                              label === 'Positive'
                                ? 'bg-emerald-500'
                                : label === 'Negative'
                                  ? 'bg-orange-500'
                                  : 'bg-slate-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Card className="border-none bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-surface-400">
                    Review Feed
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-surface-900">
                    What students are saying right now
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-surface-500">
                  Use this section to catch repeated complaints, standout dishes, and service moments
                  worth reinforcing across your canteen team.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {dashboard.latestReviews.map((review, index) => (
                  <article
                    key={review.feedbackId}
                    className={`rounded-[1.75rem] border p-5 transition duration-300 hover:-translate-y-1 ${
                      index === 0
                        ? 'border-orange-200 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)] shadow-[0_18px_40px_rgba(249,115,22,0.12)]'
                        : 'border-surface-100 bg-white hover:shadow-elevated'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-[1.1rem] bg-brand-100 p-3 text-brand-700">
                          <MessageSquareQuoteIcon size={18} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-surface-900">
                            {review.student?.name || 'Student'}
                          </h3>
                          <p className="text-sm text-surface-500">
                            {formatFeedbackDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          review.sentiment === 'Positive'
                            ? 'success'
                            : review.sentiment === 'Negative'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {review.sentiment}
                      </Badge>
                    </div>

                    <div className="mt-5">
                      <RatingStars value={review.rating} />
                    </div>

                    <p className="mt-4 leading-7 text-surface-700">{review.comment}</p>
                  </article>
                ))}
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
