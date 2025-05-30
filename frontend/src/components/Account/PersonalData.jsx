import { Flex, Typography, Input } from "antd"; // message не импортирован, если нет логики message
import { Button } from "../Button";
import { useState, useEffect } from "react";
// import axios from "axios"; // axios не нужен здесь, если не будет сохранения
// import { useTRPS } from "../../../context"; // useTRPS не нужен здесь, если не будет сохранения

export function PersonalData({currentUser}){
    // const { setCurrentUser } = useTRPS(); // Не нужен, если нет сохранения

    const [isEnabled, setIsEnabled] = useState(false)
    const [dataForm, setDataForm] = useState({
        // ИЗМЕНЕНО: Используем currentUser?.name и currentUser?.email
        name: currentUser?.name || '', // ФИО
        email: currentUser?.email || '', // Почта
        number: '', // Телефон - не сохраняется в БД, остается на фронте
        password: '', // Пароль - всегда пустой, вводится только для изменения
        checkPassword: '', // Повтор пароля
    })
    // const [passwordError, setPasswordError] = useState(''); // Не нужен, если нет сохранения

    // Эффект для обновления формы, если currentUser меняется (например, после первой загрузки)
    useEffect(() => {
        if (currentUser) {
            setDataForm(prev => ({
                ...prev,
                name: currentUser.name || '',
                email: currentUser.email || '',
                // number: currentUser.phone_number || '', // Если бы было поле 'phone_number'
            }));
        }
    }, [currentUser]);

    console.log(currentUser); // Логируем currentUser

    const handleChange = (e) => {
        setDataForm({ ...dataForm, [e.target.name]: e.target.value });
        // setPasswordError(''); // Не нужен, если нет сохранения
    };

    // Функция сохранения, которая сейчас не работает
    const handleSave = () => {
        // Здесь должна быть логика отправки на бэкенд, но вы ее отложили
        console.log("Saving data:", dataForm);
        setIsEnabled(false); // Просто закрываем режим редактирования
        // message.info('Функция сохранения временно отключена.'); // Если message импортирован
    };

    return(
        <div style={{display: 'flex', flexDirection: 'column', gap:20}}>
            {currentUser && <>
                <Flex justify="space-between"><Typography.Title level={4}>ФИО</Typography.Title><Input name="name" onChange={handleChange}  style={{width: '45%', fontSize:18}} disabled = {!isEnabled} value={dataForm.name}/></Flex>
                <Flex justify="space-between"><Typography.Title level={4}>Почта</Typography.Title><Input name="email" onChange={handleChange} style={{width: '45%', fontSize:18}} disabled = {!isEnabled} value={dataForm.email}/></Flex>
                <Flex justify="space-between"><Typography.Title level={4}>Телефон</Typography.Title><Input name="number" onChange={handleChange} style={{width: '45%',fontSize:18}} disabled = {!isEnabled} value={dataForm.number}/></Flex>
                <Flex justify="space-between"><Typography.Title level={4}>Пароль</Typography.Title><Input name="password" onChange={handleChange} style={{width: '45%',fontSize:18}} value={dataForm.password} disabled = {!isEnabled} type="password"/></Flex>

                {!isEnabled && <Button onClick={() => setIsEnabled(true)} style={{padding:'0.7rem', width: '25%', fontSize:18}}>Редактировать</Button>}
                {isEnabled && <Button isActive onClick={handleSave} style={{padding:'0.7rem', width: '25%', fontSize:18}}>Сохранить</Button>}
            </>}
        </div>
    )
}