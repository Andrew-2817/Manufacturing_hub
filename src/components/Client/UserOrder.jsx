import { Layout, ConfigProvider, Drawer, Space, Select } from "antd"
import { Upload, message } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useTRPS } from "../../../context";
import { useState, useRef } from "react";
// sent_for_evaluation accepted_evaluation evaluated paid_for accepted_manufacture produced sent
export function UserOrder({selectedNumber, isOpen, onClose}){
    const [select, setSelect] = useState('');
    const {currentUser, location} = useTRPS()
    const [formData, setFormData] = useState({
        email: '',
        description: '',
      });
    const [file, setFile] = useState(null);

    // создаем заявку для пользователя и добавляем в БД
    async function handleSubmit(e) {
        const resData = {
            OrderId: selectedNumber,
            userId: currentUser.id,
            email: formData.email,
            file: file,
            description: formData.description,
            deadline: select,
            status: 'sent_for_evaluation',
            paidFor: 0
        }

        try {

            const response = await axios.post("http://localhost:3001/userApps", resData)
            console.log(response)
            HandleCloseDrawer()
            setFormData({
                email: '',
                description: '',
              })
            console.log(selectedNumber);
            
            alert('Заявка успешно создана!')
            
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Ошибка');
        }
    }
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    function HandleCloseDrawer(){
        setFormData({
            email: '',
            description: '',
        })
        setSelect('')
        setFile(null)
    }
    function handleSelectChange(value){
        setSelect(value)
    }
    const beforeUpload = (file) => {
        const isPdfOrDocx =
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
        if (!isPdfOrDocx) {
        message.error('Вы можете загружать только файлы в формате PDF или DOCX!');
        } else {
        setFile(file);
        message.success('Файл успешно выбран.');
        }
    
        // Возвращаем false, чтобы файл не был автоматически загружен
        return false;
    };
    return(
        <Drawer
            title="Оформление заявки"
            // placement="right"
            destroyOnClose
            closable={true}
            onClose={onClose}
            open={isOpen}
            width={450}
            // getContainer={false}
        >
            <form onSubmit={handleSubmit} className="enter_form">
                <h5 className="enter_par">Оформление заявки</h5>
                <div style={{marginBottom: 20}} className="input_box">
                    <input
                        value={formData.email}
                        onChange={handleChange}
                        name="email"
                        className="log_inp1" 
                        type="email"/>
                    <label htmlFor="">Почта:</label>
                </div>
                <div className="input_box">
                    <textarea 
                        value={formData.description} 
                        name="description"
                        onChange={handleChange} 
                        className="log_inp1" 
                        type="text"/>
                    <label htmlFor="">Описание:</label>
                </div>
                <div>
                <Upload
                    beforeUpload={beforeUpload}
                    accept=".pdf,.docx"
                    maxCount={1}
                    onRemove={() => setFile(null)}
                    style={{marginLeft: '10%'}}
                >
                    <button type="button" className="upload_img_button" icon={<UploadOutlined />}>Выберите файл</button>
                </Upload>
                </div>
                <ConfigProvider
                    theme={{
                        components: {
                        Select: {
                            activeBorderColor: '#e2b932',
                            hoverBorderColor: '#e2b932'
                        },
                        },
                    }}
                    >
                    <Select
                        defaultValue="Сроки изготовления"

                        style={{
                            width: "90%",
                            margin: "20px 0"
                        }}
                        size="large"
                        onChange={handleSelectChange}
                        options={[
                            {value: 'Как можно скорее'},
                            {value: 'В течение недели'},
                            {value: 'В течение месяца'},
                            {value: 'Планирую на будующее'}
                        ]}
                        optionRender={(option) => (
                            <Space>
                            {option.data.value}
                            </Space>
                        )}
                    />
                </ConfigProvider>
                <h5 className="for_display_errors2"></h5>
                <button style={{padding: '0.8rem 1rem',fontSize:20 }} onClick={onClose} type="submit" className="log_in_click">Отправить</button>

            </form>
        </Drawer>
    )
}