import { useState, useEffect } from "react";
import { Drawer, Typography, Card, Steps, Flex, ConfigProvider, message, Input, Tag } from "antd";
import { Button } from "../../Button"; // Импортируем Button

// Импортируем изображения
import app_reject from '../../../assets/app_reject.jpg';
import completed from '../../../assets/completed.jpg';
import evaluation from '../../../assets/evaluation.jpg';
import accept from '../../../assets/accept.jpg';
// Изображения production и sent используются у исполнителя, здесь не нужны для логики отдела
// import production from '../../../assets/production.jpg';
// import sent from '../../../assets/sent.jpg';


// Определяем шаги для отображения статусов в Steps для отдела
const DEPARTMENT_STEPS = [
    {
        title: 'Принята отделом',
        content: accept, // Изображение для статуса 'accepted_evaluation'
        status: 'accepted_evaluation', // Соответствующий статус в БД
    },
    {
        title: 'На оценке',
        content: evaluation, // Изображение для статуса 'evaluated'
        status: 'evaluated',
    },
];

// Определяем статусы, которые считаются "завершенными" для отображения картинки "completed"
const COMPLETED_STATUSES = ['evaluated', 'paid_for', 'accepted_production', 'produced', 'sent'];
const REJECTED_STATUS = 'reject';


export function DepartmentApplicationCard({ app, onUpdate }) {
    const [drawer, setDrawer] = useState(false);
    const [drawerPrice, setDrawerPrice] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [inputRejectReason, setInputRejectReason] = useState('');
    const [inputRejectError, setInputRejectError] = useState('');
    const [inputPrice, setInputPrice] = useState('');
    const [inputPriceError, setInputPriceError] = useState('');
    const [isPriceSet, setIsPriceSet] = useState(false);


    // Effect для определения текущего шага Steps на основе статуса заявки
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

    // Обработчик перехода к следующему статусу
    async function handleNextStatus() {
        const currentStatus = app.status;
        console.log("handleNextStatus: currentStatus", currentStatus);

        let newStatus = null;

        if (currentStatus === 'sent_for_evaluation') {
            // Из "новой" переходим в "принята отделом"
            newStatus = 'accepted_evaluation';
        } else if (currentStatus === 'accepted_evaluation') {
            // Принята отделом -> На оценке (статус 'evaluated')
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

    // Обработчик перехода к предыдущему статусу
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

    // Обработчик отклонения заявки
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

    // Обработчик подтверждения оценки цены
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

    // ИЗМЕНЕНО: Helper function to get the image for the current status
    const getStatusImage = (status) => {
        if (status === REJECTED_STATUS) {
            return app_reject;
        }
        if (status === 'sent_for_evaluation') { // ДОБАВЛЕНО: для статуса "Новая"
            return accept; // Используем изображение "Принято", или можно добавить отдельное изображение
        }
        if (COMPLETED_STATUSES.includes(status)) {
            return completed;
        }
        const step = DEPARTMENT_STEPS.find(step => step.status === status);
        return step ? step.content : null;
    }

    // Определяем, отображать ли Steps и кнопки управления статусом для отдела
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
        </Card>
    )
}