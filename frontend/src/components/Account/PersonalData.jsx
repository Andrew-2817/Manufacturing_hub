import { Flex, Typography, Input } from "antd";
import { Button } from "../Button";
import { useState } from "react";

export function PersonalData({currentUser}){
    const [isEnabled, setIsEnabled] = useState(false)
    const [dataForm, setDataForm] = useState({
        text: currentUser.username,
        email: currentUser.email,
        number: '',
        password: currentUser.password
    })
    console.log(currentUser);
    const handleChange = (e) => {
        setDataForm({ ...dataForm, [e.target.name]: e.target.value });
      };
    return(
        <div style={{display: 'flex', flexDirection: 'column', gap:20}}>
            {currentUser && <>
                <Flex justify="space-between"><Typography.Title level={4}>ФИО</Typography.Title><Input name="text" onChange={handleChange}  style={{width: '45%', fontSize:18}} disabled = {!isEnabled} value={dataForm.text}/></Flex>
                <Flex justify="space-between"><Typography.Title level={4}>Почта</Typography.Title><Input name="email" onChange={handleChange} style={{width: '45%', fontSize:18}} disabled = {!isEnabled} value={dataForm.email}/></Flex>
                <Flex justify="space-between"><Typography.Title level={4}>Телефон</Typography.Title><Input name="number" onChange={handleChange} style={{width: '45%',fontSize:18}} disabled = {!isEnabled} value={dataForm.number}/></Flex>
                <Flex justify="space-between"><Typography.Title level={4}>Пароль</Typography.Title><Input name="password" onChange={handleChange} style={{width: '45%',fontSize:18}} value={dataForm.password} disabled = {!isEnabled}/></Flex>
                {!isEnabled && <Button onClick={() => setIsEnabled(true)} style={{padding:'0.7rem', width: '25%', fontSize:18}}>Редактировать</Button>}
                {isEnabled && <Button isActive onClick={() => setIsEnabled(false)} style={{padding:'0.7rem', width: '25%', fontSize:18}}>Сохранить</Button>}
            </>}
        </div>
    )
}