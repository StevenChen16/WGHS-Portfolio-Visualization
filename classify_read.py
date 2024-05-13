import json

# classification字典
# 需根据自己的柚子组合进行修改。这里仅作示范。
classification = {
    'DLR': ('Real Estate', 'Short-term'),
    'SHY': ('Fixed Income', 'Short-term'),
    'TLT': ('Fixed Income', 'Short-term'),
    'HYG': ('Fixed Income', 'Short-term'),
    'UNH': ('Health Care', 'Intermediate'),
    'NVO': ('Health Care', 'Intermediate'),
    'V': ('Financials', 'Intermediate'),
    'MCO': ('Financials', 'Intermediate'),
    'AAPL': ('Information Technology', 'Long-term'),
    'AMZN': ('Consumer Discretionary', 'Long-term'),
    'LULU': ('Consumer Discretionary', 'Long-term'),
    'LVMHF': ('Consumer Discretionary', 'Long-term'),
    'AMD': ('Information Technology', 'Long-term'),
    'NVDA': ('Information Technology', 'Long-term'),
    'MSFT': ('Information Technology', 'Long-term'),
    'META': ('Communication Services', 'Long-term'),
    'GOOG': ('Communication Services', 'Long-term'),
    'BA': ('Industrials', 'Long-term'),
    'BZLFY': ('Industrials', 'Long-term'),
    'VNQ': ('Real Estate', 'Long-term'),
    'EWZ': ('Real Estate', 'Long-term'),
}

# 载入performances.json数据
with open('performances.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 更新每个股票条目，添加sector和group标签
for performance in data['result_data']['performances']:
    for item in performance['list']:
        ticker = item['symbol']
        if ticker in classification:
            item['sector'], item['group'] = classification[ticker]
        else:
            item['sector'] = 'Unknown'
            item['group'] = 'Unknown'

# 将更新后的数据保存回新的JSON文件
with open('updated_performances.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("JSON file updated successfully with sectors and groups.")
