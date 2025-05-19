import { Layout, Typography, Flex } from "antd"
import { SolutionOutlined, ToolOutlined } from "@ant-design/icons"
import {useState, useEffect } from "react"
import { ColaborationOrder } from "./ColaborationOrder"
import axios from "axios"
import logo from "../assets/logo.png"
import {Button} from './Button'
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTRPS } from "../../context"

const {Header} = Layout
const headerStyle = {
    height: "12vh",
    // padding: "0",
    background: "linear-gradient(150deg,rgb(248, 187, 80),rgb(94, 94, 92)) ",
    margin: '0 auto',
    width: '100%',
    paddingRight: '10%',
    paddingLeft: '10%',
    display: "flex",
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 100,
}
export function LoginHeader(){
    const [employeeModal, setEmployeeModal] = useState(false)
    const navigate = useNavigate()
    const {currentUser, setCurrentUser} = useTRPS()
    const location = useLocation()
      useEffect(() => {
          async function isCurrentUser(){
            try{
    
                const response = await axios.get("http://localhost:3001/currentUser")
                console.log('Текущий пользователь:', response.data);
                if (response.data && Object.keys(response.data).length > 0) {
                    console.log('yes');
                    
                    setCurrentUser(response.data)
                }else{
                    setCurrentUser(null)
                }
            } catch (error) {
                console.error('Error registering user:', error);
                alert('Registration failed!');
            }
          }
          isCurrentUser()
      }, []);
      async function Logout(){
        try {
            await axios.put('http://localhost:3001/currentUser', {})
            alert("Вы вышли из аккаунта")
            navigate('/login')
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Logout failed!');
        }
      }
      

    return(
        <Header style={headerStyle}>
            <img width={50} src={logo} alt="" />
            {(location.pathname ==='/user' && currentUser) && <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                <li><Link to="account">Личный кабинет</Link></li>
                <li onClick={() => setEmployeeModal(true)}><a>Стать сотрудником</a></li>
                <li>
                    <Button onClick={() => Logout()} className={employeeModal ? "content_tabs content_tabs_active": "content_tabs"} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}} size="large">
                        Выйти
                    </Button>
                </li>
            </ul>}
            {(location.pathname ==='/user' && !currentUser) && <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                <li onClick={() => setEmployeeModal(true)}><a>Стать сотрудником</a></li>
                <li>
                    <Link to={'/login'}>
                        <Button className={employeeModal ? "content_tabs content_tabs_active": "content_tabs"} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}} size="large">
                            Войти
                        </Button>
                    </Link>
                </li>
            </ul>}
            {location.pathname==='/login' && <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                <li><Link to='/user'>Главная</Link></li>
                <li>
                    <Button onClick={() => setEmployeeModal(true)} className={employeeModal ? "content_tabs content_tabs_active": "content_tabs"} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}} size="large">
                        Стать сотрудником
                    </Button>
                </li>
            </ul>}
            {location.pathname ==='/department' &&
            <>
            <Flex gap={10} align="center">
                <Typography.Title style={{fontWeight:400}} level={4}>Технологический отдел</Typography.Title>
                <SolutionOutlined style={{fontSize: 22}}/>
            </Flex>
            <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                <li><Link to="account">Личный кабинет</Link></li>
                <li>
                    <Button onClick={() => Logout()} className={employeeModal ? "content_tabs content_tabs_active": "content_tabs"} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}} size="large">
                        Выйти
                    </Button>
                </li>
            </ul>
            </>}
            {location.pathname ==='/executor' &&
            <>
            <Flex gap={10} align="center">
                <Typography.Title style={{fontWeight:400}} level={4}>Производитель</Typography.Title>
                <ToolOutlined style={{fontSize: 22}}/>
            </Flex>
            <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                <li><Link to="account">Личный кабинет</Link></li>
                <li>
                    <Button onClick={() => Logout()} className={employeeModal ? "content_tabs content_tabs_active": "content_tabs"} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}} size="large">
                        Выйти
                    </Button>
                </li>
            </ul>
            </>}
            <ColaborationOrder close={() => setEmployeeModal(false)} open={employeeModal}/>
        </Header>
    )
}