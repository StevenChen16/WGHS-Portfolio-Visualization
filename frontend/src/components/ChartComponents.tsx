// src/components/ChartComponents.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar
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

interface ReturnsData {
  date: string;
  return: number;
}

interface ReturnsChartProps {
  data: ReturnsData[];
}

function isValidChartData(item: any): item is ChartData {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.date === 'string' &&
    typeof item.open === 'number' &&
    typeof item.high === 'number' &&
    typeof item.low === 'number' &&
    typeof item.close === 'number' &&
    !isNaN(item.open) &&
    !isNaN(item.high) &&
    !isNaN(item.low) &&
    !isNaN(item.close)
  );
}

function isValidReturnsData(item: any): item is ReturnsData {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.date === 'string' &&
    typeof item.return === 'number' &&
    !isNaN(item.return)
  );
}

export function PriceChart({ data }: PriceChartProps) {
  console.log('PriceChart received data:', data);

  // Basic validation
  if (!data || !Array.isArray(data)) {
    console.warn('PriceChart: Invalid data format - not an array');
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Portfolio Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Invalid data format
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validate each data point
  const validData = data.filter(isValidChartData);

  if (validData.length === 0) {
    console.warn('PriceChart: No valid data points found');
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Portfolio Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No valid data available
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('PriceChart valid data points:', validData.length);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Portfolio Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={validData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleDateString();
                  } catch (e) {
                    console.error('Date formatting error:', e);
                    return value;
                  }
                }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    try {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background p-2 border rounded shadow-sm">
                          <p>Date: {new Date(data.date).toLocaleDateString()}</p>
                          <p>Open: ${data.open.toFixed(2)}</p>
                          <p>High: ${data.high.toFixed(2)}</p>
                          <p>Low: ${data.low.toFixed(2)}</p>
                          <p>Close: ${data.close.toFixed(2)}</p>
                        </div>
                      );
                    } catch (e) {
                      console.error('Tooltip error:', e);
                      return null;
                    }
                  }
                  return null;
                }}
              />
              <Bar dataKey="high" fill="#22c55e" fillOpacity={0.3} />
              <Bar dataKey="low" fill="#ef4444" fillOpacity={0.3} />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReturnsChart({ data }: ReturnsChartProps) {
  console.log('ReturnsChart received data:', data);

  if (!data || !Array.isArray(data)) {
    console.warn('ReturnsChart: Invalid data format - not an array');
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Daily Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Invalid data format
          </div>
        </CardContent>
      </Card>
    );
  }

  const validData = data.filter(isValidReturnsData);

  if (validData.length === 0) {
    console.warn('ReturnsChart: No valid data points found');
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Daily Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No valid data available
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('ReturnsChart valid data points:', validData.length);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Daily Returns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={validData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleDateString();
                  } catch (e) {
                    console.error('Date formatting error:', e);
                    return value;
                  }
                }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tickFormatter={(value) => `${(value * 100).toFixed(2)}%`} 
              />
              <Tooltip
                formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                labelFormatter={(label) => {
                  try {
                    return `Date: ${new Date(label).toLocaleDateString()}`;
                  } catch (e) {
                    console.error('Label formatting error:', e);
                    return `Date: ${label}`;
                  }
                }}
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