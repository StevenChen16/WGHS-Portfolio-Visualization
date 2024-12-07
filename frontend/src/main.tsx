import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'  // 改为正确的文件名

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)