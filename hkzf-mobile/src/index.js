import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from 'react-router-dom'

import './index.css' 
//antd-mobile的样式不需要导入，在v5中已经自动导入了
//导入字体图标库的样式文件
import './assets/fonts/iconfont.css'
import App from './App'

//导入react-virtualized样式
import 'react-virtualized/styles.css'



ReactDOM.render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>,
    document.getElementById('root'))
