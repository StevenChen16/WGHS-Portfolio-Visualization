// src/App.tsx
import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { PortfolioInput } from '@/components/PortfolioInput'
import { SpectralAnalysis } from '@/components/SpectralAnalysis'
import { PriceChart, ReturnsChart } from '@/components/ChartComponents'
import { Loader2 } from "lucide-react"

interface HistoricalData {
  candlestick: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  returns: {
    date: string;
    return: number;
  }[];
  riskMetrics: {
    diversificationEffect: number;
    treynorRatio: number;
    informationRatio: number;
    modifiedVaR: number;
    omegaRatio: number;
  };
}

interface PortfolioMetrics {
  historical: HistoricalData;
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

function ErrorFallback({error, resetErrorBoundary}: {error: Error; resetErrorBoundary: () => void}) {
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
      <p className="font-bold">Something went wrong:</p>
      <pre className="mt-2">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  )
}

function App() {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateMetricsData = (data: any): data is PortfolioMetrics => {
    console.log('Validating metrics data:', data);
    
    if (!data) {
      console.error('Data is null or undefined');
      return false;
    }
    
    // Validate historical data
    if (!data.historical) {
      console.error('Missing historical data');
      return false;
    }
    
    // Validate candlestick data
    if (!Array.isArray(data.historical.candlestick)) {
      console.error('Invalid or missing candlestick data:', data.historical.candlestick);
      return false;
    }
    
    // Validate returns data
    if (!Array.isArray(data.historical.returns)) {
      console.error('Invalid or missing returns data:', data.historical.returns);
      return false;
    }
    
    // Validate risk metrics
    if (!data.historical.riskMetrics) {
      console.error('Missing risk metrics:', data.historical.riskMetrics);
      return false;
    }

    // Validate required fields in risk metrics
    const requiredRiskMetrics = [
      'diversificationEffect',
      'treynorRatio',
      'informationRatio',
      'modifiedVaR',
      'omegaRatio'
    ];

    const missingRiskMetrics = requiredRiskMetrics.filter(
      metric => typeof data.historical.riskMetrics[metric] !== 'number'
    );

    if (missingRiskMetrics.length > 0) {
      console.error('Missing or invalid risk metrics:', missingRiskMetrics);
      return false;
    }

    // Basic validation of other required objects
    if (!data.returns || !data.risk || !data.market || !data.distribution || !data.spectral) {
      console.error('Missing required metric objects:', {
        returns: !!data.returns,
        risk: !!data.risk,
        market: !!data.market,
        distribution: !!data.distribution,
        spectral: !!data.spectral
      });
      return false;
    }

    console.log('Data validation passed');
    return true;
  };

  const analyzePortfolio = async (holdings: any[]) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending holdings:', holdings);
      const response = await fetch('http://localhost:8001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ holdings }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }
      
      const data = await response.json();
      console.log('Raw response data:', data);
      
      if (!validateMetricsData(data)) {
        throw new Error('Invalid data structure received from server');
      }
      
      setMetrics(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8">Portfolio Analytics</h1>
        
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={resetError}>
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
              {/* Charts */}
              {metrics.historical?.candlestick && (
                <PriceChart data={metrics.historical.candlestick} />
              )}
              {metrics.historical?.returns && (
                <ReturnsChart data={metrics.historical.returns} />
              )}
              
              {/* Risk Metrics Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metrics.historical?.riskMetrics && (
                    <>
                      <MetricRow 
                        label="Diversification Effect" 
                        value={metrics.historical.riskMetrics.diversificationEffect} 
                      />
                      <MetricRow 
                        label="Treynor Ratio" 
                        value={metrics.historical.riskMetrics.treynorRatio} 
                      />
                      <MetricRow 
                        label="Information Ratio" 
                        value={metrics.historical.riskMetrics.informationRatio} 
                      />
                      <MetricRow 
                        label="Modified VaR" 
                        value={metrics.historical.riskMetrics.modifiedVaR} 
                      />
                      <MetricRow 
                        label="Omega Ratio" 
                        value={metrics.historical.riskMetrics.omegaRatio} 
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Main Metrics Grid */}
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
                historical={metrics.historical}
              />
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App