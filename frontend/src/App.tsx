// src/App.tsx
import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { PortfolioInput } from '@/components/PortfolioInput'
import { SpectralAnalysis } from '@/components/SpectralAnalysis'
import { Loader2 } from "lucide-react"

interface PortfolioMetrics {
  returns: {
    cagr: number;
    annualReturn: number;
    bestYear: number;
    worstYear: number;
  };
  risk: {
    standardDev: number;
    maxDrawdown: number;
    sharpeRatio: number;
    varFivePercent: number;
    cvarFivePercent: number;
  };
  market: {
    alpha: number;
    beta: number;
    correlation: number;
    upCapture: number;
    downCapture: number;
  };
  distribution: {
    skewness: number;
    kurtosis: number;
  };
  spectral: {
    significantPeriods: number[];
    powerSpectrum: number[];
  };
}

function MetricRow({ label, value, format = 'percent' }: { 
  label: string; 
  value: number; 
  format?: 'percent' | 'decimal' | 'ratio' 
}) {
  const formatValue = (val: number) => {
    if (format === 'percent') {
      return `${val.toFixed(2)}%`;
    } else if (format === 'decimal') {
      return val.toFixed(2);
    } else {
      return val.toFixed(2);
    }
  };

  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatValue(value)}</span>
    </div>
  );
}

function App() {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePortfolio = async (holdings: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ holdings }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Analysis failed');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8">Portfolio Analytics</h1>
        
        {/* Portfolio Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Portfolio Input</CardTitle>
            <CardDescription>Add your portfolio holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioInput onSubmit={analyzePortfolio} />
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Analyzing portfolio...</span>
          </div>
        )}

        {/* Analysis Results */}
        {metrics && !loading && (
          <div className="space-y-8">
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Returns Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Returns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <MetricRow label="CAGR" value={metrics.returns.cagr} />
                  <MetricRow label="Annual Return" value={metrics.returns.annualReturn} />
                  <MetricRow label="Best Year" value={metrics.returns.bestYear} />
                  <MetricRow label="Worst Year" value={metrics.returns.worstYear} />
                </CardContent>
              </Card>

              {/* Risk Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <MetricRow label="Standard Deviation" value={metrics.risk.standardDev} />
                  <MetricRow label="Max Drawdown" value={metrics.risk.maxDrawdown} />
                  <MetricRow label="Sharpe Ratio" value={metrics.risk.sharpeRatio} format="decimal" />
                  <MetricRow label="VaR (5%)" value={metrics.risk.varFivePercent} />
                  <MetricRow label="CVaR (5%)" value={metrics.risk.cvarFivePercent} />
                </CardContent>
              </Card>

              {/* Market Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <MetricRow label="Alpha" value={metrics.market.alpha} />
                  <MetricRow label="Beta" value={metrics.market.beta} format="decimal" />
                  <MetricRow label="Correlation" value={metrics.market.correlation} format="decimal" />
                  <MetricRow label="Up Capture" value={metrics.market.upCapture} />
                  <MetricRow label="Down Capture" value={metrics.market.downCapture} />
                </CardContent>
              </Card>

              {/* Distribution Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribution Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <MetricRow label="Skewness" value={metrics.distribution.skewness} format="decimal" />
                  <MetricRow label="Kurtosis" value={metrics.distribution.kurtosis} format="decimal" />
                </CardContent>
              </Card>
            </div>

            {/* Spectral Analysis */}
            <SpectralAnalysis 
              significantPeriods={metrics.spectral.significantPeriods}
              powerSpectrum={metrics.spectral.powerSpectrum}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App