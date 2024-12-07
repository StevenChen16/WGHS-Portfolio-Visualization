def calculate_portfolio_history(portfolio_data: Dict, start_date: datetime, end_date: datetime) -> Dict:
    """Calculate portfolio historical prices and returns"""
    # 获取每个股票的价格数据
    all_prices = pd.DataFrame()
    for ticker, data in portfolio_data.items():
        hist = data['data']
        weighted_price = hist['Close'] * data['weight']
        all_prices[ticker] = weighted_price
    
    # 计算组合价格
    portfolio_prices = all_prices.sum(axis=1)
    
    # 准备K线数据
    ohlc = pd.DataFrame()
    ohlc['date'] = portfolio_prices.index
    # 由于是组合价格，我们用移动窗口创建OHLC数据
    window_size = 5  # 5天窗口
    ohlc['open'] = portfolio_prices.rolling(window=window_size).first()
    ohlc['high'] = portfolio_prices.rolling(window=window_size).max()
    ohlc['low'] = portfolio_prices.rolling(window=window_size).min()
    ohlc['close'] = portfolio_prices.rolling(window=window_size).last()
    
    # 计算每日收益率
    daily_returns = portfolio_prices.pct_change()
    returns_data = pd.DataFrame({
        'date': daily_returns.index,
        'return': daily_returns.values
    })
    
    # 计算附加风险指标
    risk_metrics = {
        # 从您提供的代码中计算
        'riskDecomposition': calculate_risk_metrics(current_weights, full_cov)[0].tolist(),
        'diversificationEffect': calculate_risk_metrics(current_weights, full_cov)[1],
        'valueatrisk': calculate_var(current_weights[:len(stock_returns.columns)], stock_returns),
        'beta': calculate_beta(price_data)[1],
        
        # 添加其他风险指标
        'treynorRatio': (annual_return - rf_rate) / beta if beta != 0 else 0.0,
        'informationRatio': alpha / tracking_error if tracking_error != 0 else 0.0,
        'modifiedVaR': var_95 + (skewness/6 * var_95**2 + (kurtosis-3)/24 * var_95**3),
        'omegaRatio': positive_returns.mean() / abs(negative_returns.mean()) if len(negative_returns) > 0 else float('inf'),
    }
    
    return {
        'candlestick': ohlc.to_dict('records'),
        'returns': returns_data.to_dict('records'),
        'riskMetrics': risk_metrics
    }

@app.post("/api/analyze")
async def analyze_portfolio(request: PortfolioRequest):
    try:
        # ... 之前的代码 ...
        
        # 添加历史数据和额外风险指标
        historical_data = calculate_portfolio_history(portfolio_data)
        
        return {
            **metrics,  # 原有的指标
            'historical': historical_data,  # 新增历史数据
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

