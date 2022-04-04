import React, { useState, useEffect } from 'react'
//引入跳转路由的工具
import {useNavigate} from 'react-router-dom'
//导入组件
import { Swiper,Grid } from 'antd-mobile'
//导入axios
import axios from 'axios'
//导入导航菜单图片
import imgNav1 from '../../assets/images/nav-1.png'
import imgNav2 from '../../assets/images/nav-2.png'
import imgNav3 from '../../assets/images/nav-3.png'
import imgNav4 from '../../assets/images/nav-4.png'
import styles from './index.module.css'
import './index.scss'
//导入获取定位的方法
import {getCurrentCity} from '../../utils'

//获取地理位置信息
/* navigator.geolocation.getCurrentPosition(
    position=>{
        console.log('当前位置信息：',position)
    },
    error=>{
        console.log('错误信息')
    })
 */
export default function Index() {

    
    //swipers表示轮播图状态数据
    const [swipers, changeSwipers] = useState([])
    //isSwiperLoaded表示轮播图是否加载完成
    const [isSwiperLoaded,changeIsSwiperLoaded] = useState(false)
    //租房小组数据
    const [groups,changeGroups] = useState([])
    //最新咨询的数据
    const [news,changeNews] = useState([])
    //当前城市名称
    const [curCityName,changeCurCityName] = useState('上海')
    //创建一个跳转路由函数
    const navigate = useNavigate()

    //准备一个导航菜单的数组
    const navs = [
        {
            id: 1,
            img: imgNav1,
            title: '整租',
            path: '/home/list'
        },
        {
            id: 2,
            img: imgNav2,
            title: '合租',
            path: '/home/list'
        },
        {
            id: 3,
            img: imgNav3,
            title: '地图找房',
            path: '/map'
        },
        {
            id: 4,
            img: imgNav4,
            title: '去出租',
            path: '/rent'
        }
    ]
    //定义一个获取轮播图数据的方法
    async function getSwipers() {
        const res = await axios.get('http://localhost:8080/home/swiper')
        changeSwipers(res.data.body)
        changeIsSwiperLoaded(true)
    }
    //定义一个获取租房小组数据的方法
    async function getGroups(){
        const res = await axios.get('http://localhost:8080/home/groups',{
            params:{
                area:'AREA%7C88cff55c-aaa4-e2e0'
            }
        })
        changeGroups(res.data.body)
    }
    //定义一个获取最新资讯数据的方法
    async function getNews(){
        const res = await axios.get('http://localhost:8080/home/news',{
            params:{
                area:'AREA%7C88cff55c-aaa4-e2e0'
            }
        })
        changeNews(res.data.body)
    }
    //如果数组为空相当于componentDidMount
    useEffect(() => {
        //得到轮播图的数据
        getSwipers()
        //得到租房小组的数据
        getGroups()
        //得到最近咨询的数据
        getNews()
        //通过IP定位获取到当前城市名称
        getCurrentCity().then(
            res=>{
                changeCurCityName(res.label)
            }
        )
    }, [])

    //swipers中有轮播图的地址
    const items = swipers.map(data => (
        <Swiper.Item key={data.id}>
            <a
                href='http://itcast.cn'
                style={{
                    display: 'inline-block',
                    width: "100%",
                    height: "212px"
                }}
            >
                <img
                    src={`http://localhost:8080${data.imgSrc}`}
                    alt=''
                    style={{ width: '100%', verticalAlign: 'top' }}
                >
                </img>
            </a>
        </Swiper.Item>
    ))

    //渲染导航菜单
    const FlexExample = () => {
        return navs.map((item)=>
            <div key={item.id} className={styles.flexChild} onClick={()=>{navigate(item.path)}}>
                <img src={item.img} alt="" />
                <h2 className={styles.newsTitle}>{item.title}</h2>
            </div>
        )
    
    }

    //渲染最新咨询
    const renderNews = ()=>{
        return news.map( item =>
            <div className="news-item" key={item.id}>
                <div className="news-img">
                    <img src={`http://localhost:8080${item.imgSrc}`} alt=""/>
                </div>
                <div className="content">
                    <h3>{item.title}</h3>
                    <div className="info">
                        <span>{item.from}</span>
                        <span>{item.date}</span>
                    </div>
                </div>
            </div>
        )
    }
                

    

    return(
        <div>
            {/* loop表示是否循环 autoplay表示是否自动播放 autoplayInterval表示切换的时间间隔 */ }
            {
                isSwiperLoaded?
                <div className={styles.swiperBar}>
                     < Swiper loop autoplay autoplayInterval = { 3000} > { items }</Swiper >
                </div>:
                ('')
            }
            {/* 导航栏 */}
            <div className={styles.searchBar}>
                {/* 左侧白色区域 */}
                <div className={styles.searchBox}>
                    {/* 位置 */}
                    <div className={styles.searchMap} onClick={()=>{navigate('/cityList')}}>
                        <span>{curCityName}</span>
                        <i className="iconfont icon-arrow" />
                    </div>
                    {/* 搜索表单 */}
                    <div className={styles.searchTree} onClick={()=>{navigate('/search')}}>
                        <i className="iconfont icon-seach" />
                        <span className={styles.text}>请输入小区或地址</span>
                    </div>
                </div>
                {/* 右侧地图图标 */}
                <i className='iconfont icon-map' onClick={()=>{navigate('/map')}}/>
            </div>

            {/* 菜单导航 */ }
            < div className = {styles.flexWrap} > { FlexExample() }</div >

            {/* 租房小组 */}
            <div className={styles.group}>
                <h3 className={styles.groupTitle}>
                    租房小组 <span className={styles.more}>更多</span>
                </h3>
            </div>

            {/* 宫格组件 */}
            <Grid columns={2} gap={8}>
                {groups.map(item =>(
                    <Grid.Item key={item.id}>
                    <div className="group-item">
                        <div className="desc">
                                <p className="title">{item.title}</p>
                                <span className="info">{item.desc}</span>
                        </div>
                        <img src={`http://localhost:8080${item.imgSrc}`} alt=""/>
                    </div>
                </Grid.Item>
                ))}
            </Grid>
            
            {/* 最新资讯 */}
            <div className='news'>
                <h3 className='group-title'>最新资讯</h3>
                {/* 先写第一个试试 */}
                <div className='news-bar'>
                    {renderNews()}
                </div>

            </div>

        </div >
    )
}
