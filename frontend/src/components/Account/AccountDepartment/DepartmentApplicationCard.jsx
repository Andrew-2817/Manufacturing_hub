import { useState, useEffect } from "react";
// ИЗМЕНЕНО: Импортируем InputNumber, а не просто Input
import { Drawer, Typography, Card, Steps, Flex, ConfigProvider, message, Input, Tag, Select, Space, Form, InputNumber } from "antd";
import { Button } from "../../Button"; // Импортируем иконки для Form.List
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"; // Импортируем иконки для Form.List
import axios from "axios"; // axios нужен для получения и отправки ресурсов

// Импортируем изображения
import app_reject from '../../../assets/app_reject.jpg';
import completed from '../../../assets/completed.jpg';
import evaluation from '../../../assets/evaluation.jpg';
import accept from '../../../assets/accept.jpg';


// Определяем шаги для отображения статусов в Steps для отдела
const DEPARTMENT_STEPS = [
    {
        title: 'Принята отделом',
        content: accept,
        status: 'accepted_evaluation',
    },
    {
        title: 'На оценке',
        content: evaluation,
        status: 'evaluated',
    },
];

const COMPLETED_STATUSES = ['evaluated', 'paid_for', 'accepted_production', 'produced', 'sent'];
const REJECTED_STATUS = 'reject';

// Опции для выбора типа ресурса (можно загружать с бэкенда в будущем)
const RESOURCE_TYPES_OPTIONS = [
    { value: 'Токарный станок', label: 'Токарный станок' },
    { value: 'Фрезерный станок', label: 'Фрезерный станок' },
    { value: 'Сверлильный станок', label: 'Сверлильный станок' },
    { value: 'Шлифовальный станок', label: 'Шлифовальный станок' },
    { value: 'Гидравлический пресс', label: 'Гидравлический пресс' },
    { value: 'Лазерная резка', label: 'Лазерная резка' },
    { value: 'Сварочное оборудование', label: 'Сварочное оборудование' },
    { value: 'Покрасочная камера', label: 'Покрасочная камера' },
];


export function DepartmentApplicationCard({ app, onUpdate }) {
    const [drawer, setDrawer] = useState(false); // Drawer для отклонения
    const [drawerPrice, setDrawerPrice] = useState(false); // Drawer для установки цены
    const [drawerResources, setDrawerResources] = useState(false); // НОВОЕ: Drawer для управления ресурсами
    const [currentStep, setCurrentStep] = useState(0);
    const [inputRejectReason, setInputRejectReason] = useState('');
    const [inputRejectError, setInputRejectError] = useState('');
    const [inputPrice, setInputPrice] = useState('');
    const [inputPriceError, setInputPriceError] = useState('');
    const [isPriceSet, setIsPriceSet] = useState(false);

    const [resourceForm] = Form.useForm(); // Форма для ресурсов

    useEffect(() => {
        console.log("DepartmentApplicationCard useEffect: app status or price changed", { status: app.status, price: app.price });

        if (app.status === REJECTED_STATUS || COMPLETED_STATUSES.includes(app.status)) {
             setCurrentStep(DEPARTMENT_STEPS.length);
        } else {
             const statusIndex = DEPARTMENT_STEPS.findIndex(step => step.status === app.status);
             setCurrentStep(statusIndex !== -1 ? statusIndex : 0);
        }

        setIsPriceSet(app.price > 0);

        if (app.price > 0) {
            setInputPrice(String(app.price));
        } else {
            setInputPrice('');
        }
    }, [app.status, app.price]);

    // Загрузка ресурсов для текущего заказа (при открытии Drawer)
    async function fetchOrderResources() {
        try {
            const response = await axios.get(`http://localhost:8000/order-resources/for-order/${app.id}`);
            if (response.data) {
                // Устанавливаем полученные ресурсы в форму для редактирования
                resourceForm.setFieldsValue({ resources: response.data });
                console.log("Fetched resources for order:", response.data);
            } else {
                resourceForm.setFieldsValue({ resources: [] });
                console.log("No resources found for order.");
            }
        } catch (error) {
            console.error('Error fetching order resources:', error);
            message.error('Не удалось загрузить ресурсы для заказа.');
            resourceForm.setFieldsValue({ resources: [] });
        }
    }

    // Сохранение ресурсов для заказа
    async function handleSaveResources(values) {
        console.log("handleSaveResources: Function triggered!"); // <-- НОВЫЙ ЛОГ
        console.log("handleSaveResources: Form values on submit:", values);

        if (!values.resources || values.resources.length === 0) {
            message.warning("Необходимо добавить хотя бы один ресурс.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/order-resources/for-order/${app.id}/bulk`, {
                resources: values.resources
            });
            console.log("Resources saved:", response.data);
            message.success('Ресурсы успешно обновлены!');
            setDrawerResources(false);
        } catch (error) {
            console.error('Error saving resources:', error);
            let errorMessage = 'Не удалось сохранить ресурсы.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = `Ошибка: ${error.response.data.detail}`;
            }
            message.error(errorMessage);
        }
    }


    async function handleNextStatus() {
        const currentStatus = app.status;
        console.log("handleNextStatus: currentStatus", currentStatus);

        let newStatus = null;

        if (currentStatus === 'sent_for_evaluation') {
            newStatus = 'accepted_evaluation';
        } else if (currentStatus === 'accepted_evaluation') {
            newStatus = 'evaluated';
            if (!isPriceSet) {
                message.warning('Для завершения оценки необходимо установить стоимость.');
                setDrawerPrice(true);
                return;
            }
        } else if (currentStatus === 'evaluated') {
             message.info('Отдел завершил работу над заявкой. Ожидается оплата клиентом.');
             return;
        } else {
            message.warning('Заявка уже не требует действий от технологического отдела.');
            return;
        }

        if (newStatus) {
             await onUpdate(app.id, { status: newStatus });
        }
    }

    async function handlePrevStatus() {
         const currentStatus = app.status;

         let newStatus = null;

         if (currentStatus === 'evaluated') {
             newStatus = 'accepted_evaluation';
         } else if (currentStatus === 'accepted_evaluation') {
             newStatus = 'sent_for_evaluation';
         } else {
             message.warning('Нельзя вернуться назад из текущего статуса.');
             return;
         }

        await onUpdate(app.id, { status: newStatus });
    }

    async function handleRejectApplication() {
        if (inputRejectReason.trim() !== '') {
            setInputRejectError('');
            await onUpdate(app.id, { status: REJECTED_STATUS, comments: inputRejectReason.trim() });
            setDrawer(false);
            setInputRejectReason('');
        } else {
            setInputRejectError('Заполните поле с причиной отклонения.');
        }
    }

    async function handleEvaluatePrice() {
        const priceValue = parseFloat(inputPrice);
        if (!isNaN(priceValue) && priceValue >= 0) {
            setInputPriceError('');
            await onUpdate(app.id, { price: priceValue });
            setDrawerPrice(false);
        } else {
            setInputPriceError("Введите корректное число (неотрицательное).");
        }
    }

    const getStatusImage = (status) => {
        if (status === REJECTED_STATUS) {
             return app_reject;
        }
        if (status === 'sent_for_evaluation') {
            return accept;
        }
        if (COMPLETED_STATUSES.includes(status)) {
             return completed;
        }
        const step = DEPARTMENT_STEPS.find(step => step.status === status);
        return step ? step.content : null;
    }

    const showOnlySteps = app.status === 'accepted_evaluation' || app.status === 'evaluated';


    return (
        <Card style={{width: '100%', position: 'relative', overflow: 'hidden', marginBottom:20}}>
            <Flex justify="space-between" align="center" style={{marginBottom:20}}>
                <Typography style={{fontSize:22}}>
                    Заявка №<span style={{fontWeight:600}}>{app?.order_number || app?.id}</span>
                </Typography>
                {app.status === REJECTED_STATUS && <Typography.Title style={{margin:0, fontWeight:400, color: 'red'}} level={4}>Отклонена</Typography.Title>}
                {app.status === 'sent_for_evaluation' && <Typography.Title style={{margin:0, fontWeight:400, color: 'orange'}} level={4}>Новая</Typography.Title>}
                {app.status === 'accepted_evaluation' && <Typography.Title style={{margin:0, fontWeight:400, color: 'blue'}} level={4}>Оценивается</Typography.Title>}
                {app.status === 'evaluated' && <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Оценена</Typography.Title>}
                 {COMPLETED_STATUSES.includes(app.status) && app.status !== 'evaluated' && (
                     <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Передана в производство</Typography.Title>
                 )}
            </Flex>

            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: 'rgb(224, 190, 121)',
                        colorBorderSecondary: 'rgb(218, 216, 239)'
                    },
                }}
            >
                {showOnlySteps && (
                    <Steps
                        progressDot
                        items={DEPARTMENT_STEPS.map((item, index) => ({
                            key: item.status,
                            title: item.title,
                            status: app.status === item.status ? 'process' : (
                                DEPARTMENT_STEPS.findIndex(s => s.status === app.status) > index ? 'finish' : 'wait'
                            ),
                        }))}
                        current={DEPARTMENT_STEPS.findIndex(step => step.status === app.status)}
                    />
                 )}

                <Flex justify="space-between" align="center" style={{margin: '20px 0', padding: '0 10px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap:5}}>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Почта: </span>{app?.email}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Файл: </span>
                            {app?.file_path ? (
                                <a href={`http://localhost:8000/${app.file_path}`} target="_blank" rel="noopener noreferrer">
                                     <Typography.Text>{app.file_path.split('/').pop()}</Typography.Text>
                                </a>
                            ) : (
                                <Typography.Text type="secondary">Файл не загружен</Typography.Text>
                            )}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Описание: </span>{app?.comments || 'Нет описания'}
                        </Typography.Title>

                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                             <span style={{fontWeight: 600}}>Сроки (из заявки): </span>{app?.deadline || 'Не указаны'}
                         </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Стоимость: </span>
                            {isPriceSet ? (
                                 <Tag style={{fontSize:16}} color="green" bordered={false}>{app.price}₽</Tag>
                            ) : (
                                 <Typography.Text type="secondary">Не оценена</Typography.Text>
                            )}
                        </Typography.Title>
                         {app.status === REJECTED_STATUS && app.comments && (
                             <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400, color: 'red'}} level={5}>
                                 <span style={{fontWeight: 600}}>Причина отклонения: </span>{app.comments}
                             </Typography.Title>
                         )}
                    </div>
                    <img
                        style={{borderRadius:10, transition: 'all ease .4s'}}
                        width={"45%"}
                        src={getStatusImage(app.status)}
                        alt={`Статус: ${app.status}`}
                    />
                </Flex>
            </ConfigProvider>

            <Flex gap={20}>
                {app.status !== REJECTED_STATUS && !COMPLETED_STATUSES.includes(app.status) && (
                     <Button
                         onClick={() => setDrawer(true)}
                         style={{padding: '0.5rem 1rem', borderRadius: 10}}
                     >
                         Отклонить
                     </Button>
                 )}

                {app.status === 'sent_for_evaluation' && (
                    <Button
                        style={{ padding: '0.5rem 1rem', borderRadius: 10 }}
                        onClick={handleNextStatus}
                    >
                        Принять заявку
                    </Button>
                )}

                {app.status === 'accepted_evaluation' && (
                    <Button
                        style={{ padding: '0.5rem 1rem', borderRadius: 10 }}
                        onClick={handleNextStatus}
                    >
                        Следующий шаг
                    </Button>
                 )}

                 {app.status === 'accepted_evaluation' && !isPriceSet && (
                      <Button
                          style={{ padding: '0.5rem 1rem', borderRadius: 10 }}
                          onClick={() => setDrawerPrice(true)}
                      >
                          Провести оценку
                      </Button>
                  )}

                 {app.status === 'accepted_evaluation' && (
                     <Button
                         onClick={handlePrevStatus}
                         style={{padding: '0.5rem 1rem', borderRadius: 10}}
                     >
                         Предыдущий шаг
                     </Button>
                 )}
                  {app.status === 'evaluated' && (
                      <Button
                          onClick={handlePrevStatus}
                          style={{padding: '0.5rem 1rem', borderRadius: 10}}
                      >
                          Предыдущий шаг
                      </Button>
                  )}

                {(app.status === 'accepted_evaluation' || app.status === 'evaluated') && (
                    <Button
                        onClick={() => {
                            setDrawerResources(true);
                            resourceForm.resetFields(); // Сбрасываем форму перед загрузкой новых данных
                            fetchOrderResources(); // Загружаем ресурсы при открытии Drawer
                        }}
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                    >
                        Указать ресурсы
                    </Button>
                )}

            </Flex>

            <Drawer
                title="Отклонение заявки"
                placement="left"
                closable={true}
                onClose={() => {setDrawer(false); setInputRejectReason(''); setInputRejectError('');}}
                open={drawer}
                style={{fontSize:22}}
                getContainer={false}
            >
                <Typography.Title style={{fontWeight:400, fontSize:18, marginBottom:20}}>Напишите почему заявка отклонена</Typography.Title>
                <ConfigProvider
                    theme={{
                        components: {
                        Input: {
                            activeBorderColor: '#e6cea4',
                            hoverBorderColor: '#e6cea4'
                        },
                        },
                    }}
                >
                    <Input.TextArea
                         showCount
                         maxLength={500}
                         style={{fontSize:18, marginBottom:10, height:120}}
                         value={inputRejectReason}
                         onChange={(e) => {setInputRejectReason(e.target.value); setInputRejectError('');}}
                    />
                </ConfigProvider>
                {inputRejectError && <Typography.Text type="danger" style={{display: 'block', marginBottom:10}}>{inputRejectError}</Typography.Text>}
                <Button onClick={handleRejectApplication}>Отправить</Button>
            </Drawer>

            <Drawer
                title="Оценка заявки"
                placement="left"
                closable={true}
                onClose={() => {setDrawerPrice(false); setInputPriceError('');}}
                open={drawerPrice}
                style={{fontSize:22}}
                getContainer={false}
            >
                <Typography.Title style={{fontWeight:400, fontSize:18, marginBottom:20}}>Напишите стоимость заявки (₽)</Typography.Title>
                <Flex gap={10}>
                    <ConfigProvider
                        theme={{
                            components: {
                            Input: {
                                activeBorderColor: '#e6cea4',
                                hoverBorderColor: '#e6cea4'
                            },
                            },
                        }}
                    >
                        <Input
                             style={{fontSize:18, flexGrow: 1}}
                            status={inputPriceError ? "error" : ""}
                             value={inputPrice}
                             onChange={(e) => {setInputPrice(e.target.value); setInputPriceError('');}}
                             placeholder="Введите стоимость"
                             type="number"
                             min="0"
                        />
                    </ConfigProvider>
                    <Button onClick={handleEvaluatePrice} style={{borderRadius:"7px", flexShrink: 0}}>Готово</Button>
                </Flex>
                {inputPriceError && <Typography.Text type="danger" style={{display: 'block', marginTop:10}}>{inputPriceError}</Typography.Text>}
            </Drawer>

            <Drawer
                title={`Ресурсы для Заказа №${app?.order_number || app?.id}`}
                placement="right"
                closable={true}
                onClose={() => setDrawerResources(false)}
                open={drawerResources}
                width={500}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form
                    form={resourceForm}
                    onFinish={handleSaveResources}
                    onFinishFailed={(errorInfo) => { // ДОБАВЛЕНО: Логирование ошибок валидации формы
                        console.error("Form onFinishFailed triggered with errorInfo:", errorInfo);
                        message.error('ОШИБКА ВАЛИДАЦИИ ФОРМЫ! Проверьте введенные данные и консоль.');
                    }}
                    autoComplete="off"
                    initialValues={{ resources: [] }} // Начальные значения для Form.List
                >
                    <Form.List name="resources">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'type_resource']}
                                            rules={[{ required: true, message: 'Выберите тип ресурса!' }]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Select
                                                placeholder="Тип ресурса"
                                                style={{ width: 180 }}
                                                options={RESOURCE_TYPES_OPTIONS}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'resource_count']}
                                            rules={[
                                                { required: true, message: 'Укажите количество!' },
                                                { type: 'number', min: 1, message: 'Минимум 1!' },
                                            ]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <InputNumber // Используем InputNumber
                                                placeholder="Количество"
                                                min={1} // min проп InputNumber
                                                style={{ width: 100 }}
                                            />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} style={{ fontSize: 20, color: '#999' }} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add({ resource_count: 1 })} block icon={<PlusOutlined />} style={{width: 'auto'}}>
                                        Добавить ресурс
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            borderTop: '1px solid #e8e8e8',
                            padding: '10px 16px',
                            background: '#fff',
                            textAlign: 'right',
                        }}
                    >
                        <Button onClick={() => setDrawerResources(false)} style={{ marginRight: 8 }}>
                            Отмена
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Сохранить ресурсы
                        </Button>
                    </div>
                </Form>
            </Drawer>

        </Card>
    )
}