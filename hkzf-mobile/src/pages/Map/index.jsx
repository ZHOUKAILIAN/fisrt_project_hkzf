import React, { useEffect, useState } from 'react'
import NavHeader from '../../components/NavHeader'
import styles from './index.module.css'
import { Link } from 'react-router-dom'
import { Toast } from 'antd-mobile'
//导入axios
import axios from 'axios'

//覆盖物样式
const shroudStyle = {
    cursor: 'pointer',
    border: '0px solid rgb(255,0,0)',
    padding: '0px',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    color: 'rgb(255,255,255)',
    textAlign: 'center'
}

export default function Map() {

    //小区下的房源列表
    const [houseList, changeHouseList] = useState([])
    //房源列表显示的状态
    const [isShowList, changeIsShowList] = useState(false)

    //初始化地图
    function initMap() {
        const map = new window.BMapGL.Map("container");
        //初始化地图实例
        //获取当前定位城市
        const { label, value } = JSON.parse(localStorage.getItem('hkzf_city'))
        //注意：在react脚手架中全局对象需要使用window来哦访问，否则，会造成ESLink效验错误

        //创建地址解析器对象
        const myGeo = new window.BMapGL.Geocoder();
        const zoomCtrl = new window.BMapGL.ZoomControl();
        const scaleCtrl = new window.BMapGL.ScaleControl();

        // 将地址解析结果显示在地图上，并调整地图视野
        myGeo.getPoint(label, async function (point) {
            if (point) {
                map.centerAndZoom(point, 11);
                //map.addOverlay(new window.BMapGL.Marker(point, {title:label}))

                // 添加比例尺控件
                map.addControl(scaleCtrl);
                // 添加缩放控件
                map.addControl(zoomCtrl);
                //添加文本标注对象
                map.addOverlay(label);
                renderOverlays(map, value)
            } else {
                alert('您选择的地址没有解析到结果！');
            }
        }, label)
        //给地图绑定移动事件
        map.addEventListener('movestart',()=>{
    
              changeIsShowList(false)
            
           
        })
    }

    //创建覆盖物
    function createOverlays(map, item, zoom, type) {
        const {
            coord: { longitude, latitude },
            label: areaName,
            count,
            value
        } = item
        //创建坐标对象
        const areaPoint = new window.BMapGL.Point(longitude, latitude)
        if (type === 'rect') {
            //小区
            createRect(map, areaPoint, areaName, count, value)
        } else {
            //区和镇
            createCircle(map, areaPoint, areaName, count, value, zoom)
        }
    }

    /*
        计算要绘制的覆盖物类型和下一个缩放级别
        区  ->  11 , 范围：>=10  <12
        镇  ->  13 , 范围：>=12  <14
        小区->  15 , 范围：>=14  <16
    */
    function getTypeAndZoom(map) {
        //调用地图的getZoom方法，来获取当前缩放级别
        const zoom = map.getZoom()
        //console.log(zoom)
        let nextZoom, type
        if (zoom >= 10 && zoom < 12) {
            //区
            //11是默认缩放级别，此时展示所有区的覆盖物
            //circle表示绘制圆形覆盖物
            type = 'circle'
            //下一个缩放级别
            nextZoom = 13
        } else if (zoom >= 12 && zoom < 14) {
            //镇
            type = 'circle'
            nextZoom = 15
        } else if (zoom >= 14 && zoom < 16) {
            //小区
            type = 'rect'
        }
        return { type, nextZoom }
    }

    // 创建区，镇 覆盖物
    function createCircle(map, areaPoint, areaName, count, id, zoom) {
        //配置对象
        const opts = {
            position: areaPoint, // 指定文本标注所在的地理位置
            offset: new window.BMapGL.Size(-35, -35) // 设置文本偏移量
        };
        //创建一个文本标签对象(覆盖物)
        //说明：设置setContent后，第一个参数中设置的文本内容就失效了，所以直接清空即可
        const shroud = new window.BMapGL.Label('', opts);
        //给shroud对象添加一个唯一标识
        shroud.id = id
        //设置房源覆盖物内容
        shroud.setContent(`
            <div class="${styles.bubble}">
                <p class="${styles.name}">${areaName}</p>
                <p>${count}套</p>
            <div> 
        `)
        // 自定义文本标注样式
        shroud.setStyle(shroudStyle);
        //添加覆盖物
        map.addOverlay(shroud);
        //添加一个单击事件
        shroud.addEventListener('click', () => {
            //调用renderOverlays,获取该区域下的房源数据
            renderOverlays(map, id)

            map.centerAndZoom(areaPoint, zoom);
            //清楚当前覆盖物信息
            map.clearOverlays()
        })

    }

    //创建小区覆盖物
    function createRect(map, point, areaName, count, value) {
        const opts = {
            position: point, // 指定文本标注所在的地理位置
            offset: new window.BMapGL.Size(-50, -28) // 设置文本偏移量
        };
        // 创建文本标注对象
        const plotCover = new window.BMapGL.Label('', opts);
        plotCover.id = value
        plotCover.setContent(`
            <div class="${styles.rect}">
                <span class="${styles.housename}">${areaName}</span>
                <span class="${styles.housenum}">${count}套</span>
                <i class="${styles.arrow}"></i>
            </div>
        `)
        // 自定义文本标注样式
        plotCover.setStyle(shroudStyle);
        map.addOverlay(plotCover);
        plotCover.addEventListener('click', (e) => {
            getHouseList(value)
            
            //获取当前被点击项
            const target = e.domEvent.changedTouches[0]
            map.panBy(
                window.innerWidth/2-target.clientX,
                (window.innerHeight-330)/2-target.clientY 
            )

        })
        //给地图绑定移动事件
        map.addEventListener('movestart',()=>{
          
                
              changeIsShowList(false)
            
           
        })
    }
    //获取小区房源数据
    async function getHouseList(id) {
        try{
             //开启Loading
            Toast.show({
                icon: 'loading',
                content: '加载中…',
                duration:0
            })
            const res = await axios.get(`http://localhost:8080/houses?cityId=${id}`)
            Toast.clear()
            //console.log('小区的房源数据',res)
            changeHouseList(res.data.body.list)
            changeIsShowList(true)
        }catch(e){
            Toast.clear()
            console.log(e)
        }
       
    }

    //封装渲染房屋列表的方法
    function renderHouseList() {
        return houseList.map((item) => {
            return (
                <div className={styles.house} key={item.houseCode}>
                    <div className={styles.imgWrap}>
                        <img
                            className={styles.img}
                            src={`http://localhost:8080${item.houseImg}`}
                            alt=""
                        />
                    </div>
                    <div className={styles.content}>
                        <h3 className={styles.title}>{item.title}</h3>
                        <div className={styles.desc}>{item.desc}</div>
                        <div>
                            {/* ['近地铁', '随时看房'] */}
                            {item.tags.map((tag, index) => {
                                const tagClass = 'tag' + (index + 1)
                                return (
                                    <span
                                        className={[styles.tag, styles[tagClass]].join(' ')}
                                        key={tag}
                                    >
                                        {tag}
                                    </span>
                                )
                            })}
                        </div>
                        <div className={styles.price}>
                            <span className={styles.priceNum}>{item.price}</span> 元/月
        </div>
                    </div>
                </div>
            )
        })

    }

    //渲染覆盖物入口
    //1.接收区域id，获取该区域下的房源数据
    //2.获取房源类型以及下级地图缩放级别
    async function renderOverlays(map, id) {
        try{
            Toast.show({
                icon: 'loading',
                content: '加载中…',
                duration:0
              })
            const res = await axios.get(`http://localhost:8080/area/map?id=${id}`)
            //关闭loading
            Toast.clear()
            const data = res.data.body
            //调用getTypeAndZoom方法获取级别和类型
            const { type, nextZoom } = getTypeAndZoom(map)
            data.forEach(item => {
                createOverlays(map, item, nextZoom, type)
                //console.log(item)
            })
        }catch(e){
            Toast.clear()
            console.log(e)
        }
        
    }

    function getMap() {
        //初始化地图实例
        //获取当前定位城市
        const { label, value } = JSON.parse(localStorage.getItem('hkzf_city'))
        //注意：在react脚手架中全局对象需要使用window来哦访问，否则，会造成ESLink效验错误
        const map = new window.BMapGL.Map("container");
        //创建地址解析器对象
        const myGeo = new window.BMapGL.Geocoder();
        const zoomCtrl = new window.BMapGL.ZoomControl();
        const scaleCtrl = new window.BMapGL.ScaleControl();

        // 将地址解析结果显示在地图上，并调整地图视野
        myGeo.getPoint(label, async function (point) {
            if (point) {
                map.centerAndZoom(point, 11);
                //map.addOverlay(new window.BMapGL.Marker(point, {title:label}))

                // 添加比例尺控件
                map.addControl(scaleCtrl);
                // 添加缩放控件
                map.addControl(zoomCtrl);
                //添加文本标注对象
                map.addOverlay(label);
                renderOverlays(map, value)
                /* const res = await axios.get(`http://localhost:8080/area/map?id=${value}`)
                res.data.body.forEach((item)=>{
                    //为每一条数据创建覆盖物
                    const {coord:{longitude,latitude},value} = item
                    const areaPoint = new window.BMapGL.Point(longitude,latitude)
                    //配置对象
                    const opts = {
                        position: areaPoint, // 指定文本标注所在的地理位置
                        offset: new window.BMapGL.Size(-35, -35) // 设置文本偏移量
                    };
                    //创建一个文本标签对象(覆盖物)
                    //说明：设置setContent后，第一个参数中设置的文本内容就失效了，所以直接清空即可
                    const shroud = new window.BMapGL.Label('', opts);
                    //给shroud对象添加一个唯一标识
                    shroud.id = value
                    //设置房源覆盖物内容
                    shroud.setContent(`
                        <div class="${styles.bubble}">
                            <p class="${styles.name}">${item.label}</p>
                            <p>${item.count}套</p>
                        <div> 
                    `)
                    // 自定义文本标注样式
                    shroud.setStyle(shroudStyle);
                    //添加一个单击事件
                    shroud.addEventListener('click',()=>{
                        //console.log('房源信息',shroud.id)
                        //放大地图，以当前点击的覆盖物为中心放大地图
                        
                           第一个参数：坐标对象
                           第二个参数：放大级别
                        
                        map.centerAndZoom(areaPoint, 13);
                        //清楚当前覆盖物信息
                        map.clearOverlays()
                    })
                    map.addOverlay(shroud);
                } )*/
            } else {
                alert('您选择的地址没有解析到结果！');
            }
        }, label)


        //设置中心点坐标
        //const point = new window.BMapGL.Point(116.404, 39.915);

    }
    useEffect(() => {
        initMap()
    }, [])

    return (
        <div className={styles.map}>
            <NavHeader >地图找房</NavHeader>
            {/* 创建一个地图容器 */}
            <div className={styles.bmapContainer} id='container' />
            {/* 房源列表 */}
            {/* 添加 styles.show 展示房屋列表 */}
            <div
                className={[
                    styles.houseList,
                    isShowList ? styles.show : ''
                ].join(' ')}
            >
                <div className={styles.titleWrap}>
                    <h1 className={styles.listTitle}>房屋列表</h1>
                    <Link className={styles.titleMore} to="/home/list">
                        更多房源
                </Link>
                </div>

                <div className={styles.houseItems}>
                    {/* 房屋结构 */}
                    {renderHouseList()}
                </div>
            </div>
        </div>
    )
}
