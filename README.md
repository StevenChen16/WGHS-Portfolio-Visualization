# 雪球投资组合可视化

## 项目简介

本项目旨在提供一个直观的可视化界面，用于展示和分析雪球平台上的投资组合性能。通过生成动态的图表，用户可以轻松查看其投资组合的历史表现、行业分类、以及与主要指数（如 S&P 500、道琼斯工业平均指数等）的比较。

## 功能特点

- **实时数据更新**：每次页面刷新时自动执行数据抓取和更新脚本。
- **投资组合历史表现**：通过折线图展示投资组合随时间的价值变化。
- **行业分类展示**：通过饼图显示投资组合中各行业的市值分布。
- **指数比较**：将投资组合表现与多个主要指数进行比较，以折线图形式展示。

## 技术栈

- **前端**：HTML, CSS, JavaScript (使用 ECharts 库进行图表绘制)
- **后端**：Python (使用 Flask 框架处理数据更新请求)
- **数据处理**：Python 脚本用于下载、处理和分类数据

## 项目结构

```
/project-root
    │── index.html
    ├── app.py
    ├── performances.py
    ├── roa.py
    ├── index_data_download.py
    ├── classify_read.py
    └── README.md
```

## 安装指南

### 环境要求

- Python 3.x
- Flask
- ECharts (通过 CDN 引入)

### 设置步骤

1. **克隆仓库**

   ```bash
   git clone https://your-repository-url
   cd your-project-directory
   ```

2. **安装依赖**

   ```bash
   pip install flask requests numpy pandas
   ```

3. **运行应用**

   ```bash
   python app.py
   ```

   应用将在默认的 5000 端口上运行。通过浏览器访问 `http://localhost:5000` 即可查看应用。

## 使用说明

打开网页后，应用将自动加载最新的投资数据并显示图表。您可以通过浏览器的刷新按钮来更新数据和图表。

## 开发者信息

- **姓名**：Steven Chen
- **联系方式**：i@stevenchen.site

## 许可证

本项目采用 [MIT 许可证](LICENSE)。详情请见 `LICENSE` 文件。
