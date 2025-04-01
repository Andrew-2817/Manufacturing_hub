import { Layout, Flex } from "antd"
import { ContextProvider } from "../../context"
import { LoginHeader } from "./Header"
import { useEffect, useState } from "react"
import { useTRPS } from "../../context"
import { Button } from "./Button"
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'
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
    const [regform, setRegform] = useState(true)
    const [enterform, setEnterform] = useState(false)
    const navigate = useNavigate(); // Хук для навигации
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        checkPassword: ''
      });
    const [enterFormData, setEnterFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('')
    
      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
      const handleEnterChange = (e) => {
        setEnterFormData({ ...enterFormData, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Сбрасываем ошибку перед отправкой
        try {
           // Проверяем, существует ли пользователь с таким email
        const response = await axios.get('http://localhost:3001/users', {
            params: {
            email: formData.email,
            },
        });
        if (formData.email==='' || formData.username === '' || formData.password === '' || formData.checkPassword === ''){
            setError('Заполните все поля')
            return
        }

        if (formData.password !== formData.checkPassword){
            setError('Пароли не совпадают')
            return
        }
        if (response.data.length > 0) {
            // Если email уже существует
            setError('Пользователь с таким email уже зарегистрирован. Попробуйте войти');
            return;
        }
        if (formData.password.length <8){
            setError('Пароль должен содержать минимум 8 символов')
            return
        }


        console.log(formData)
        const registerResponse = await axios.post('http://localhost:3001/users', formData);
        await axios.put('http://localhost:3001/currentUser', registerResponse.data)
        console.log('User registered:', registerResponse.data);
        alert('Registration successful!');
        navigate('/user')
        } catch (error) {
        console.error('Error registering user:', error);
        alert('Registration failed!');
        }
      };
      const handleEnterSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Сбрасываем ошибку перед отправкой
        try {
        // Проверяем, существует ли пользователь с таким email
        const response = await axios.get('http://localhost:3001/users', {
            params: {
            email: enterFormData.email,
            },
        });
        console.log(response.data);
        
          
        if (enterFormData.email==='' || enterFormData.password === ''){
            setError('Заполните все поля')
            return
        }
        if (!response.data.length >0) {
            setError('Неправильный логин')
            return
        }
        if (response.data[0]['password'] !== enterFormData.password) {
            setError('Неправильный пароль')
            return
        }
        await axios.put('http://localhost:3001/currentUser', response.data[0])
        navigate('/user')
        alert('Enter successful!');
        } catch (error) {
        console.error('Error registering user:', error);
        alert('Registration failed!');
        }
      };
    function handleChangeForm(form){
        if (form == 'enter'){
            setEnterform(true)
            setRegform(false)
        } else {
            setRegform(true)
            setEnterform(false)
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
                                <Button onClick={() => handleChangeForm('enter')} isActive = {enterform}>Войти</Button>
                                <Button onClick={() => handleChangeForm('reg')} isActive = {regform}>Регистрация</Button>
                            </Flex>
                            {enterform && <form onSubmit={handleEnterSubmit} className="enter_form">
                                <h5 className="enter_par">Вход</h5>
                                <div className="input_box">
                                    <input 
                                        value={enterFormData.email}
                                        onChange={handleEnterChange}
                                        name="email"
                                        className="log_inp1" 
                                        type="email"/>
                                    <label htmlFor="">Логин:</label>
                                </div>
                                <div className="input_box">
                                    <input
                                        value={enterFormData.password}
                                        name="password"
                                        onChange={handleEnterChange}
                                        className="log_inp2" 
                                        type="password"/>
                                    <label htmlFor="">Пароль:</label>
                                </div>
                                <h5 className="for_display_errors2"></h5>
                                <div className="login_register">
                                    <div className="register_now_element">
                                        <h4>Нет аккаунта?</h4>
                                        <p style={{cursor: 'pointer'}} onClick={() => handleChangeForm('reg')}>зарегистрироваться</p>
                                    </div>
                                    <p style={{margin: '10px 0'}} className="for_display_errors">{error}</p>
                                    <button type="submit" className="log_in_click">Войти</button>
                                </div>
                            </form>}
                        {regform && <form onSubmit={handleSubmit} className="reg_form">
                                <h5 className="reg_par">Регистрация</h5>
                                <div className="input_box">
                                    <input
                                        value={formData.email}
                                        onChange={handleChange}
                                        name="email" 
                                        className="reg_inp_password"  
                                        type="email"/>
                                    <label htmlFor="">Логин:</label>
                                </div>
                                <div className="input_box">
                                    <input
                                        value={formData.username}
                                        onChange={handleChange}
                                        name="username" 
                                        className="reg_inp_password" 
                                        type="text"/>
                                    <label htmlFor="">Имя:</label>
                                </div>
                                <div className="input_box">
                                    <input
                                        value={formData.password}
                                        onChange={handleChange}
                                        name="password" 
                                        className="reg_inp_password" 
                                        type="password"/>
                                    <label htmlFor="">Пароль:</label>
                                </div>
                                <div className="input_box">
                                    <input
                                        value={formData.checkPassword}
                                        onChange={handleChange}
                                        name="checkPassword" 
                                        className="reg_inp_password"  
                                        type="password"/>
                                    <label htmlFor="">Повторить пароль:</label>
                                </div>
                                <p className="for_display_errors">{error}</p>
                                <button  type="submit" className="reg_in_click">Зарегистрироваться</button>
                            </form>}
                        </div>
                    </Flex>
                </Content>
            </Layout>
    )
}