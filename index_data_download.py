import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import json

# 设置时间范围为6个月前到今天
end_date = datetime.now().strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
# print(end_date)

indexes = {
    "^GSPC": "S&P500",
    "^DJI": "DowJonesIndustrial",
    "^IXIC": "NASDAQ",
    "^RUT": "Russell_2000",
    "^VIX": "VIX",
    "^TNX": "10-Year US Treasury Note Yield",
    "^FVX": "5-Year US Treasury Note Yield",
    "000001.ss": "SSE Composite Index",
    "000300.ss": "SZSE Composite Index",
    }

index = '000300.ss'

# 下载标普500指数数据
data = yf.download(index, start=start_date, end=end_date)

# 计算每天的涨幅
data['pct_change'] = (data['Close'] - data.iloc[0]['Close']) / data.iloc[0]['Close']

# 将涨幅转换为百分比格式
data['pct_change'] = data['pct_change'].apply(lambda x: f"{x:.2%}")

# 将日期转换为字符串格式
data.index = data.index.strftime("%Y-%m-%d")

# 选择需要输出的列
output_data = data[['Close', 'pct_change']]
# print(output_data.tail(10))

# 将数据转换为JSON格式
json_data = output_data.to_json(orient="index")
# print(json_data)

# 将JSON数据保存到文件
with open('{}_data.json'.format(indexes[index]), 'w') as file:
    file.write(json_data)

print("数据已保存到 {}_data.json 文件中。".format(indexes[index]))