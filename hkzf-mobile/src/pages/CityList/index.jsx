import React, { useEffect, useState,useRef } from 'react'
//导入useNavigate
import { useNavigate } from 'react-router-dom'
//导入axios
import axios from 'axios'
//import './index.scss'
//导入定位当前城市的方法
import { getCurrentCity } from '../../utils'
//导入List组件
import { List, AutoSizer } from 'react-virtualized';
//导入轻提示组件
import { Toast } from 'antd-mobile';

import NavHeader from '../../components/NavHeader'

//导入CSSModule的样式文件
import styles from './index.module.css'

//数据格式化的方法
//list:[{},{}]
function formatCityData(list) {

    const cityList = {}
    //1.遍历list数组
    list.forEach(curCity => {
        //2.获取每个城市的首字母
        //curCity.short.substr(0,1)
        //console.log(curCity.short.substr(0,1))
        //3.判断cityList中是否有该分类
        //cityList.hasOwnProperty,如果有该分类就是true，如果没有就是false
        if (curCity.short.substr(0, 1) in cityList) {//如果有该分类
            //4.如果有，直接往该分类中push数据
            cityList[curCity.short.substr(0, 1)].push(curCity)
        } else {//如果没有的话
            //5.如果没有，就先创建一个数组，然后把当前城市信息添加到数组中
            cityList[curCity.short.substr(0, 1)] = [curCity]
        }
    })

    /* for(let key in cityList){
        cityIndex.push(key)
    }
    cityIndex.sort() */
    //获取索引数据
    const cityIndex = Object.keys(cityList).sort()

    return {
        cityList,
        cityIndex
    }
}

/* // 列表数据的数据源
const list = Array(200).fill('阿巴阿巴阿巴')
 */
//处理字母索引的方法

/* //处理城市的方法
const formatCityList = ary =>{
    for(let item in ary){
         return <div className='cityList-name'>{item.label}</div> 
        console.log(item)
    }
} */

//索引（A.B)等的高度
const TITLE_HEIGHT = 36
//每个城市名臣的高度
const NAME_HEIGHT = 50

//有房源的城市
const HOUSE_CITY = ['北京','上海','广州','深圳']
export default function CityList() {

    const navigate = useNavigate()
    const [cityList, changeCityList] = useState({})
    const [cityIndex, changeCityIndex] = useState([])
    const [loading,changeloading] = useState(true)
    //指定右侧字母索引列表高亮的索引号
    const [activeIndex,changeActiveIndex] = useState(0)
    //创建ref对象
    const cityListComponent = useRef()

    const formatCityIndex = letter=>{
    switch(letter){
        case '#':
            return '当前定位'
        case 'hot':
            return '热门城市'
        default:
            return letter.toUpperCase()
    }
}


    //获取城市列表的方法
    async function getCityList() {
        const res = await axios.get(`http://localhost:8080/area/city?level=1`)
        const { cityList, cityIndex } = formatCityData(res.data.body)

        /*
            1.获取热门城市数据
            2.将数据添加到cityList中
            3.将索引添加到cityIndex中
        
        */
        const hotRes = await axios.get(`http://localhost:8080/area/hot`)
        //添加热门城市数据
        cityList['hot'] = hotRes.data.body
        //将索引添加到cityIndex中
        cityIndex.unshift('hot')
        //获取当前城市的定位
        //async await用来将异步“当”同步
        const re = await getCurrentCity()
        cityList['#'] = [re]
        cityIndex.unshift('#')
        changeCityIndex(cityIndex)
        changeCityList(cityList)
        changeloading(false)
    }

    useEffect(() => {
        getCityList()

        if(!loading){
            //调用measureAllRows,提前计算List中每一行的高度，实现scrollToRow的精确跳转
            //注意：调用这个方法的时候需要保证List组件中已经有数据了！如果List中的数据为空
            //就会导致调用方法报错！
            cityListComponent.current.measureAllRows()
        }
    }, [])

    const changeCity = ({label,value})=>{
        if(HOUSE_CITY.indexOf(label)>-1){
            //有城市房源的情况
            localStorage.setItem('hkzf_city',JSON.stringify({label,value}))
            navigate(-1)
        }else{
            //没有房源的情况
            Toast.show({
                content: '暂无该房源信息',
                duration: 1000
              })
        }
    }

    
    //渲染每一行数据的渲染函数
    //函数的返回值就表示最终渲染在页面中的内容
    
    function rowRenderer({
        key, // Unique key within array of rows
        index, // 索引号
        isScrolling, // 当前项是否正在滚动中
        isVisible, // This row is visible within the List
        style, // 重点属性 Style object to be applied to row 作用:指定每一行的位置
    }){
        //获取指定字母索引下的城市列表数据
        const i = cityIndex[index]
        
            return (
                <div key={key} style={style}>
                    <div className={styles.cityListTitle}>{formatCityIndex(i)}</div>
                    {
                        cityList[i]?.map((item)=>{
                            return <div onClick={()=>changeCity(item)} className={styles.cityListName} key={item.value}>{item.label}</div>
                        })
                    }
                </div>
            )
        
        
    }

    const changeActive = (index)=>{
        return ()=>{
            cityListComponent.current.scrollToRow(index)
        }
    }
    
    //创建动态计算每一行的高度的方法
    const  getRowHeight = ({index})  => {
        //索引标题高度+城市数量*城市名臣的高度
        //TITLE_HEIGHT +cityList[cityIndex[index]].length*NAME_HEIGHT
        //获取指定字母索引下的城市列表数据
        return TITLE_HEIGHT+cityList[cityIndex[index]].length*NAME_HEIGHT
    }

    //封装渲染右侧索引列表的方法
    const renderCityIndex = () => {
        //获取到cityIndex，并遍历其，实现渲染
        return cityIndex.map((item,index)=>
            (<li key={item} className={styles.cityIndexItem} >
                    <span onClick={changeActive(index)} className={index===activeIndex? styles.indexActive:''}>{item==='hot'? '热':item.toUpperCase()}</span>
            </li>)
        )
    }

    //用于获取List组件中渲染行的信息
    const onRowsRendered = ({startIndex})=>{
        if(startIndex!==activeIndex){
            changeActiveIndex(startIndex)
        }
    }
     
    if(loading){
        return <div></div>
    }
    return (
        <div className={styles.cityList}>
            <NavHeader>城市选择</NavHeader>
            
            {/* 城市列表 */}
            <AutoSizer>
                {
                    ({ width, height }) => (
                        <List
                            ref={cityListComponent}
                            //* 列表宽度 /
                            width={width}
                            // 列表高度 
                            height={height}
                            // 列表长度 
                            rowCount={cityIndex?.length}
                            //行高 
                            rowHeight={getRowHeight}
                            rowRenderer={rowRenderer}
                            onRowsRendered={onRowsRendered}
                            scrollToAlignment='start'
                        />
                    )
                }
            </AutoSizer>


            {/* 右侧索引列表 */}
            <ul className={styles.cityIndex}>
                {renderCityIndex()}
            </ul>

         
        </div>
    )
}
