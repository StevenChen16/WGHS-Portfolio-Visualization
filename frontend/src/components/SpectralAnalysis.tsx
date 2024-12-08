import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface SpectralAnalysisProps {
  significantPeriods: number[];
  powerSpectrum: number[];
}

export function SpectralAnalysis({ 
  significantPeriods, 
  powerSpectrum 
}: SpectralAnalysisProps) {
  // 直接构建周期-功率数据
  const data = significantPeriods
    .map((period, index) => ({
      period: Math.round(period), // 四舍五入到整数天
      power: powerSpectrum[index]
    }))
    .sort((a, b) => a.period - b.period); // 按周期长度排序

  console.log('Spectral data:', data);

  // 找出最大功率值用于阈值线
  const maxPower = Math.max(...data.map(d => d.power));
  const threshold = maxPower * 0.8; // 80%阈值

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Spectral Analysis - Market Cycles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151"
                opacity={0.2}
              />
              <XAxis
                dataKey="period"
                type="number"
                domain={[0, Math.max(...data.map(d => d.period)) + 5]}
                tickFormatter={(value) => `${value}d`}
                label={{
                  value: 'Cycle Length (days)',
                  position: 'bottom',
                  offset: 20
                }}
                // 保证显示所有数据点的刻度
                ticks={data.map(d => d.period)}
              />
              <YAxis
                domain={[0, maxPower * 1.1]}
                tickFormatter={(value) => value.toFixed(3)}
                label={{
                  value: 'Power',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5
                }}
              />
              <ReferenceLine 
                y={threshold} 
                stroke="#9CA3AF" 
                strokeDasharray="3 3"
                label={{
                  value: "Significance Threshold",
                  position: "right",
                  fill: "#9CA3AF"
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {data.period} Day Cycle
                          </p>
                          <p className="text-blue-500 font-medium">
                            Power: {data.power.toFixed(3)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(data.power / maxPower * 100).toFixed(1)}% of max
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="power"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{
                  stroke: '#2563eb',
                  strokeWidth: 2,
                  r: 4,
                  fill: '#ffffff'
                }}
                activeDot={{
                  stroke: '#1e40af',
                  strokeWidth: 2,
                  r: 6,
                  fill: '#3b82f6'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3 text-muted-foreground">
            Significant Market Cycles
          </h4>
          <div className="grid gap-2">
            {[...data]
              .sort((a, b) => b.power - a.power)
              .map(({ period, power }, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center text-sm bg-background/50 p-2 rounded"
                >
                  <div className="space-x-2">
                    <span className="font-medium">
                      {period} day cycle
                    </span>
                    <span className="text-muted-foreground">
                      ({(power / maxPower * 100).toFixed(1)}% strength)
                    </span>
                  </div>
                  <span className="text-blue-500 font-medium">
                    {power.toFixed(3)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}