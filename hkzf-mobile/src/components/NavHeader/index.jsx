import React from 'react'
//导入NavBar组件
import { NavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types';
import styles from './index.module.css'


export default function NavHeader(props) {

    //默认点击行为
    const defaultHandler = ()=>{
            navigate(-1)
        
    }
    //添加props效验
    NavHeader.propTypes = {
        children:PropTypes.string.isRequired,
        onBack:PropTypes.func
    }
    //console.log(props)
    const navigate = useNavigate()
    
    return (
        <div className='map-nav'>
            <NavBar back='' backArrow={<i className='iconfont icon-back' />} onBack={props.onBack || defaultHandler}>
                {props.children}
            </NavBar>
        </div>
    )
}
