import { Layout, ConfigProvider, Drawer, Space, Select, Input, Typography, message, Upload } from "antd"; // Импортируем message
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useTRPS } from "../../../context";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Импортируем Link для сообщения неавторизованным

export function UserOrder({ selectedNumber, isOpen, onClose }) {
    const [select, setSelect] = useState('');
    const { currentUser } = useTRPS();

    const [formData, setFormData] = useState({
        email: '',
        description: '',
    });

    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // console.log("UserOrder useEffect: currentUser changed or Drawer opened", { currentUser, isOpen });
        if (isOpen) {
             setFormData({
                 email: currentUser?.email || '',
                 description: '',
             });
             setSelect('');
             setFile(null);
             setError('');
        }
        // console.log("UserOrder useEffect - formData.email:", formData.email);
        // console.log("UserOrder useEffect - isEmailFieldDisabled:", !!currentUser && !!currentUser?.email);

    }, [currentUser, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // console.log("handleSubmit: currentUser:", currentUser);

        if (!currentUser) {
             setError('Для оформления заказа необходимо войти в аккаунт.');
             // Возможно, здесь лучше сразу закрыть Drawer или перенаправить на логин,
             // но пока оставим сообщение об ошибке в форме.
             return;
        }

        if (!formData.email || !formData.description || !select || !file || selectedNumber === null) {
             setError('Пожалуйста, заполните все обязательные поля и выберите файл.');
             return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('user_order_id', currentUser.id);
        formDataToSend.append('order_number', selectedNumber);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('deadline', select);
        formDataToSend.append('file', file);

        formDataToSend.append('geoip_lat', 55.7522);
        formDataToSend.append('geoip_lon', 37.6156);

        try {
            const response = await axios.post("http://localhost:8000/orders/create_with_file/", formDataToSend, {
                 headers: {
                    'Content-Type': 'multipart/form-data',
                 },
            });
            console.log("Order created:", response.data);

            // УВЕДОМЛЕНИЕ ОБ УСПЕХЕ
            message.success('Заявка успешно создана!');

            HandleCloseDrawer();

        } catch (error) {
            console.error('Error creating order:', error);
            // УВЕДОМЛЕНИЕ ОБ ОШИБКЕ
            let errorMessage = 'Ошибка при создании заявки. Попробуйте позже.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = `Ошибка: ${error.response.data.detail}`;
                // Также устанавливаем ошибку в состояние формы, если это релевантно
                setError(error.response.data.detail);
            } else {
                 setError(errorMessage); // Устанавливаем общую ошибку в состояние формы
            }
             message.error(errorMessage); // Показываем всплывающее уведомление об ошибке
        }
    }

    function HandleCloseDrawer() {
        onClose();
    }

    function handleSelectChange(value) {
        setSelect(value);
    }

    const beforeUpload = (file) => {
        const isPdfOrDocx =
            file.type === 'application/pdf' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        if (!isPdfOrDocx) {
            message.error('Вы можете загружать только файлы в формате PDF или DOCX!');
            return Upload.LIST_IGNORE;
        } else {
            setFile(file);
            message.success(`Файл "${file.name}" выбран.`);
            return false;
        }
    };

    const isEmailFieldDisabled = !!currentUser && !!currentUser?.email;

    return (
        <Drawer
            title="Оформление заявки"
            placement="right"
            destroyOnClose
            closable={true}
            onClose={HandleCloseDrawer}
            open={isOpen}
            width={450}
        >
            {selectedNumber !== null && (
                <Typography.Title level={4} style={{ marginBottom: 20, textAlign: 'center' }}>
                    Заявка №{selectedNumber}
                </Typography.Title>
            )}

            {!currentUser && (
                 <Typography.Text type="danger" style={{display: 'block', marginBottom: 20, textAlign: 'center'}}>
                    Для оформления заказа необходимо <Link to="/login">войти</Link> или <Link to="/login">зарегистрироваться</Link>.
                </Typography.Text>
            )}

            {currentUser && (
                <form onSubmit={handleSubmit} style={{border: 'none', padding: 0}}>
                     <div style={{ marginBottom: 20 }} className="input_box">
                        <input
                            value={formData.email}
                            onChange={handleChange}
                            name="email"
                            className="log_inp1"
                            type="email"
                            required
                            disabled={isEmailFieldDisabled}
                            placeholder=" "
                        />
                        <label htmlFor="">Почта:</label>
                    </div>
                    <div className="input_box">
                        <textarea
                            value={formData.description}
                            name="description"
                            onChange={handleChange}
                            className="log_inp1"
                            required
                            placeholder=" "
                        />
                        <label htmlFor="">Описание:</label>
                    </div>
                    <div style={{marginBottom: 20}}>
                        <Upload
                            beforeUpload={beforeUpload}
                            accept=".pdf,.docx"
                            maxCount={1}
                            onRemove={() => setFile(null)}
                            fileList={file ? [
                                // Форматируем объект файла для Ant Design Upload.FileList
                                {
                                    uid: file.uid || '-1', // Уникальный ID файла (Ant Design генерирует свой, можно использовать его)
                                    name: file.name, // Имя файла
                                    status: 'done', // Статус отображения в списке (done, uploading, error)
                                    originFileObj: file, // Сам объект файла
                                }
                            ] : []}
                            disabled={!!file}
                        >
                            <button type="button" className="upload_img_button" disabled={!!file}>
                                {file ? "Файл выбран" : "Выберите файл (PDF или DOCX)"}
                            </button>
                        </Upload>
                    </div>

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
                            placeholder="Сроки изготовления"
                            value={select || undefined}
                            style={{
                                width: "100%",
                                margin: "20px 0"
                            }}
                            size="large"
                            onChange={handleSelectChange}
                            options={[
                                { value: 'Как можно скорее', label: 'Как можно скорее' },
                                { value: 'В течение недели', label: 'В течение недели' },
                                { value: 'В течение месяца', label: 'В течение месяца' },
                                { value: 'Планирую на будующее', label: 'Планирую на будующее' }
                            ]}
                        />
                    </ConfigProvider>

                    {error && <Typography.Text type="danger" style={{ display: 'block', marginBottom: 10 }}>{error}</Typography.Text>}

                    <button
                        style={{ padding: '0.8rem 1rem', fontSize: 20 }}
                        type="submit"
                        className="log_in_click"
                    >
                        Отправить
                    </button>
                </form>
            )}
        </Drawer>
    );
}