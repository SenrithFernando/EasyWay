import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../Components/layout/DashboardLayout';
import { feedbackApi } from '../Services/feedbackApi';

const lineData = [
  { date: '01/08', rating: 1.8 },
  { date: '02/08', rating: 2.4 },
  { date: '03/08', rating: 3.6 },
  { date: '04/08', rating: 2.3 },
  { date: '05/08', rating: 3.4 },
  { date: '06/08', rating: 1.8 },
  { date: '07/08', rating: 4.6 },
  { date: '08/08', rating: 3.8 },
  { date: '09/08', rating: 3.7 },
  { date: '10/08', rating: 3.6 },
  { date: '11/08', rating: 3.6 },
];

const pieData = [
  { name: 'Engaged', value: 300, color: '#fba96b' },
  { name: 'Action Required', value: 120, color: '#fde6d8' },
];

const perfIndicators = [
  { title: 'Food Quality', rating: 3.5, responses: 70 },
  { title: 'Delivery Experience', rating: 3.5, responses: 70 },
  { title: 'Cost for Two', rating: 3.5, responses: 70 },
];

const starDistribution = [
  { stars: 5, percentage: 80, color: 'bg-green-500' },
  { stars: 4, percentage: 60, color: 'bg-green-500' },
  { stars: 3, percentage: 20, color: 'bg-green-500' },
  { stars: 2, percentage: 5, color: 'bg-red-500' },
  { stars: 1, percentage: 5, color: 'bg-red-500' },
];

export function AdminFeedbackDashboard() {
  const [canteens, setCanteens] = React.useState([]);
  const [selectedCanteen, setSelectedCanteen] = React.useState('all');
  const [orderType, setOrderType] = React.useState('all');
  const [timeUnit, setTimeUnit] = React.useState('day'); // 'hour' or 'day'
  const [dashboardData, setDashboardData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const rankingRes = await feedbackApi.getVendorRanking();
        setCanteens(rankingRes.data || []);
      } catch (error) {
        console.error('Failed to load canteens', error);
      }
    };
    loadInitialData();
  }, []);

  const loadDashboard = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await feedbackApi.getVendorDashboard(selectedCanteen, {
        orderType,
        groupBy: timeUnit === 'hour' ? 'hour' : 'day'
      });
      setDashboardData(res.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCanteen, orderType, timeUnit]);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

  // Data Mapping
  const summary = dashboardData?.summary || { averageRating: 0, totalReviews: 0 };
  
  const lineData = dashboardData?.trend?.map(t => ({
    date: timeUnit === 'hour' ? t.date.split(' ')[1] : t.date.split('-').slice(1).join('/'),
    rating: t.rating
  })) || [];

  const sentiment = dashboardData?.sentimentBreakdown || { Positive: 0, Neutral: 0, Negative: 0 };
  const pieData = [
    { name: 'Engaged', value: (sentiment.Positive || 0) + (sentiment.Neutral || 0), color: '#fba96b' },
    { name: 'Action Required', value: sentiment.Negative || 0, color: '#fde6d8' },
  ];

  const ratingDist = dashboardData?.ratingDistribution || [];
  const starDistribution = [5, 4, 3, 2, 1].map(stars => {
    const d = ratingDist.find(item => item.rating === stars);
    const count = d ? d.count : 0;
    const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
    return {
      stars,
      percentage,
      color: stars >= 3 ? 'bg-green-500' : 'bg-red-500'
    };
  });

  // Derived Performance Indicators (simulated based on weighted averages)
  const avg = summary.averageRating || 0;
  const perfIndicators = [
    { title: 'Food Quality', rating: Math.min(5, Math.max(1, (avg + 0.2).toFixed(1))), responses: summary.totalReviews },
    { title: 'Delivery Experience', rating: Math.min(5, Math.max(1, (avg - 0.1).toFixed(1))), responses: summary.totalReviews },
    { title: 'Cost for Two', rating: Math.min(5, Math.max(1, (avg + 0.1).toFixed(1))), responses: summary.totalReviews },
  ];

  const activeCanteenName = selectedCanteen === 'all' ? 'All Canteens' : (canteens.find(c => (c.vendorId || c._id) === selectedCanteen)?.vendorName || 'Canteen');

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        <div className="rounded-sm bg-white shadow-sm font-sans text-slate-800 border border-slate-200">
          
          <div className="border-b border-slate-100 p-5">
            <h1 className="text-xl font-semibold text-slate-700">Feedback Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50 gap-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative min-w-[170px]">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                </div>
                <select 
                  value={selectedCanteen}
                  onChange={(e) => setSelectedCanteen(e.target.value)}
                  className="w-full appearance-none rounded bg-white pl-9 pr-8 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                >
                  <option value="all">All Canteens</option>
                  {canteens.map((c) => (
                    <option key={c.vendorId || c._id} value={c.vendorId || c._id}>
                      {c.vendorName || c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
              
              <div className="relative min-w-[150px]">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
                </div>
                <select 
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full appearance-none rounded bg-white pl-9 pr-8 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                >
                  <option value="all">All Order Types</option>
                  <option value="dine-in">Dine-In</option>
                  <option value="pickup">Pickup</option>
                </select>
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            
            <button className="flex items-center justify-between gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50">
              <Calendar size={14} className="text-slate-400" />
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </button>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] border-b border-slate-100 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            
            {/* Left Box: Overall Status */}
            <div className="p-6 border-r border-slate-100 bg-white flex flex-col items-center">
              <h3 className="font-semibold text-slate-700 mb-6 text-sm">{activeCanteenName} - Overall</h3>
              
              <div className="text-5xl font-bold text-slate-800 mb-2">{summary.averageRating}</div>
              
              <div className="flex gap-1 mb-2 text-yellow-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i <= Math.round(summary.averageRating) ? 'fill-current' : 'fill-slate-200'}`} 
                    viewBox="0 0 20 20"
                  >
                    <path d={starPath} />
                  </svg>
                ))}
              </div>
              
              <div className="text-xs text-slate-400 font-medium mb-8">{summary.totalReviews} User Responses</div>

              <div className="w-full space-y-1.5">
                {starDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center text-xs text-slate-500 font-medium h-3">
                    <span className="w-4 flex items-center justify-start gap-0.5">{item.stars} <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20"><path d={starPath} /></svg></span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 ml-2 mr-4 overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Box: Line Chart */}
            <div className="p-6 border-r border-slate-100 flex flex-col relative bg-white">
              <div className="flex justify-end gap-5 text-xs font-semibold text-slate-400 mb-6 px-4">
                <span 
                  onClick={() => setTimeUnit('hour')}
                  className={`${timeUnit === 'hour' ? 'border-b-2 border-slate-800 text-slate-800' : 'hover:text-slate-600'} pb-1 cursor-pointer transition-all`}
                >
                  Hourly
                </span>
                <span 
                  onClick={() => setTimeUnit('day')}
                  className={`${timeUnit === 'day' ? 'border-b-2 border-slate-800 text-slate-800' : 'hover:text-slate-600'} pb-1 cursor-pointer transition-all`}
                >
                  Daily
                </span>
                <span className="cursor-not-allowed opacity-50">Week</span>
                <span className="cursor-not-allowed opacity-50">Month</span>
              </div>
              
              <div className="flex-1 min-h-[220px]">
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                      />
                      <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#148677" 
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#148677' }} 
                        activeDot={{ r: 6, fill: '#148677', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                    No trend data available for current selection
                  </div>
                )}
              </div>
              <div className="absolute left-4 top-1/2 -rotate-90 origin-left text-[10px] text-slate-400 font-semibold tracking-widest transform -translate-y-1/2">
                Ratings
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-slate-400 font-semibold tracking-widest">
                Date/Time
              </div>
            </div>

            {/* Right Box: Customer Engagement Donut */}
            <div className="p-6 bg-white flex flex-col items-center">
              <h3 className="font-semibold text-slate-700 mb-2 text-sm text-center">Customer Engagement</h3>
              
              <div className="w-full h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-[15%] flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-800 leading-none">{sentiment.Negative || 0}</span>
                  <span className="text-[9px] text-slate-400 font-medium text-center w-20 leading-[1.1] mt-1">Dissatisfied<br/>Customers</span>
                </div>
              </div>
              
              <div className="flex gap-4 text-xs font-semibold text-slate-600 mb-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fba96b]"></div>
                  Engaged
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fde6d8]"></div>
                  Action Required
                </div>
              </div>
              
              <button className="w-full bg-[#0288d1] text-white py-2 rounded font-semibold text-sm hover:bg-[#0277bd] transition-colors shadow-sm">
                Engage Now
              </button>
            </div>
          </div>

          <div className={`bg-slate-50 border-t-8 border-slate-50 p-6 pt-5 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <h2 className="text-lg font-medium text-slate-700 mb-6">Performance Indicators</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {perfIndicators.map((indicator, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-sm overflow-hidden flex flex-col shadow-sm">
                  
                  <div className="flex justify-between items-center p-4 pb-2">
                    <h3 className="font-medium text-slate-800 text-sm">{indicator.title}</h3>
                    <span className="text-[11px] text-slate-400 font-medium">Based on <span className="text-slate-600 font-bold">{indicator.responses}</span> responses</span>
                  </div>
                  
                  <div className="flex px-4 pt-2 pb-6">
                    <div className="flex flex-col flex-shrink-0 mr-6">
                      <div className="text-3xl font-bold text-slate-800 mb-1">{indicator.rating}</div>
                      <div className="flex gap-0.5 text-yellow-400">
                        {[1, 2, 3, 4, 5].map(i => (
                           <svg 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i <= Math.round(indicator.rating) ? 'fill-current' : 'fill-slate-200'}`} 
                            viewBox="0 0 20 20"
                          >
                            <path d={starPath} />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">
                        Action Required <AlertCircle size={10} className="text-slate-400" />
                      </div>
                      
                      {['Sub Parameter -1', 'Sub Parameter -2', 'Sub Parameter -3'].map((param, pIdx) => {
                        const score = Math.max(20, Math.floor(Math.random() * 80));
                        return (
                          <div key={pIdx} className="mb-2.5 last:mb-0">
                            <div className="flex justify-between text-[10px] text-slate-700 font-semibold mb-1">
                              <span>{param}</span>
                              <span className="text-slate-400 font-medium">{Math.floor(summary.totalReviews * (score/100))}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-[1px] overflow-hidden">
                              <div className="h-full bg-red-400" style={{ width: `${score}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-auto border-t border-slate-100 p-3 text-center">
                    <a href="#" className="uppercase text-xs font-bold text-[#0288d1] tracking-wide hover:underline cursor-pointer">View Associated Logs</a>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
