import React,{ useState } from 'react'
import {Route,Routes,useLocation,useNavigate} from 'react-router-dom'

//导入TabBar
import {TabBar} from 'antd-mobile'
import News from '../News'
import Index from '../Index'
import HouseList from '../HouseList'
import Profile from '../Profile'
import styles from './index.module.css'
import './index.css'

export default function Home(props) {

    let location = useLocation()
    const navigate = useNavigate()
    //初始化状态
    //selectedTab表示的是当前被选中路由的链接
    const [selectedTab,changeSelectedTab] = useState(location.pathname)
    
    const tabs = [
        {
          key: '/home',
          title: '首页',
          icon: <i className='iconfont  icon-ind' />,
        },
        {
          key: '/home/list',
          title: '找房',
          icon: <i className='iconfont icon-findHouse' />,
        },
        {
          key: '/home/news',
          title: '咨询',
          icon: <i className='iconfont icon-infom' />,
        },
        {
          key: '/home/profile',
          title: '我的',
          icon: <i className='iconfont icon-my' />,
        },
      ]
    
    /* useEffect(() => {
      
      return (a) => {
        console.log(a)
      }
    }, [location.pathname]) */

    return (
        <div className='home'>
            {/* 渲染子路由 */}
            <Routes>
                <Route path='/news' element={<News/>}/>
                <Route exact path='/' element={<Index/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/list' element={<HouseList/>}/>
            </Routes>
            {/* TabBar */}
            <div  style={{ backgroundColor:'white', position: 'fixed', width: '100%', bottom: 0}}>
                <TabBar activeKey={location.pathname} onChange={(value)=>{
                  //路由切换
                  navigate(value)
                  //路由跳转当前的标识也随之更改
                  changeSelectedTab(value)
                  }}>
                {tabs.map(item => (
                    <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                ))
                
                }
                </TabBar>
            </div>
        </div>
        
    )
    
}
