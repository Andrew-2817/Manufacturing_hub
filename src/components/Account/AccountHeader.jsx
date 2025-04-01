import { Layout , Typography, Flex} from "antd"
import logo from '../../assets/logo.png'
import { UploadOutlined, SolutionOutlined, ToolOutlined } from "@ant-design/icons"
import { SmileTwoTone } from "@ant-design/icons"
import { Link } from "react-router-dom"
import { useTRPS } from "../../../context"
const {Header} = Layout
const headerStyle = {
    height: "12vh",
    // padding: "0",
    background: "linear-gradient(150deg,rgb(248, 187, 80),rgb(94, 94, 92)) ",
    margin: '0 auto',
    width: '100%',
    paddingRight: '5%',
    paddingLeft: '5%',
    display: "flex",
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 100,
}
export function AccountHeader(){
    const {location} = useTRPS()
    return(
        <Header style={headerStyle}>
            <img width={50} src={logo} alt="" />
            {<Typography.Title style={{fontWeight: 400, marginRight: '20%', marginBottom:0}} level={3}>Личный кабинет</Typography.Title>}
            <Flex gap={40}>

            <ul className="header__nav" style={{display: "flex",alignItems: 'center', gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
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
                {location.pathname === '/user/account' && <li><Link to="/user">Главная</Link></li>}
                {location.pathname === '/department/account' && <li><Link to="/department">Главная</Link></li>}
                {location.pathname === '/executor/account' && <li><Link to="/executor">Главная</Link></li>}
            </ul>
            <SmileTwoTone style={{fontSize:40}} twoToneColor={"rgb(248, 187, 80)"} />
            </Flex>
        </Header>
    )
}