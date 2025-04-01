import { ConfigProvider, Modal, Upload, Select, Space } from "antd"
import { useState } from "react"
import { UploadOutlined } from "@ant-design/icons"
import axios from "axios"
import {useNavigate} from "react-router-dom"
export function ColaborationOrder({open, close}){
    const [file, setFile] = useState(null);
    const [selectPost, setSelectPost] = useState('');
    const [selectSkills, setSelectSkills] = useState({})
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [selectEducation, setSelectEducation] = useState('')
    const [employeeForm, setEmployeeForm] = useState({
        name: '',
        post: '',
        work: '',
        description:''
    })
    console.log(open);
    
    const applicationSkills = [
        {type: 'department', value: 'Чтение и составление ТЗ'},
        {type: 'all', value: 'Знание производственных процессов'},
        {type: 'department', value: 'Контроль качества продукции'},
        {type: 'manufacturer', value: 'Навыки работы на станках'},
        {type: 'all', value: 'Знание основ электротехники и автоматизации'},
        {type: 'manufacturer', value: 'Основы механики и машиностроения'},
        {type: 'manufacturer', value: 'Навыки 3D-печати и прототипирования'},
    ]
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Сбрасываем ошибку перед отправкой
        try {
        console.log({file, selectPost,  selectSkills, selectEducation, ...employeeForm});
        
        if (employeeForm.name==='' || employeeForm.post === '' || employeeForm.work === '' || employeeForm.description === '' || selectPost === '' || selectSkills === '' || selectEducation=== "" || file === null){
            setError('Заполните все поля')
            return
        }
        // console.log(formData)
        const registerResponse = await axios.post('http://localhost:3001/applications', {...employeeForm, selectEducation, selectPost, selectSkills, file})
        console.log(registerResponse);
        console.log('User registered:', registerResponse.data);
        alert('Registration successful!');
        selectPost === 'Технический отдел' ? navigate('/department') : navigate('/executor')
        // navigate('/user')
        } catch (error) {
        console.error('Error registering user:', error);
        alert('Registration failed!');
        }
      };
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
    function handleSelectPost(value){
        setSelectPost(value)
    }
    function handleSelectSkills(value){
        setSelectSkills(value)
    }
    function handleSelectEducation(value){
        setSelectEducation(value)
    }
    const handleChange = (e) => {
        setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value });
        };
    return(
    <ConfigProvider
        theme={{
            token: {
            padding: 5
            },
        }}
    >  
        <Modal style={{top: '2%'}} width={"30%"} footer={null} open={open} onCancel={close}>
            <form onSubmit={handleSubmit} style={{margin: 0, border: 'none'}}  className="enter_form">
                <h5 style={{marginBottom: 20}} className="enter_par">Заявка</h5>
                <div style={{marginBottom: 20}} className="input_box">
                    <input
                        value={employeeForm.name}
                        onChange={handleChange}
                        name='name'
                        className="log_inp1" 
                        type="text"/>
                    <label htmlFor="">ФИО:</label>
                </div>
                <div style={{marginBottom: 20}} className="input_box">
                    <input 
                        value={employeeForm.post}
                        onChange={handleChange}
                        name="post"
                        className="log_inp1" 
                        type="email"/>
                    <label htmlFor="">Почта:</label>
                </div>
                <div style={{marginBottom: 20}} className="input_box">
                    <input
                        value={employeeForm.work}
                        onChange={handleChange}
                        name="work"
                        className="log_inp1" 
                        type="text"/>
                    <label htmlFor="">Опыт работы:</label>
                </div>
                <Upload
                    beforeUpload={beforeUpload}
                    accept=".pdf,.docx"
                    maxCount={1}
                    onRemove={() => setFile(null)}
                    style={{marginLeft: '10%'}}
                >
                    <button type="button" className="upload_img_button" icon={<UploadOutlined />}>Загрузите резюме (в формате PDF или DOCX)</button>
                </Upload>
                <ConfigProvider
                    theme={{
                        components: {
                        Select: {
                            activeBorderColor: '#e2b932',
                            hoverBorderColor: '#e2b932',
                            optionSelectedBg: '#fff1d8'
                        },
                        },
                    }}
                    >
                    <Select
                        defaultValue="Выбери должность"

                        style={{
                            width: "90%",
                            marginTop: 20
                        }}
                        size="large"
                        onChange={handleSelectPost}
                        options={[
                            {value: 'Технический отдел'},
                            {value: 'Производитель'},
                        ]}
                        optionRender={(option) => (
                            <Space>
                            {option.data.value}
                            </Space>
                        )}
                    />
                </ConfigProvider>
                <ConfigProvider
                    theme={{
                        components: {
                        Select: {
                            activeBorderColor: '#e2b932',
                            hoverBorderColor: '#e2b932',
                            optionSelectedBg: '#fff1d8',
                        },
                        },
                    }}
                    >
                    <Select
                        defaultValue="Выбери навыки"
                        mode="multiple"
                        style={{
                            width: "90%",
                            marginTop: 20
                        }}
                        size="large"
                        onChange={handleSelectSkills}
                        options={applicationSkills}
                        optionRender={(option) => (
                            <Space
                            >
                            {option.data.value}
                            </Space>
                        )}
                    />
                </ConfigProvider>
                <ConfigProvider
                    theme={{
                        components: {
                        Select: {
                            activeBorderColor: '#e2b932',
                            hoverBorderColor: '#e2b932',
                            optionSelectedBg: '#fff1d8'
                        },
                        },
                    }}
                    >
                    <Select
                        defaultValue="Выбери образование"

                        style={{
                            width: "90%",
                            marginTop: 20,
                            marginBottom: 20
                        }}
                        size="large"
                        onChange={handleSelectEducation}
                        options={[
                            {value: 'Среднее общее образование'},
                            {value: 'Среднее профессиональное образование'},
                            {value: 'Высшее образование'},
                        ]}
                        optionRender={(option) => (
                            <Space>
                            {option.data.value}
                            </Space>
                        )}
                    />
                </ConfigProvider>
                <div style={{marginBottom: 20}} className="input_box">
                    <textarea
                        value={employeeForm.description}
                        onChange={handleChange}
                        name="description"
                        style={{height: '50px'}} 
                        className="log_inp1" 
                        type="text"/>
                    <label htmlFor="">Расскажите о себе:</label>
                </div>
                <h5 className="for_display_errors2">{error}</h5>
                <button type="submit" className="log_in_click">Отправить</button>
            </form>
        </Modal>
    </ConfigProvider>
    )
}