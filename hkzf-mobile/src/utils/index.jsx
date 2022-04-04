//1. 在utils目录中，新建index.jsx，在该文件中封装
//2. 创建并导出获取定位城市的函数getCurrentCity
//3. 判断localStorage中是否有定位城市
//4. 如果没有，就使用首页中获取定位城市的代码来获取，并且存储到本地存储中，然后返回该城市数据
//5. 如果有，直接返回本地存储中的城市数据





import axios from 'axios'
//创建并到处获取定位城市的函数 getCurrentCity
function getCurrentCity(){
    //判断locationStorage中是否有定位城市
    const localCity = JSON.parse(localStorage.getItem('hkzf_city'))
    if(!localCity){
        return new Promise((resolve,reject)=>{
            try{
                //如果没有，就使用首页中获取定位城市的代码来获取
                const curCity = new window.BMapGL.LocalCity();
                curCity.get(async res=>{
                //console.log(res)
                const result = await axios.get(`http://localhost:8080/area/info?name=${res.name}`)
                //并且存储到本地存储中
                //result.data.body
                localStorage.setItem('hkzf_city',JSON.stringify(result.data.body))
                //然后返回该城市数据
                resolve(result.data.body)
                })
            }catch(e){
                reject(e)
            }
        })
    }else{
        //上面为了处理异步操作，使用了promise，为了该函数返回值的统一，此处，也应该使用promise
        //这里的promise不会失败， 所以此处返回一个成功的promise即可
        return Promise.resolve(localCity)

    }}


export {getCurrentCity}