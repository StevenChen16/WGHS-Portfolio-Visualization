// src/components/SpectralAnalysis.tsx
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
  ResponsiveContainer
} from 'recharts'

interface SpectralAnalysisProps {
  significantPeriods: number[];
  powerSpectrum: number[];
}

export function SpectralAnalysis({ significantPeriods, powerSpectrum }: SpectralAnalysisProps) {
  // Prepare data for chart
  const data = significantPeriods.map((period, index) => ({
    period: Math.round(period),
    power: powerSpectrum[index]
  })).sort((a, b) => a.period - b.period);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Spectral Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                label={{ 
                  value: 'Period (days)', 
                  position: 'bottom' 
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Power', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip
                formatter={(value: number) => value.toExponential(2)}
                labelFormatter={(period) => `Period: ${period} days`}
              />
              <Line 
                type="monotone" 
                dataKey="power" 
                stroke="#8884d8"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <h4 className="font-medium mb-2">Significant Cycles</h4>
          <div className="space-y-1">
            {data.map(({ period, power }, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{period} days</span>
                <span>Power: {power.toExponential(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}