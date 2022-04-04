import React from 'react'

import {Route,Routes,Navigate} from 'react-router-dom'
//导入首页和城市选择两个组件(页面)
import CityList from './pages/CityList'
import Home from './pages/Home'
import Map from './pages/Map'
import Search from './pages/Search'

export default function App() {
    return (
        <div style={{height:'100%',width:'100%'}}>
            {/* <Button>sign up</Button> */}
            {/* 配置导航菜单 */}
            {/* 配置路由 */}
            <Routes>
                <Route path='/home/*' element={<Home/>}></Route>
                <Route path='/cityList/*' element={<CityList/>}></Route>
                <Route path='/search' element={<Search/>}></Route>
                <Route path='/map' element={<Map/>}></Route>
                {/* 默认路由匹配时，自己跳转到主页 */}
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </div>
    )
}
