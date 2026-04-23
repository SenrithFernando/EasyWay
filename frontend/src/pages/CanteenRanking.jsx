import React, { useEffect, useState } from 'react';
import { TrophyIcon, TrendingUpIcon, StarIcon, ActivityIcon, Building2Icon } from 'lucide-react';
import { DashboardLayout } from '../Components/layout/DashboardLayout';
import { Card } from '../Components/ui/Card';
import { Badge } from '../Components/ui/Badge';
import { feedbackApi } from '../Services/feedbackApi';

export function CanteenRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await feedbackApi.getVendorRanking();
        setRanking(response.data || []);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load vendor ranking.');
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)] border-yellow-200';
      case 2:
        return 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-[0_0_15px_rgba(148,163,184,0.4)] border-slate-300';
      case 3:
        return 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border-orange-200';
      default:
        return 'bg-surface-100 text-surface-600 border-surface-200';
    }
  };

  const getSentimentTone = (score) => {
    if (score > 5) return 'success';
    if (score > 0) return 'warm';
    if (score === 0) return 'neutral';
    return 'warning';
  };

  return (
    <DashboardLayout role="admin">
      {/* Header Banner */}
      <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm relative">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-50 to-transparent pointer-events-none" />
        <div className="px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
            <div className="rounded-2xl bg-[#0288d1]/10 p-3.5 text-[#0288d1] shadow-sm self-center">
              <TrophyIcon size={28} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 self-center">Canteen Ranking</h1>
            <p className="text-sm font-medium text-slate-500 max-w-xl col-start-2">
              A live leaderboard calculating average rating, sentiment score, and review volume to determine the top performing canteens on campus.
            </p>
          </div>
          
          {/* Mini-stat block */}
          <div className="flex items-center gap-6 px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 hidden lg:flex">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Canteens</p>
              <p className="text-xl font-bold text-slate-700">{ranking.length}</p>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Reviews</p>
              <p className="text-xl font-bold text-[#0288d1]">
                {ranking.reduce((acc, val) => acc + (val.totalReviews || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <Card className="mb-6 border border-red-100 bg-red-50 text-red-700 shadow-sm flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </Card>
      ) : null}

      {/* Main Ranking Table Card */}
      <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm bg-white rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400 w-24">Rank</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-2"><Building2Icon size={14}/> Canteen Vendor</div>
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-2"><StarIcon size={14}/> Average Rating</div>
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-2"><ActivityIcon size={14}/> Reviews</div>
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-2"><TrendingUpIcon size={14}/> Sentiment Score</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="bg-white">
                    <td className="px-6 py-6" colSpan="5">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-4 animate-pulse rounded bg-slate-100 w-1/3" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : ranking.length ? (
                ranking.map((item) => (
                  <tr key={item.vendorId} className="group hover:bg-[#0288d1]/[0.02] transition-colors bg-white">
                    {/* Rank Badge Column */}
                    <td className="px-6 py-5">
                      <div 
                        className={`font-black tracking-tighter w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${getRankBadgeColor(item.rank)} ${
                          item.rank <= 3 ? 'text-lg scale-110' : 'text-base'
                        }`}
                      >
                        {item.rank <= 3 ? `#${item.rank}` : item.rank}
                      </div>
                    </td>
                    
                    {/* Canteen Name Column */}
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-lg group-hover:text-[#0288d1] transition-colors">
                        {item.vendorName || item.canteenName || 'Unknown Vendor'}
                      </div>
                    </td>
                    
                    {/* Average Rating Column */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-700">{item.averageRating}</span>
                        <StarIcon size={18} className="text-yellow-400 fill-yellow-400" />
                      </div>
                    </td>
                    
                    {/* Total Reviews Column */}
                    <td className="px-6 py-5">
                      <div className="inline-flex py-1 px-3 bg-slate-100 text-slate-600 rounded-full font-semibold text-sm">
                        {item.totalReviews}
                      </div>
                    </td>
                    
                    {/* Sentiment Score Column */}
                    <td className="px-6 py-5">
                      <Badge variant={getSentimentTone(item.sentimentScore)} className="px-3 py-1.5 text-sm font-bold tracking-wide">
                        {item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore} 
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-16 text-center" colSpan="5">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <TrophyIcon size={48} className="mb-4 text-slate-200" />
                      <p className="text-lg font-medium text-slate-500">No ranking data available yet.</p>
                      <p className="text-sm mt-1">Once reviews are submitted, they will appear here.</p>
                    </div>
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
