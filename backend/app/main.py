import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from scipy import stats
from scipy.fft import fft, fftfreq
import json
from typing import Dict, List, Union, Any
import logging
import traceback

# 设置文件日志
LOG_FILE = "portfolio_analysis.log"
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def log_debug(message):
    """Direct file logging function"""
    with open(LOG_FILE, "a") as f:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"{timestamp} - {message}\n")
    print(message, file=sys.stderr)
    sys.stderr.flush()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    log_debug("Application starting up")

class Holding(BaseModel):
    ticker: str
    value: float
    weight: float

class PortfolioRequest(BaseModel):
    holdings: List[Holding]

def safe_float(value):
    """Handle infinite and NaN values"""
    if pd.isna(value) or np.isinf(value):
        return 0.0
    return float(value)

def calculate_portfolio_returns(portfolio_data: Dict) -> pd.Series:
    """Calculate weighted portfolio returns"""
    log_debug("Calculating portfolio returns")
    returns = []
    weights = []
    
    for ticker, data in portfolio_data.items():
        daily_returns = data['data']['Close'].pct_change()
        returns.append(daily_returns)
        weights.append(data['weight'])
    
    returns_df = pd.concat(returns, axis=1)
    portfolio_returns = returns_df.multiply(weights, axis=1).sum(axis=1)
    log_debug(f"Portfolio returns calculated, length: {len(portfolio_returns)}")
    
    return portfolio_returns

def calculate_market_returns(start_date: datetime, end_date: datetime) -> pd.Series:
    """Get market (S&P 500) returns for the same period"""
    log_debug("Downloading market data")
    market_data = yf.download('^GSPC', start=start_date, end=end_date)
    market_returns = market_data['Close'].pct_change()
    log_debug(f"Market returns calculated, length: {len(market_returns)}")
    return market_returns

def calculate_metrics(portfolio_returns: pd.Series, market_returns: pd.Series) -> Dict:
    """Calculate all portfolio metrics with safety checks"""
    log_debug("Calculating metrics")
    try:
        # Basic return metrics
        annual_return = safe_float(portfolio_returns.mean() * 252)
        annual_std = safe_float(portfolio_returns.std() * np.sqrt(252))
        
        # Calculate CAGR
        total_return = (1 + portfolio_returns).prod()
        n_years = len(portfolio_returns) / 252
        cagr = safe_float((total_return ** (1/n_years)) - 1) if total_return > 0 else 0.0
        
        # Calculate drawdown
        cum_returns = (1 + portfolio_returns).cumprod()
        rolling_max = cum_returns.expanding().max()
        drawdowns = cum_returns/rolling_max - 1
        max_drawdown = safe_float(drawdowns.min())
        
        # Risk free rate (using 3% as assumption)
        rf_rate = 0.03
        daily_rf = (1 + rf_rate) ** (1/252) - 1
        
        # Risk metrics
        excess_returns = portfolio_returns - daily_rf
        sharpe_ratio = safe_float(
            np.sqrt(252) * excess_returns.mean() / excess_returns.std() 
            if excess_returns.std() != 0 else 0.0
        )
        
        # Market metrics
        covariance = np.cov(portfolio_returns, market_returns)[0,1]
        market_variance = np.var(market_returns)
        beta = safe_float(covariance / market_variance if market_variance != 0 else 1.0)
        alpha = safe_float(annual_return - (rf_rate + beta * (market_returns.mean() * 252 - rf_rate)))
        correlation = safe_float(portfolio_returns.corr(market_returns))
        
        # Up/Down market capture
        up_market = market_returns > 0
        down_market = market_returns < 0
        up_capture = safe_float(
            (portfolio_returns[up_market].mean() / market_returns[up_market].mean() * 100)
            if len(up_market) > 0 and market_returns[up_market].mean() != 0 
            else 0.0
        )
        down_capture = safe_float(
            (portfolio_returns[down_market].mean() / market_returns[down_market].mean() * 100)
            if len(down_market) > 0 and market_returns[down_market].mean() != 0 
            else 0.0
        )
        
        # Distribution metrics
        skewness = safe_float(stats.skew(portfolio_returns))
        kurtosis = safe_float(stats.kurtosis(portfolio_returns))
        
        # Value at Risk
        var_95 = safe_float(np.percentile(portfolio_returns, 5))
        cvar_95 = safe_float(portfolio_returns[portfolio_returns <= var_95].mean())
        
        metrics = {
            "returns": {
                "cagr": cagr * 100,
                "annualReturn": annual_return * 100,
                "bestYear": safe_float(portfolio_returns.max() * 100),
                "worstYear": safe_float(portfolio_returns.min() * 100)
            },
            "risk": {
                "standardDev": annual_std * 100,
                "maxDrawdown": max_drawdown * 100,
                "sharpeRatio": sharpe_ratio,
                "varFivePercent": var_95 * 100,
                "cvarFivePercent": cvar_95 * 100
            },
            "market": {
                "alpha": alpha * 100,
                "beta": beta,
                "correlation": correlation,
                "upCapture": up_capture,
                "downCapture": down_capture
            },
            "distribution": {
                "skewness": skewness,
                "kurtosis": kurtosis
            }
        }
        log_debug("Metrics calculation completed")
        return metrics
    except Exception as e:
        error_msg = f"Error in calculate_metrics: {str(e)}\n{traceback.format_exc()}"
        log_debug(error_msg)
        raise

def perform_spectral_analysis(returns: pd.Series) -> Dict:
    """Perform Fourier analysis on returns with improved formatting"""
    log_debug("Performing spectral analysis")
    try:
        # 执行FFT
        fft_result = fft(returns.values)
        freqs = fftfreq(len(returns))
        
        # 计算功率谱
        power_spectrum = np.abs(fft_result)**2
        
        # 只考虑正频率部分
        mask = freqs > 0
        positive_freqs = freqs[mask]
        positive_power = power_spectrum[mask]
        
        # 将频率转换为周期（天数）
        periods = 1/positive_freqs
        
        # 找出最显著的5个周期
        # 按功率排序，取前5个
        significant_indices = np.argsort(positive_power)[-5:][::-1]  # 反转以获得降序
        significant_periods = periods[significant_indices]
        significant_powers = positive_power[significant_indices]
        
        # 规范化功率值到[0,1]范围
        max_power = np.max(significant_powers)
        normalized_powers = significant_powers / max_power if max_power != 0 else significant_powers
        
        # 将周期四舍五入到整数天
        rounded_periods = np.round(significant_periods).astype(int)
        
        # 构建结果
        cycles = []
        for period, power in zip(rounded_periods, normalized_powers):
            # 限制周期范围在1-365天之间
            if 1 <= period <= 365:
                cycles.append({
                    "period": int(period),
                    "power": float(power)
                })
        
        # 按周期长度排序
        cycles.sort(key=lambda x: x["period"])
        
        result = {
            "significantPeriods": [cycle["period"] for cycle in cycles],
            "powerSpectrum": [cycle["power"] for cycle in cycles]
        }
        
        log_debug(f"Spectral analysis completed. Found {len(cycles)} significant cycles")
        return result
    except Exception as e:
        error_msg = f"Error in spectral analysis: {str(e)}\n{traceback.format_exc()}"
        log_debug(error_msg)
        raise

def calculate_portfolio_history(holdings_data: Dict) -> Dict:
    """Calculate portfolio historical data"""
    log_debug("Calculating portfolio history")
    try:
        portfolio_prices = None
        for ticker, holding in holdings_data.items():
            price_series = holding['data']['Close'] * (holding['weight'])
            if portfolio_prices is None:
                portfolio_prices = price_series
            else:
                portfolio_prices = portfolio_prices.add(price_series, fill_value=0)
        
        candlestick_data = []
        dates = portfolio_prices.index.strftime('%Y-%m-%d').tolist()
        
        for i in range(0, len(portfolio_prices), 5):
            end_idx = min(i + 5, len(portfolio_prices))
            chunk = portfolio_prices[i:end_idx]
            if not chunk.empty:
                candlestick_data.append({
                    'date': dates[i],
                    'open': float(chunk.iloc[0]),
                    'high': float(chunk.max()),
                    'low': float(chunk.min()),
                    'close': float(chunk.iloc[-1])
                })
        
        daily_returns = portfolio_prices.pct_change().fillna(0)
        returns_data = [
            {'date': date, 'return': float(ret)} 
            for date, ret in zip(dates, daily_returns)
        ]
        
        risk_metrics = calculate_additional_risk_metrics(daily_returns)
        
        result = {
            'candlestick': candlestick_data,
            'returns': returns_data,
            'riskMetrics': risk_metrics
        }
        log_debug(f"Portfolio history calculated, keys: {list(result.keys())}")
        return result
    except Exception as e:
        error_msg = f"Error calculating portfolio history: {str(e)}\n{traceback.format_exc()}"
        log_debug(error_msg)
        raise

def calculate_additional_risk_metrics(returns: pd.Series) -> dict:
    """Calculate additional risk metrics"""
    log_debug("Calculating additional risk metrics")
    try:
        portfolio_variance = returns.var()
        
        diversification_effect = safe_float(
            1 - (portfolio_variance / returns.var()) if returns.var() != 0 else 0.0
        )
        
        excess_returns = returns - 0.03/252
        treynor_ratio = safe_float(
            excess_returns.mean() / portfolio_variance if portfolio_variance != 0 else 0.0
        )
        
        benchmark_returns = returns.shift(1)
        tracking_error = (returns - benchmark_returns).std()
        information_ratio = safe_float(
            returns.mean() / tracking_error if tracking_error != 0 else 0.0
        )
        
        z_score = stats.norm.ppf(0.05)
        skewness = stats.skew(returns)
        kurtosis = stats.kurtosis(returns)
        modified_var = safe_float(
            -(returns.mean() + z_score * returns.std() * 
              (1 + (skewness * (z_score**2 - 1))/6 + 
               (kurtosis * (z_score**3 - 3*z_score))/24))
        )
        
        threshold = 0
        omega_ratio = safe_float(
            len(returns[returns > threshold]) / len(returns[returns <= threshold])
            if len(returns[returns <= threshold]) > 0 else 1.0
        )
        
        result = {
            'diversificationEffect': diversification_effect * 100,
            'treynorRatio': treynor_ratio * 100,
            'informationRatio': information_ratio,
            'modifiedVaR': modified_var * 100,
            'omegaRatio': omega_ratio
        }
        log_debug("Additional risk metrics calculated")
        return result
    except Exception as e:
        error_msg = f"Error calculating additional risk metrics: {str(e)}\n{traceback.format_exc()}"
        log_debug(error_msg)
        return {
            'diversificationEffect': 0.0,
            'treynorRatio': 0.0,
            'informationRatio': 0.0,
            'modifiedVaR': 0.0,
            'omegaRatio': 1.0
        }

@app.get("/api/debug")
async def debug_test():
    log_debug("Debug endpoint called")
    try:
        with open(LOG_FILE, "a") as f:
            f.write("Debug test successful\n")
        return {"status": "debug test successful", "log_file": os.path.abspath(LOG_FILE)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/health")
async def health_check():
    log_debug("Health check called")
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze_portfolio(request: PortfolioRequest):
    try:
        log_debug("Starting portfolio analysis")
        log_debug(f"Received request with {len(request.holdings)} holdings")
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365*3)
        
        portfolio_data = {}
        for holding in request.holdings:
            try:
                log_debug(f"Downloading data for {holding.ticker}")
                data = yf.download(holding.ticker, start=start_date, end=end_date)
                if data.empty:
                    raise HTTPException(
                        status_code=400,
                        detail=f"No data available for ticker {holding.ticker}"
                    )
                portfolio_data[holding.ticker] = {
                    'data': data,
                    'weight': holding.weight / 100
                }
                log_debug(f"Successfully downloaded data for {holding.ticker}")
            except Exception as e:
                error_msg = f"Error downloading data for {holding.ticker}: {str(e)}"
                log_debug(error_msg)
                raise HTTPException(
                    status_code=400,
                    detail=error_msg
                )

        log_debug("Calculating portfolio returns")
        portfolio_returns = calculate_portfolio_returns(portfolio_data)
        
        log_debug("Calculating market returns")
        market_returns = calculate_market_returns(start_date, end_date)
        
        log_debug("Calculating main metrics")
        metrics = calculate_metrics(portfolio_returns, market_returns)
        
        log_debug("Calculating historical data")
        historical_data = calculate_portfolio_history(portfolio_data)
        log_debug(f"Historical data keys: {list(historical_data.keys())}")
        
        log_debug("Performing spectral analysis")
        spectral_data = perform_spectral_analysis(portfolio_returns)

        # 构建最终返回结果
        result = {
            'returns': metrics['returns'],
            'risk': metrics['risk'],
            'market': metrics['market'],
            'distribution': metrics['distribution'],
            'spectral': spectral_data,
            'historical': {
                'candlestick': historical_data['candlestick'],
                'returns': historical_data['returns'],
                'riskMetrics': historical_data['riskMetrics']
            }
        }

        # 验证数据完整性
        log_debug(f"Final result keys: {list(result.keys())}")
        log_debug(f"Historical data present: {'historical' in result}")
        if 'historical' in result:
            log_debug(f"Historical data structure: {list(result['historical'].keys())}")

        # 保存结果到文件以便调试
        try:
            with open('analysis_result.json', 'w') as f:
                json.dump(result, f, indent=2, default=str)
            log_debug("Saved result to analysis_result.json")
        except Exception as e:
            log_debug(f"Failed to save result to file: {str(e)}")

        # 验证数据结构完整性
        required_fields = [
            'returns', 'risk', 'market', 'distribution', 'spectral', 'historical'
        ]
        historical_fields = ['candlestick', 'returns', 'riskMetrics']
        
        missing_fields = [f for f in required_fields if f not in result]
        if missing_fields:
            error_msg = f"Missing required fields: {missing_fields}"
            log_debug(error_msg)
            raise ValueError(error_msg)
            
        missing_historical = [f for f in historical_fields if f not in result['historical']]
        if missing_historical:
            error_msg = f"Missing historical fields: {missing_historical}"
            log_debug(error_msg)
            raise ValueError(error_msg)
        
        log_debug("Validation passed, returning result")
        return result
        
    except Exception as e:
        error_msg = f"Analysis failed with error: {str(e)}\n{traceback.format_exc()}"
        log_debug(error_msg)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)