import { Layout, Flex } from "antd";
import { LoginHeader } from "./Header";
import { useState } from "react";
import { useTRPS } from "../../context";
import { Button } from "./Button";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

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
    const { setCurrentUser } = context; // Теперь setCurrentUser точно функция, т.к. ContextProvider оборачивает RouterProvider

    // Состояние для формы регистрации
    const [regFormData, setRegFormData] = useState({
        username: '',
        email: '',
        password: '',
        checkPassword: ''
      });

    // Состояние для формы входа
    const [enterFormData, setEnterFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleRegChange = (e) => {
        setRegFormData({ ...regFormData, [e.target.name]: e.target.value });
      };

    const handleEnterChange = (e) => {
        setEnterFormData({ ...enterFormData, [e.target.name]: e.target.value });
      };

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
                role: 'user'
            };
            const registerResponse = await axios.post('http://localhost:8000/users/', userDataToRegister);
            console.log('User registered:', registerResponse.data);

            alert('Регистрация успешна! Теперь войдите в систему.');
            setRegFormData({
                username: '',
                email: '',
                password: '',
                checkPassword: ''
            });
            handleChangeForm('enter');

        } catch (error) {
            console.error('Error registering user:', error);
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail);
            } else {
                 setError('Ошибка регистрации. Попробуйте позже.');
            }
        }
      };

      const handleEnterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (enterFormData.email === '' || enterFormData.password === ''){
            setError('Заполните все поля');
            return;
        }

        try {
            const loginResponse = await axios.post('http://localhost:8000/users/login/', enterFormData);
            console.log('Login successful:', loginResponse.data);

            // Устанавливаем данные пользователя в контекст
            setCurrentUser(loginResponse.data);

            // Сохраняем ID и роль пользователя в localStorage для запоминания
            // НЕ СОХРАНЯЙТЕ ПАРОЛЬ В localStorage!
            localStorage.setItem('currentUserData', JSON.stringify({ id: loginResponse.data.id, role: loginResponse.data.role }));

            // ИЗМЕНЕНО: Редирект на ГЛАВНУЮ страницу пользователя
            navigate('/user');
            alert('Вход выполнен успешно!');

        } catch (error) {
            console.error('Error logging in:', error);
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail);
            } else {
                setError('Ошибка входа. Проверьте почту и пароль.');
            }
        }
      };

    function handleChangeForm(form){
        setError('');
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
                                            required
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
                                            required
                                        />
                                        <label htmlFor="">Пароль:</label>
                                    </div>
                                    <p style={{margin: '10px 0', color: '#f34848'}} className="for_display_errors">{error}</p>
                                    <div className="login_register">
                                        <h4>Нет аккаунта?</h4>
                                        <p style={{cursor: 'pointer'}} onClick={() => handleChangeForm('reg')}>зарегистрироваться</p>
                                    </div>
                                    <button type="submit" className="log_in_click">Войти</button>
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