// src/components/ChartComponents.tsx
import React from 'react';
import {
  LineChart,
  Line,
  CandlestickChart,
  Candlestick,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceChartProps {
  data: ChartData[];
}

export function PriceChart({ data }: PriceChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Portfolio Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <CandlestickChart data={data}>
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background p-2 border rounded shadow-sm">
                        <p>Date: {data.date}</p>
                        <p>Open: ${data.open.toFixed(2)}</p>
                        <p>High: ${data.high.toFixed(2)}</p>
                        <p>Low: ${data.low.toFixed(2)}</p>
                        <p>Close: ${data.close.toFixed(2)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Candlestick
                fill="#ef4444"
                stroke="#ef4444"
                wickStroke="#ef4444"
                yAccessor={(data) => [data.open, data.high, data.low, data.close]}
              />
            </CandlestickChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface ReturnsData {
  date: string;
  return: number;
}

interface ReturnsChartProps {
  data: ReturnsData[];
}

export function ReturnsChart({ data }: ReturnsChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Daily Returns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `${(value * 100).toFixed(2)}%`} />
              <Tooltip
                formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="linear"
                dataKey="return"
                stroke="#3b82f6"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}