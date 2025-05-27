import { Layout , Typography, Flex} from "antd"
import logo from '../assets/logo.png'
// UploadOutlined здесь не используется, можно удалить
import { UploadOutlined, SolutionOutlined, ToolOutlined } from "@ant-design/icons"
import { SmileTwoTone } from "@ant-design/icons"
import { Link, useNavigate, useLocation } from "react-router-dom" // useLocation нужен здесь
import { useTRPS } from "../../context" // useTRPS нужен здесь
import { Button } from './Button'
import { ColaborationOrder } from "./ColaborationOrder"
import { useState } from "react"; // useState нужен здесь для employeeModal


const {Header} = Layout
const headerStyle = {
    height: "12vh",
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
    const [employeeModal, setEmployeeModal] = useState(false);
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useTRPS();
    const location = useLocation();


    // Функция для выхода из аккаунта (ОСНОВНЫЕ ИЗМЕНЕНИЯ ЗДЕСЬ)
    async function Logout(){
        try {
            console.log("Logging out: Clearing localStorage and context.");
            // ИЗМЕНЕНО: Удаляем токен доступа из localStorage
            localStorage.removeItem('accessToken');
             // Также удаляем минимальные данные пользователя
            localStorage.removeItem('currentUserData');

            // Очищаем currentUser в контексте
            setCurrentUser(null);

            alert("Вы вышли из аккаунта");
             // Перенаправляем на страницу логина
            navigate('/login');
        } catch (error) {
            // В этой модели ошибки здесь быть не должно при работе с localStorage
            console.error('Error logging out:', error);
            alert('Logout failed!');
        }
    }

    // Определяем, на какой странице мы находимся
    const isUserPage = location.pathname === '/user';
    const isLoginPage = location.pathname === '/login';
    const isDepartmentPage = location.pathname === '/department';
    const isExecutorPage = location.pathname === '/executor';
    // const isAccountPage = location.pathname.endsWith('/account'); // Не нужна здесь

    return(
        <Header style={headerStyle}>
            <img width={50} src={logo} alt="" />


            {isUserPage && currentUser && (
                <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                    <li><Link to="/user/account">Личный кабинет</Link></li>
                    <li style={{cursor: 'pointer'}} onClick={() => setEmployeeModal(true)}><a>Стать сотрудником</a></li>
                    <li>
                        <Button onClick={Logout} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}}>
                            Выйти
                        </Button>
                    </li>
                </ul>
            )}

            {isUserPage && !currentUser && (
                 <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                    <li style={{cursor: 'pointer'}} onClick={() => setEmployeeModal(true)}><a>Стать сотрудником</a></li>
                    <li>
                        <Link to={'/login'}>
                            <Button style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}}>
                                Войти
                            </Button>
                        </Link>
                    </li>
                </ul>
            )}

            {isLoginPage && (
                <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                    <li><Link to='/user'>Главная</Link></li>
                    <li>
                        <Button onClick={() => setEmployeeModal(true)} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}}>
                            Стать сотрудником
                        </Button>
                    </li>
                </ul>
            )}

            {(isDepartmentPage || isExecutorPage) && currentUser && ( // Добавил проверку currentUser
                <>
                    <Flex gap={10} align="center">
                        <Typography.Title style={{fontWeight:400, marginBottom:0}} level={4}>
                            {currentUser.role === 'department' && "Технологический отдел"}
                            {currentUser.role === 'executor' && "Производитель"}
                            {(!currentUser.role || (currentUser.role !== 'department' && currentUser.role !== 'executor')) && "Сотрудник"}
                        </Typography.Title>
                        {currentUser.role === 'department' && <SolutionOutlined style={{fontSize: 22}}/>}
                        {currentUser.role === 'executor' && <ToolOutlined style={{fontSize: 22}}/>}
                    </Flex>
                    <ul className="header__nav" style={{display: "flex", gap: '40px', listStyle: "none", color: 'rgb(59, 59, 59)', fontSize:18, fontWeight:600}}>
                        {currentUser.role === 'department' && <li><Link to="/department/account">Личный кабинет</Link></li>}
                        {currentUser.role === 'executor' && <li><Link to="/executor/account">Личный кабинет</Link></li>}
                        <li>
                            <Button onClick={Logout} style={{fontWeight:600, fontSize:16, padding: '0.5rem 1rem', backgroundColor: '#fff', borderColor: '#e6cea4'}}>
                                Выйти
                            </Button>
                        </li>
                    </ul>
                </>
            )}

            <ColaborationOrder close={() => setEmployeeModal(false)} open={employeeModal}/>
        </Header>
    )
}