import { Layout, Flex } from "antd";
import { LoginHeader } from "./Header";
import { useState } from "react";
import { useTRPS } from "../../context";
import { Button } from "./Button";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
// Импортируем qs для форматирования данных формы для OAuth2
import { stringify } from 'qs';
// Импортируем status из Ant Design, если он используется для сообщений,
// или можно использовать статусы из response.status
// import { status } from 'antd'; // Ant Design status не подходит здесь

// Импортируем статус из starlette, если нужно сравнение с ним (непрямое использование)
// import { status as httpStatus } from 'starlette'; // Не нужно напрямую

const {Content}  = Layout
const contentStyle = {
    width: '80%',
    minHeight: '85vh',
    margin: '0 auto',
    marginTop: '10vh'
}
const layoutStyle = {
    minHeight: "100vh"
}

export function Login(){
    const [regform, setRegform] = useState(true);
    const [enterform, setEnterform] = useState(false);
    const navigate = useNavigate();

    const context = useTRPS();
    const { setCurrentUser } = context; // Получаем setCurrentUser из контекста

    const [regFormData, setRegFormData] = useState({
        username: '',
        email: '',
        password: '',
        checkPassword: ''
      });

    const [enterFormData, setEnterFormData] = useState({
        email: '', // Будет использоваться как username в OAuth2 форме
        password: '',
    });

    const [error, setError] = useState(''); // Состояние для ошибок формы

    const handleRegChange = (e) => {
        setRegFormData({ ...regFormData, [e.target.name]: e.target.value });
      };

    const handleEnterChange = (e) => {
        setEnterFormData({ ...enterFormData, [e.target.name]: e.target.value });
      };

    // Обработчик отправки формы регистрации
    const handleRegSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (regFormData.email === '' || regFormData.username === '' || regFormData.password === '' || regFormData.checkPassword === ''){
            setError('Заполните все поля');
            return;
        }
        if (regFormData.password !== regFormData.checkPassword){
            setError('Пароли не совпадают');
            return;
        }
        if (regFormData.password.length < 8){
            setError('Пароль должен содержать минимум 8 символов');
            return;
        }

        try {
            const userDataToRegister = {
                name: regFormData.username,
                email: regFormData.email,
                password: regFormData.password,
                role: 'user' // Роль по умолчанию при регистрации через эту форму
            };
            // Отправляем данные для регистрации как JSON POST
            const registerResponse = await axios.post('http://localhost:8000/users/', userDataToRegister);
            console.log('User registered:', registerResponse.data);

            alert('Регистрация успешна! Теперь войдите в систему.');
            // Очищаем форму и переключаемся на форму входа
            setRegFormData({
                username: '',
                email: '',
                password: '',
                checkPassword: ''
            });
            handleChangeForm('enter');

        } catch (error) {
            console.error('Error registering user:', error);
            // Обработка ошибок с бэкенда
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail);
            } else {
                 setError('Ошибка регистрации. Попробуйте позже.');
            }
        }
    };

    // Обработчик отправки формы входа (ОСНОВНЫЕ ИЗМЕНЕНИЯ ЗДЕСЬ)
    const handleEnterSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Сбрасываем ошибку перед отправкой

        // Валидация на фронте
        if (enterFormData.email === '' || enterFormData.password === ''){
            setError('Заполните все поля');
            return;
        }

        try {
            // Отправляем данные для логина в формате x-www-form-urlencoded на эндпоинт логина OAuth2
            // Используем qs.stringify для правильного форматирования
            const loginResponse = await axios.post(
                'http://localhost:8000/users/login/', // Эндпоинт логина на бэкенде
                 // Форматируем данные формы
                stringify({
                    username: enterFormData.email, // В OAuth2PasswordRequestForm email ожидается как 'username'
                    password: enterFormData.password,
                }),
                {
                     headers: {
                        // Устанавливаем правильный Content-Type для x-www-form-urlencoded
                        'Content-Type': 'application/x-www-form-urlencoded',
                     },
                }
            );
            console.log('Login successful:', loginResponse.data);

            const responseData = loginResponse.data; // Ответ должен содержать access_token, token_type, user_id, user_role

            // ИЗМЕНЕНО: Сохраняем ТОЛЬКО токен доступа в localStorage
            localStorage.setItem('accessToken', responseData.access_token);
            // Также сохраняем минимальные данные пользователя (id и role) для использования в контексте
            // перед тем, как /me эндпоинт загрузит полные данные.
            localStorage.setItem('currentUserData', JSON.stringify({ id: responseData.user_id, role: responseData.user_role }));

            // ИЗМЕНЕНО: Устанавливаем минимальные данные пользователя в контекст сразу после логина
            // Полные данные пользователя будут загружены ContextProvider'ом при следующей проверке (useEffect)
            setCurrentUser({ id: responseData.user_id, role: responseData.user_role });


            // Редирект на соответствующую страницу в зависимости от роли пользователя
            // Теперь логика редиректа использует user_role из ответа логина
            if (responseData.user_role === 'user') {
                navigate('/user/account'); // Редирект в личный кабинет пользователя
            } else if (responseData.user_role === 'department') {
                navigate('/department/account'); // Редирект в личный кабинет отдела
            } else if (responseData.user_role === 'executor') {
                navigate('/executor/account'); // Редирект в личный кабинет производителя
            } else {
                // Если роль неизвестна или не соответствует ожидаемым, можно перенаправить на главную или логин
                console.warn("Unknown user role received:", responseData.user_role);
                navigate('/'); // Или navigate('/login')
            }

            alert('Вход выполнен успешно!');

        } catch (error) {
            console.error('Error logging in:', error);
            // Обработка ошибок с бэкенда. 401 Unauthorized -> неверные учетные данные
            // Используем статус из ответа
            if (error.response && error.response.status === 401) {
                 setError('Неверная почта или пароль.');
            } else if (error.response && error.response.data && error.response.data.detail) {
                setError(`Ошибка: ${error.response.data.detail}`);
            } else {
                setError('Ошибка входа. Попробуйте позже.');
            }
        }
    };

    // Функция для переключения между формами входа и регистрации
    function handleChangeForm(form){
        setError(''); // Сбрасываем ошибки при переключении форм
        if (form === 'enter'){
            setEnterform(true);
            setRegform(false);
        } else {
            setRegform(true);
            setEnterform(false);
        }
    }

    return(
            <Layout style={layoutStyle}>
                <LoginHeader/>
                <Content style={contentStyle}>
                    <Flex justify="space-between" align="center">
                        <img style={{borderRadius: '15px', boxShadow: "0px 0px 35px 10px rgba(34, 60, 80, 0.5)", width: '50%'}}  src="https://avatars.mds.yandex.net/i?id=318c568c97a871c6417d00c532125777_l-5248286-images-thumbs&n=13" alt="" />
                        <div style={{width: '35%', height: '80vh', marginRight: "0%"}} className="">
                            <Flex justify="space-evenly" style={{margin: "20px 0", width: '90%'}}>
                                <Button onClick={() => handleChangeForm('enter')} isActive={enterform}>Войти</Button>
                                <Button onClick={() => handleChangeForm('reg')} isActive={regform}>Регистрация</Button>
                            </Flex>

                            {enterform && (
                                <form onSubmit={handleEnterSubmit} className="enter_form">
                                    <h5 className="enter_par">Вход</h5>
                                    <div className="input_box">
                                        <input
                                            value={enterFormData.email}
                                            onChange={handleEnterChange}
                                            name="email"
                                            className="log_inp1"
                                            type="email"
                                            required // Добавил required для базовой валидации
                                            placeholder=" " // Добавил placeholder для работы CSS меток
                                        />
                                        <label htmlFor="">Логин:</label>
                                    </div>
                                    <div className="input_box">
                                        <input
                                            value={enterFormData.password}
                                            name="password"
                                            onChange={handleEnterChange}
                                            className="log_inp2"
                                            type="password"
                                            required // Добавил required
                                            placeholder=" " // Добавил placeholder
                                        />
                                        <label htmlFor="">Пароль:</label>
                                    </div>
                                    <p style={{margin: '10px 0', color: '#f34848'}} className="for_display_errors">{error}</p>
                                    <div className="login_register">
                                        <div className="register_now_element">
                                            <h4>Нет аккаунта?</h4>
                                            <Link to="/login" onClick={(e) => { e.preventDefault(); handleChangeForm('reg'); }}>
                                                <p style={{cursor: 'pointer'}}>зарегистрироваться</p>
                                            </Link>
                                        </div>
                                        <button type="submit" className="log_in_click">Войти</button>
                                    </div>
                                </form>
                            )}

                        {regform && (
                                <form onSubmit={handleRegSubmit} className="reg_form">
                                    <h5 className="reg_par">Регистрация</h5>
                                    <div className="input_box">
                                        <input
                                            value={regFormData.email}
                                            onChange={handleRegChange}
                                            name="email"
                                            className="reg_inp_password"
                                            type="email"
                                            required
                                            placeholder=" "
                                        />
                                        <label htmlFor="">Логин:</label>
                                    </div>
                                    <div className="input_box">
                                        <input
                                            value={regFormData.username}
                                            onChange={handleRegChange}
                                            name="username"
                                            className="reg_inp_password"
                                            type="text"
                                            required
                                            placeholder=" "
                                        />
                                        <label htmlFor="">Имя:</label>
                                    </div>
                                    <div className="input_box">
                                        <input
                                            value={regFormData.password}
                                            onChange={handleRegChange}
                                            name="password"
                                            className="reg_inp_password"
                                            type="password"
                                            required
                                            minLength={8}
                                            placeholder=" "
                                        />
                                        <label htmlFor="">Пароль:</label>
                                    </div>
                                    <div className="input_box">
                                        <input
                                            value={regFormData.checkPassword}
                                            onChange={handleRegChange}
                                            name="checkPassword"
                                            className="reg_inp_password"
                                            type="password"
                                            required
                                            minLength={8}
                                            placeholder=" "
                                        />
                                        <label htmlFor="">Повторить пароль:</label>
                                    </div>
                                    <p style={{color: '#f34848'}} className="for_display_errors">{error}</p>
                                    <button type="submit" className="reg_in_click">Зарегистрироваться</button>
                                </form>
                            )}
                        </div>
                    </Flex>
                </Content>
            </Layout>
    );
}