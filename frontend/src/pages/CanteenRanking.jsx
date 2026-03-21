import React, { useEffect, useState } from 'react';
import { TrophyIcon } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { feedbackApi } from '../services/feedbackApi';

export function CanteenRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await feedbackApi.getCanteenRanking();
        setRanking(response.data || []);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load canteen ranking.');
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex items-start gap-4">
        <div className="rounded-3xl bg-warm-100 p-4 text-warm-600">
          <TrophyIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Canteen Ranking</h1>
          <p className="mt-2 text-surface-500">
            Ranking combines average rating, sentiment score, and review volume.
          </p>
        </div>
      </div>

      {error ? (
        <Card className="mb-6 border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-100">
            <thead className="bg-surface-50">
              <tr className="text-left text-sm text-surface-500">
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Canteen</th>
                <th className="px-6 py-4 font-semibold">Average Rating</th>
                <th className="px-6 py-4 font-semibold">Reviews</th>
                <th className="px-6 py-4 font-semibold">Sentiment Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 bg-surface-0">
              {loading ? (
                [1, 2, 3, 4, 5].map((item) => (
                  <tr key={item}>
                    <td className="px-6 py-5" colSpan="5">
                      <div className="h-10 animate-pulse rounded-xl bg-surface-100" />
                    </td>
                  </tr>
                ))
              ) : ranking.length ? (
                ranking.map((item) => (
                  <tr key={item.canteenId} className="hover:bg-surface-50">
                    <td className="px-6 py-5">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-surface-900">{item.canteenName}</td>
                    <td className="px-6 py-5 text-surface-700">{item.averageRating}</td>
                    <td className="px-6 py-5 text-surface-700">{item.totalReviews}</td>
                    <td className="px-6 py-5 text-surface-700">{item.sentimentScore}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-10 text-center text-surface-500" colSpan="5">
                    No ranking data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
