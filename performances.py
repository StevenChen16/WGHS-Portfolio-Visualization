import requests
import json

# 您的目标URL
url = 'https://tc.xueqiu.com/tc/snowx//MONI/performances.json?gid=5487965167122713'

# 将这里的cookie_string替换为您从浏览器获取的实际Cookie字符串
cookie_string = 'cookiesu=531700509843906; device_id=b4b5d44d96687d08843d46bb5922dd50; xq_is_login=1; u=7176108717; s=br1d2svr3g; bid=dff5eeb954bd401af16be93a55cf8407_lt6e43ji; Hm_lvt_1db88642e346389874251b5a1eded6e3=1713360694; xq_a_token=6ca0f266cba5a45cf0e6084f9840d1adbb7bb803; xqat=6ca0f266cba5a45cf0e6084f9840d1adbb7bb803; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjcxNzYxMDg3MTcsImlzcyI6InVjIiwiZXhwIjoxNzE4MTM1NTU3LCJjdG0iOjE3MTU1NDM1NTc0OTcsImNpZCI6ImQ5ZDBuNEFadXAifQ.j2tSAsQbIHlh6POBfYhD_RSS_LIqMrh8elPR-zkEfRx5b4B3ikqTNVM2xBG5kfc9Fg-QSB6gqtkHC-f0shUL_t3M4Vqs2xvLOIEw_OMXQF9U-RIHG7zkKjs_shwL5UGjFQVYE8LnvAzNxGZIDpuMv30Z19_6hUmuz8aYikUfPwlhvG96NY6Zj_R36YGkrw-huaMFpboYnU4WLSwkk2TnsFFB6kcjiK715awUW1Qoc47xvfR9teX3PHiFBD40IhegufBE7mUPYTr1BkbFaeuS-hjgrJvHaVdMJY53ZL1JT_rz1GsrP8_dqLCQ4ytPzYkBOV5XV_hf1AbiYg9E8tyLMA; xq_r_token=b019698b5fdb530e7cb8c2b4742e61119e0665a5; is_overseas=1; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1715543576; acw_tc=0a099dce17155435763083291e63c4a48e1e4a567eaf5c90d39b300c4f4c80'

# 准备请求头，包括Cookie
headers = {
    'Cookie': cookie_string,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
}

# 发送GET请求
response = requests.get(url, headers=headers)
print(response)




# 处理json数据
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

data = response.json()

# 更新每个股票条目，添加sector和group标签
for performance in data['result_data']['performances']:
    for item in performance['list']:
        ticker = item['symbol']
        if ticker in classification:
            item['sector'], item['group'] = classification[ticker]
        else:
            item['sector'] = 'Unknown'
            item['group'] = 'Unknown'




# 打印响应内容，这里假设响应内容是HTML
with open('updated_performances.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)