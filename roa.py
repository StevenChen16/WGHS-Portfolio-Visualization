import requests

# 您的目标URL
url = 'https://tc.xueqiu.com/tc/snowx/MONI/forchart/roa.json?gid=5487965167122713&period=6m&market=ALL'

# 将这里的cookie_string替换为您从浏览器获取的实际Cookie字符串
cookie_string = 'cookiesu=531700509843906; device_id=b4b5d44d96687d08843d46bb5922dd50; xq_is_login=1; u=7176108717; s=br1d2svr3g; bid=dff5eeb954bd401af16be93a55cf8407_lt6e43ji; __utma=1.183585939.1709160644.1709160644.1709160644.1; __utmz=1.1709160644.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); acw_tc=2760779e17116390933978824ec133e1e41ec8748818b849290246478c4cc4; xq_a_token=d8c7dd9acb3e20143b9c2c0dc4520cac6b1e4a3d; xqat=d8c7dd9acb3e20143b9c2c0dc4520cac6b1e4a3d; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjcxNzYxMDg3MTcsImlzcyI6InVjIiwiZXhwIjoxNzE0MjMxMDkzLCJjdG0iOjE3MTE2MzkwOTM0NjQsImNpZCI6ImQ5ZDBuNEFadXAifQ.SfalTA2GrQAsieZidDL7G9LtK70AnwjqGXtGyjGtcGxtrJjIlqEwyV4dnvMzzat9UiIM7Sq6-ssqD1aq5L4PYCJIHBGZiye8wDEyYOvoKcskEQ4P9LB-fFqX8772nJCu-As-IbWbr_rV4Qvf6X1vZJ0hX0K5a951Oy9ZMZIg6VXBRRzd_bK9lIOyMcbne0Te30ye8Cw_sHbg-ZgPumveRn9i_0Q64qA-kAIqBOasXTpCRX7b-x9YO1uy45eu2ZxeyYlqF57U5hBDMvZZ2VKVJWk5r_lZYivZMkPiHd2YnNi7CkyHAZqE88ALfmfKp4hz09dhMdx9LEe-Ik7z2LDiRQ; xq_r_token=9d4feb5218c3979a52c1c1b390ea1277d37b0e2c; Hm_lvt_1db88642e346389874251b5a1eded6e3=1709160421,1709564278,1709914602,1711639099; smidV2=202403281118205720c0716fedcd8a9bc09c03c9d0308000a73e502a2b27430; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1711639143; .thumbcache_f24b8bbe5a5934237bbc0eda20c1b6e7=DlMXqE2VrWpGOwRk0d44yRHB/onz8c3HuRdjPHSLXOuLLvcdKUmfXa22Bbh212Q5AuV8EHUzJGU7hMUfp4kU5A%3D%3D'

# 准备请求头，包括Cookie
headers = {
    'Cookie': cookie_string,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
}

# 发送GET请求
response = requests.get(url, headers=headers)
print(response)

# 打印响应内容，这里假设响应内容是HTML
f = open('roa.json', 'w+', encoding='utf-8')
f.write(response.text)
f.close