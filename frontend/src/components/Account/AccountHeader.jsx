import { Layout , Typography, Flex} from "antd"
import logo from '../../assets/logo.png'
// UploadOutlined здесь не используется, можно удалить
import { UploadOutlined, SolutionOutlined, ToolOutlined } from "@ant-design/icons"
import { SmileTwoTone } from "@ant-design/icons"
import { Link, useNavigate, useLocation } from "react-router-dom" // Импортируем useLocation
// import { useTRPS } from "../../../context" // useTRPS здесь больше не используется для location
import { useTRPS } from "../../../context" // Оставляем для currentUser
// import {useState} from "react"; // useState здесь не используется

const {Header} = Layout
const headerStyle = {
    height: "12vh",
    background: "linear-gradient(150deg,rgb(248, 187, 80),rgb(94, 94, 92)) ",
    margin: '0 auto',
    width: '100%',
    paddingRight: '5%', // Вернул оригинальный padding, как в файле
    paddingLeft: '5%',  // Вернул оригинальный padding
    display: "flex",
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 100,
}

export function AccountHeader(){
    // Получаем location напрямую из react-router-dom
    const location = useLocation();
    // Получаем currentUser из контекста useTRPS
    const { currentUser } = useTRPS();
    // useState не используется здесь, удаляем
    // const [employeeModal, setEmployeeModal] = useState(false);
    // useNavigate не используется здесь, удаляем
    // const navigate = useNavigate()

    return(
        <Header style={headerStyle}>
            <img width={50} src={logo} alt="" />

            {<Typography.Title style={{fontWeight: 400, marginRight: '20%', marginBottom:0}} level={3}>Личный кабинет</Typography.Title>}
            <Flex gap={40}>

            {location.pathname === '/executor/account' && <Typography.Title style={{fontWeight: 400, marginBottom: 0}} level={3}>
                <Flex gap={10} align="center">
                    <Typography.Title style={{fontWeight:400, marginBottom:0}} level={4}>Производитель</Typography.Title>
                    <ToolOutlined style={{fontSize: 22}}/>
                </Flex>
            </Typography.Title>}
            {location.pathname === '/department/account' && <Typography.Title style={{fontWeight: 400, marginBottom: 0}} level={3}>
                <Flex gap={10} align="center">
                    <Typography.Title style={{fontWeight:400, marginBottom:0}} level={4}>Технологический отдел</Typography.Title>
                    <SolutionOutlined style={{fontSize: 22}}/>
                </Flex>
            </Typography.Title>}

            {location.pathname === '/user/account' && (
                <ul className="header__nav" style={{display: "flex",alignItems: 'center', gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                    <li><Link to="/user">Главная</Link></li>
                </ul>
            )}
             {location.pathname === '/department/account' && (
                 <ul className="header__nav" style={{display: "flex",alignItems: 'center', gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                    <li><Link to="/department">Главная</Link></li>
                 </ul>
             )}
            {location.pathname === '/executor/account' && (
                 <ul className="header__nav" style={{display: "flex",alignItems: 'center', gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                    <li><Link to="/executor">Главная</Link></li>
                 </ul>
            )}

            <SmileTwoTone style={{fontSize:40}} twoToneColor={"rgb(248, 187, 80)"} />
            </Flex>
        </Header>
    )
}