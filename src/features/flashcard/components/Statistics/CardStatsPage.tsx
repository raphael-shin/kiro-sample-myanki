import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/types/flashcard';
import { CardService } from '@/services/CardService';
import { db } from '@/db/MyAnkiDB';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface CardStatsPageProps {
  deckId: number;
  deckName: string;
  onBack: () => void;
}

type TimePeriod = '1month' | '3months' | '1year';

interface ChartData {
  day: number; // -90 ~ 0
  date: string;
  easyTime: number;
  goodTime: number;
  hardTime: number;
  againTime: number;
  totalTime: number;
  cumulativeTime: number;
  cumulativeDays: number;
}

export const CardStatsPage = ({ deckId, deckName, onBack }: CardStatsPageProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3months');

  const cardService = new CardService(db);

  useEffect(() => {
    loadCards();
  }, [deckId]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const loadedCards = await cardService.getCardsByDeckId(deckId);
      setCards(loadedCards);
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  };

  // 기간별 일수 계산
  const getDaysForPeriod = (period: TimePeriod): number => {
    switch (period) {
      case '1month': return 30;
      case '3months': return 90;
      case '1year': return 365;
    }
  };

  // 차트 데이터 생성 (Recharts 형식)
  const chartData = useMemo(() => {
    const days = getDaysForPeriod(timePeriod);
    const today = new Date();
    const data: ChartData[] = [];
    let cumulativeMinutes = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 실제 데이터가 없으므로 시뮬레이션 데이터 생성
      const hasStudy = Math.random() > 0.3; // 70% 확률로 학습
      
      if (hasStudy) {
        const totalCards = Math.floor(Math.random() * 80) + 20; // 20-100장
        const totalMinutes = Math.floor(Math.random() * 400) + 100; // 100-500분
        
        const easyCards = Math.floor(totalCards * (0.3 + Math.random() * 0.3)); // 30-60%
        const goodCards = Math.floor(totalCards * (0.2 + Math.random() * 0.3)); // 20-50%
        const hardCards = Math.floor(totalCards * (0.1 + Math.random() * 0.2)); // 10-30%
        const againCards = Math.max(0, totalCards - easyCards - goodCards - hardCards);
        
        // 각 난이도별 시간 분배
        const easyTime = Math.round((easyCards / totalCards) * totalMinutes);
        const goodTime = Math.round((goodCards / totalCards) * totalMinutes);
        const hardTime = Math.round((hardCards / totalCards) * totalMinutes);
        const againTime = totalMinutes - easyTime - goodTime - hardTime;
        
        cumulativeMinutes += totalMinutes;
        
        data.push({
          day: -i,
          date: date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
          easyTime,
          goodTime,
          hardTime,
          againTime,
          totalTime: totalMinutes,
          cumulativeTime: cumulativeMinutes,
          cumulativeDays: Math.round(cumulativeMinutes / (24 * 60) * 100) / 100
        });
      } else {
        data.push({
          day: -i,
          date: date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
          easyTime: 0,
          goodTime: 0,
          hardTime: 0,
          againTime: 0,
          totalTime: 0,
          cumulativeTime: cumulativeMinutes,
          cumulativeDays: Math.round(cumulativeMinutes / (24 * 60) * 100) / 100
        });
      }
    }

    return data;
  }, [timePeriod]);

  // 요약 통계 계산
  const summaryStats = useMemo(() => {
    const totalDays = chartData.length;
    const studiedDays = chartData.filter(day => day.totalTime > 0).length;
    const totalMinutes = chartData.reduce((sum, day) => sum + day.totalTime, 0);
    const totalCards = chartData.reduce((sum, day) => 
      sum + Math.round((day.easyTime + day.goodTime + day.hardTime + day.againTime) / 5), 0); // 분당 5분 가정
    
    return {
      daysStudied: studiedDays,
      totalDays,
      studyPercentage: Math.round((studiedDays / totalDays) * 100),
      totalDaysTime: Math.round(totalMinutes / (24 * 60) * 100) / 100,
      avgMinutesStudied: studiedDays > 0 ? Math.round(totalMinutes / studiedDays) : 0,
      avgMinutesOverall: Math.round(totalMinutes / totalDays),
      avgAnswerTime: totalCards > 0 ? Math.round((totalMinutes * 60) / totalCards * 100) / 100 : 0,
      cardsPerMinute: totalMinutes > 0 ? Math.round((totalCards / totalMinutes) * 100) / 100 : 0
    };
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">통계를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">복습 통계</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{deckName} - 답변에 걸린 시간</p>
            </div>
          </div>

          {/* 옵션 */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTime}
                onChange={(e) => setShowTime(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">시간</span>
            </label>
            
            <div className="flex gap-4">
              {[
                { key: '1month' as TimePeriod, label: '1개월' },
                { key: '3months' as TimePeriod, label: '3개월' },
                { key: '1year' as TimePeriod, label: '1년' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="timePeriod"
                    checked={timePeriod === key}
                    onChange={() => setTimePeriod(key)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Recharts 차트 */}
          <div className="h-96 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  yAxisId="time"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${(value / 60).toFixed(1)}h`}
                />
                <YAxis 
                  yAxisId="cumulative"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${value.toFixed(1)}d`}
                />
                
                {/* 스택 막대 그래프 */}
                <Bar yAxisId="time" dataKey="easyTime" stackId="a" fill="#10B981" name="쉬움" />
                <Bar yAxisId="time" dataKey="goodTime" stackId="a" fill="#3B82F6" name="보통" />
                <Bar yAxisId="time" dataKey="hardTime" stackId="a" fill="#F59E0B" name="어려움" />
                <Bar yAxisId="time" dataKey="againTime" stackId="a" fill="#EF4444" name="다시" />
                
                {/* 누적 시간 라인 */}
                <Line 
                  yAxisId="cumulative"
                  type="monotone" 
                  dataKey="cumulativeDays" 
                  stroke="#6B7280" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6B7280', r: 2 }}
                  name="누적 시간"
                />
                
                <Legend />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 요약 통계 */}
          <div className="text-center space-y-2 text-gray-700 dark:text-gray-300">
            <div className="text-lg font-semibold">
              학습한 날: {summaryStats.daysStudied} / {summaryStats.totalDays} ({summaryStats.studyPercentage}%)
            </div>
            <div className="text-lg font-semibold">
              총 학습 시간: {summaryStats.totalDaysTime}일
            </div>
            <div>
              학습한 날 평균: {summaryStats.avgMinutesStudied}분/일
            </div>
            <div>
              전체 기간 평균: {summaryStats.avgMinutesOverall}분/일
            </div>
            <div>
              평균 답변 시간: {summaryStats.avgAnswerTime}초 ({summaryStats.cardsPerMinute} 카드/분)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
