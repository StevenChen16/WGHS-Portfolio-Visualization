import requests

# 您的目标URL
url = YOUR_OWN_URL

# 将这里的cookie_string替换为您从浏览器获取的实际Cookie字符串
cookie_string = YOUR_OWN_COOKIE_STRING

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