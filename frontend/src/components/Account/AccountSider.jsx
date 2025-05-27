// Импортируем useLocation
import { useLocation } from "react-router-dom";
import { UserOutlined, FileSearchOutlined, LogoutOutlined, ToolOutlined } from "@ant-design/icons"
import { Layout, Typography, Flex } from "antd"
import { useTRPS } from "../../../context"
import { useState } from "react" // useState уже импортирован в context.jsx, но здесь он тоже используется для useState
const {Sider} = Layout
const SiderStyle = {
    backgroundColor: 'rgb(224, 228, 238)',
    position: 'sticky',
    top: '12vh',
    height:"88vh",
    // padding: '1rem'
}
export function AccountSider({currentUser}){
    // Получаем location здесь, а не из контекста
    const location = useLocation();
    const {app, setApp, data, setData, resource, setResource} = useTRPS()
    console.log(currentUser);

    function handleChooseTab(tab){
        if(tab == 'app'){
            setApp(true)
            setData(false)
            setResource(false)
        }else if(tab == 'data'){
            setData(true)
            setApp(false)
            setResource(false)
        }else{
            setResource(true)
            setData(false)
            setApp(false)
        }
    }
    return <Sider width={"25%"} style={SiderStyle}>
        <Typography.Title style={{textAlign:'center', marginBottom: '60px', marginTop: '1rem'}} level={4}>{currentUser && currentUser.username}</Typography.Title>
        <ul style={{display: 'flex', flexDirection: 'column', listStyle: 'none', gap:0, marginBottom: '45vh'}}>
            <li onClick={() => handleChooseTab('app')} style={{padding: '1.5rem 0', width:'100%', background: app && 'rgb(228, 213, 189)', transition: 'all ease .3s', paddingLeft: '17%'}}><Flex align="center" gap={30}><FileSearchOutlined style={{fontSize:25, color: 'rgb(248, 187, 80)'}} /><Typography.Title style={{margin: 0, fontWeight:400}} level={4}>{location.pathname === '/user/account' && "Мои заявки"}{location.pathname === '/department/account' && "Заявки пользователей"}{location.pathname === '/executor/account' && "Мои заказы"}</Typography.Title></Flex></li>
            <li onClick={() => handleChooseTab('data')} style={{padding: '1.5rem 0', width:'100%', background: data && 'rgb(228, 213, 189)', transition: 'all ease .3s', paddingLeft: '17%'}}><Flex align="center" gap={30}><UserOutlined style={{fontSize:25, color: 'rgb(248, 187, 80)'}}  /><Typography.Title style={{margin: 0, fontWeight:400}} level={4}>Мои данные</Typography.Title></Flex></li>
            {location.pathname == '/executor/account' && <li onClick={() => handleChooseTab('resource')} style={{padding: '1.5rem 0', width:'100%', background: resource && 'rgb(228, 213, 189)', transition: 'all ease .3s', paddingLeft: '17%'}}><Flex align="center" gap={30}><ToolOutlined style={{fontSize:25, color: 'rgb(248, 187, 80)'}}  /><Typography.Title style={{margin: 0, fontWeight:400}} level={4}>Усправление ресурсами</Typography.Title></Flex></li>}
        </ul>

        <a href="/user"><Flex style={{cursor: 'pointer'}} justify="center" align="center" gap={30}><LogoutOutlined  style={{fontSize:25, color: 'rgb(248, 187, 80)'}}  /><Typography.Title style={{margin: 0, fontWeight:400}} level={4}>Выйти</Typography.Title></Flex></a>
    </Sider>
}