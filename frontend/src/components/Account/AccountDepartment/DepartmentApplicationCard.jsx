import { useState, useEffect } from "react";
import { Drawer, Typography, Card, Steps, Flex, ConfigProvider, message, Input, Tag } from "antd" // Добавляем Tag для стоимости
import axios from "axios"; // Axios нужен для потенциального прямого запроса, но будем использовать onUpdate от родителя
import {Button} from "../../Button"
// Импортируем изображения
import app_reject from '../../../assets/app_reject.jpg'
import completed from '../../../assets/completed.jpg' // Это изображение для завершенных заказов пользователя, возможно, нужно другое для отдела
import evaluation from '../../../assets/evaluation.jpg' // Оценка
import accept from '../../../assets/accept.jpg' // Принять заявку (может быть, картинка для 'sent_for_evaluation')
import production from '../../../assets/production.jpg' // Производство (для исполнителя)
import sent from '../../../assets/sent.jpg' // Отправлено (для исполнителя)


// Определяем шаги для отображения статусов в Steps для отдела
const DEPARTMENT_STEPS = [
    {
        title: 'Принята отделом',
        content: accept, // Изображение для статуса 'accepted_evaluation' (принято для оценки)
        status: 'accepted_evaluation', // Соответствующий статус в БД
    },
    {
        title: 'На оценке',
        content: evaluation, // Изображение для статуса 'evaluated' (оценена)
        status: 'evaluated',
    },
    // Статус 'sent_for_evaluation' (новая заявка) не отображается на шкале прогресса здесь,
    // т.к. первый шаг "Принять заявку" переводит ее в 'accepted_evaluation'
];

// Определяем статусы, которые считаются "завершенными" для отображения картинки "completed"
const COMPLETED_STATUSES = ['evaluated', 'paid_for', 'accepted_production', 'produced', 'sent'];
const REJECTED_STATUS = 'reject';


export function DepartmentApplicationCard({app, onUpdate}) { // Принимаем объект заявки app и функцию onUpdate от родителя
    const [drawer, setDrawer] = useState(false); // Drawer для отклонения
    const [drawerPrice, setDrawerPrice] = useState(false); // Drawer для установки цены
    const [currentStep, setCurrentStep] = useState(0); // Текущий шаг для Steps
    const [inputRejectReason, setInputRejectReason] = useState(''); // Причина отклонения
    const [inputRejectError, setInputRejectError] = useState(''); // Ошибка ввода причины отклонения
    const [inputPrice, setInputPrice] = useState(''); // Введенная цена
    const [inputPriceError, setInputPriceError] = useState(''); // Ошибка ввода цены
    const [evaluatedStatus, setEvaluatedStatus] = useState(false); // Флаг, была ли оценка введена в Drawer

    // Effect для определения текущего шага Steps на основе статуса заявки
    useEffect(() => {
        // Если заявка отклонена или завершена, Steps не отображаются, или отображается конечный статус
        if (app.status === REJECTED_STATUS || COMPLETED_STATUSES.includes(app.status)) {
             setCurrentStep(DEPARTMENT_STEPS.length); // Устанавливаем шаг как "завершенный" (вне шкалы)
        } else {
             // Ищем текущий статус в списке шагов для отдела
             const statusIndex = DEPARTMENT_STEPS.findIndex(step => step.status === app.status);
             // Если статус найден, устанавливаем соответствующий шаг
             // Если статус 'sent_for_evaluation' (новое), он не в списке, останется 0
             setCurrentStep(statusIndex !== -1 ? statusIndex : 0);
        }

         // Если заявка уже оценена на бэкенде (т.е. price > 0), считаем ее "оцененной" для фронта
         if (app.price > 0 && app.status !== REJECTED_STATUS) {
             setEvaluatedStatus(true);
         } else {
             setEvaluatedStatus(false);
         }


    }, [app.status, app.price]); // Запускаем эффект при изменении статуса или цены заявки

    // Обработчик перехода к следующему статусу
    async function handleNextStatus() {
        // Определяем текущий статус и находим его в списке шагов
        const currentStatusIndex = DEPARTMENT_STEPS.findIndex(step => step.status === app.status);

        // Если текущий статус не найден в списке шагов для прогресса (например, 'sent_for_evaluation' или уже финальный)
        if (currentStatusIndex === -1) {
             // Если это 'sent_for_evaluation', следующий статус - первый шаг ('accepted_evaluation')
             if (app.status === 'sent_for_evaluation') {
                 await onUpdate(app.id, { status: DEPARTMENT_STEPS[0].status });
             } else {
                  // Если это уже финальный статус или отклонен, предупреждаем
                  message.warning('Заявка уже имеет конечный статус.');
             }
             return;
        }

        // Определяем следующий статус из списка шагов
        const nextStatusIndex = currentStatusIndex + 1;
        if (nextStatusIndex < DEPARTMENT_STEPS.length) {
             const newStatus = DEPARTMENT_STEPS[nextStatusIndex].status;

             // Если следующий статус - 'evaluated' (оценка), и цена еще не установлена,
             // открываем Drawer для ввода цены
             if (newStatus === 'evaluated' && !evaluatedStatus) {
                  setDrawerPrice(true);
                  return; // Не переходим к следующему статусу пока цена не введена
             }

             // Отправляем обновление статуса на бэкенд
             await onUpdate(app.id, { status: newStatus });

        } else {
             message.warning('Заявка уже имеет конечный статус.');
        }
    }

    // Обработчик перехода к предыдущему статусу
    async function handlePrevStatus() {
         const currentStatusIndex = DEPARTMENT_STEPS.findIndex(step => step.status === app.status);

         // Нельзя вернуться назад, если текущий статус не в шкале прогресса или он первый шаг
         if (currentStatusIndex <= 0) {
             message.warning('Нельзя вернуться назад из текущего статуса.');
             return;
         }

         const prevStatusIndex = currentStatusIndex - 1;
         const newStatus = DEPARTMENT_STEPS[prevStatusIndex].status;

         // Отправляем обновление статуса на бэкенд
         await onUpdate(app.id, { status: newStatus });
    }

    // Обработчик отклонения заявки
    async function handleRejectApplication() {
        if (inputRejectReason.trim() !== '') {
            setInputRejectError('');
            // Отправляем обновление статуса на 'reject' и сохраняем причину в comments
            await onUpdate(app.id, { status: REJECTED_STATUS, comments: inputRejectReason.trim() });
            setDrawer(false); // Закрываем Drawer
            setInputRejectReason(''); // Очищаем поле ввода
        } else {
            setInputRejectError('Заполните поле с причиной отклонения.');
        }
    }

    // Обработчик подтверждения оценки цены
    async function handleEvaluatePrice() {
        const priceValue = parseFloat(inputPrice);
        if (!isNaN(priceValue) && priceValue > 0) { // Проверяем, что введено число больше 0
            setInputPriceError('');
             // Отправляем обновление цены на бэкенд
            await onUpdate(app.id, { price: priceValue });
             // После установки цены, можем попытаться перейти к следующему статусу (evaluated)
             // Это произойдет в handleNextStatus после закрытия drawerPrice или можно вызвать его явно
             // setEvaluatedStatus(true); // Устанавливаем флаг, чтобы кнопка "Завершить" стала активной
            setDrawerPrice(false); // Закрываем Drawer
            // setInputPrice(''); // Очищать поле ввода после успешной оценки
             // Можно вызвать handleNextStatus здесь, чтобы сразу перейти к "Завершено",
             // но логичнее оставить его привязанным к кнопке на карточке, которую нажмут после оценки.
             message.success('Стоимость успешно сохранена.'); // Сообщение о сохранении цены

        } else {
            setInputPriceError("Введите корректное число больше нуля.");
        }
    }

     // Helper function to get the image for the current status
     const getStatusImage = (status) => {
        if (status === REJECTED_STATUS) {
             return app_reject;
        }
        if (COMPLETED_STATUSES.includes(status)) {
             return completed; // Или другое изображение для завершенных отделом
        }
         // Ищем изображение в шагах для отдела
        const step = DEPARTMENT_STEPS.find(step => step.status === status);
        return step ? step.content : null; // Возвращаем изображение шага или null
     }

     // Определяем текст для текущего статуса для Steps (если отображается)
     const getStepStatusText = (status) => {
         const step = DEPARTMENT_STEPS.find(step => step.status === status);
         return step ? step.title : ''; // Возвращаем заголовок шага
     }

     // Определяем, отображать ли Steps и кнопки управления статусом
     const showStepsAndControls = app.status !== REJECTED_STATUS && !COMPLETED_STATUSES.includes(app.status);


    return (
        <Card style={{width: '100%', position: 'relative', overflow: 'hidden', marginBottom:20}}>
            <Flex justify="space-between" align="center" style={{marginBottom:20}}>
                <Typography style={{fontSize:22}}>
                    Заявка №<span style={{fontWeight:600}}>{app?.order_number || app?.id}</span>
                </Typography>
                {app.status === REJECTED_STATUS && <Typography.Title style={{margin:0, fontWeight:400, color: 'red'}} level={4}>Отклонена</Typography.Title>}
                {COMPLETED_STATUSES.includes(app.status) && <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Завершена (Передано производителю)</Typography.Title>}
            </Flex>

            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: 'rgb(224, 190, 121)',
                        colorBorderSecondary: 'rgb(218, 216, 239)'
                    },
                }}
            >
                {showStepsAndControls && (
                    <Steps
                        progressDot
                         // Items для Steps теперь берутся из DEPARTMENT_STEPS
                        items={DEPARTMENT_STEPS.map((item, index) => ({
                            key: item.status, // Используем статус как key
                            title: item.title,
                             // Отображаем текущий статус как активный
                            status: index === currentStep ? 'process' : (index < currentStep ? 'finish' : 'wait'),
                        }))}
                        current={currentStep}
                        // onChange={setCurrentStep} // Отключаем изменение шага кликом, только кнопками
                    />
                 )}


                <Flex justify="space-between" align="center" style={{margin: '20px 0', padding: '0 10px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap:5}}>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Почта: </span>{app?.email}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Файл: </span>
                            {app?.file_path ? ( // Проверяем наличие file_path
                                // Отображаем имя файла (можно извлечь из пути)
                                // В будущем здесь может быть ссылка для скачивания
                                <Typography.Text>{app.file_path.split('/').pop()}</Typography.Text>
                            ) : (
                                <Typography.Text type="secondary">Файл не загружен</Typography.Text> // Если файла нет
                            )}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Описание: </span>{app?.comments}
                        </Typography.Title>

                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                             <span style={{fontWeight: 600}}>Сроки (из заявки): </span>{app?.deadline || 'Не указаны'}
                         </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Стоимость: </span>
                            {app?.price > 0 ? ( // Если цена установлена (больше 0)
                                 <Tag style={{fontSize:16}} color="green" bordered={false}>{app.price}₽</Tag>
                            ) : (
                                 <Typography.Text type="secondary">Не оценена</Typography.Text> // Если цена 0 или не установлена
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
                        alt={`Status: ${app.status}`}
                    />
                </Flex>
            </ConfigProvider>

            {showStepsAndControls && (
                <Flex gap={20}>
                    <Button
                        onClick={() => setDrawer(true)} // Открываем Drawer отклонения
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                    >
                        Отклонить
                    </Button>
                     {currentStep === 0 && ( // Если текущий шаг 0 (соответствует sent_for_evaluation или accepted_evaluation)
                         <Button
                             style={{ padding: '0.5rem 1rem', borderRadius: 10 }}
                             onClick={handleNextStatus} // Переходим к следующему шагу (accepted_evaluation -> evaluated)
                         >
                             Принять заявку
                         </Button>
                     )}
                     {currentStep > 0 && currentStep < DEPARTMENT_STEPS.length -1 && ( // Если не первый и не последний шаг в шкале
                         <Button
                             style={{ padding: '0.5rem 1rem', borderRadius: 10 }}
                             onClick={handleNextStatus} // Переходим к следующему шагу
                         >
                             Следующий шаг
                         </Button>
                     )}
                      {currentStep === DEPARTMENT_STEPS.length - 1 && ( // Если последний шаг в шкале (evaluated)
                         // Кнопка "Завершить" активна только если цена установлена
                         evaluatedStatus ? (
                              <Button
                                 isActive // Делаем кнопку активной визуально
                                 style={{ padding: '0.5rem 1rem', borderRadius: 10 }}
                                 onClick={handleNextStatus} // Переходим к следующему статусу (evaluated -> передан производителю)
                             >
                                 Завершить оценку
                             </Button>
                         ) : (
                             <Button
                                 style={{ padding: '0.5rem 1rem', borderRadius: 10 }}
                                 onClick={() => setDrawerPrice(true)} // Открываем Drawer цены
                             >
                                 Провести оценку
                             </Button>
                         )
                      )}
                    {currentStep > 0 && (
                        <Button
                            onClick={handlePrevStatus}
                            style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        >
                            Предыдущий шаг
                        </Button>
                    )}
                </Flex>
            )}



            <Drawer
                title="Отклонение заявки"
                placement="left"
                closable={true}
                onClose={() => {setDrawer(false); setInputRejectReason(''); setInputRejectError('');}} // Сбрасываем состояние при закрытии
                open={drawer}
                style={{fontSize:22}}
                getContainer={false} // Рендерим внутри родителя (для Card)
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
                         maxLength={500} // Ограничиваем длину причины
                         style={{fontSize:18, marginBottom:10, height:120}} // Уменьшаем отступ снизу для ошибки
                         value={inputRejectReason}
                         onChange={(e) => {setInputRejectReason(e.target.value); setInputRejectError('');}} // Сбрасываем ошибку при вводе
                    ></Input.TextArea>
                </ConfigProvider>
                {inputRejectError && <Typography.Text type="danger" style={{display: 'block', marginBottom:10}}>{inputRejectError}</Typography.Text>}
                <Button onClick={handleRejectApplication}>Отправить</Button>
            </Drawer>


            <Drawer
                title="Оценка заявки"
                placement="left"
                closable={true}
                onClose={() => {setDrawerPrice(false); setInputPrice(''); setInputPriceError('');}} // Сбрасываем состояние при закрытии
                open={drawerPrice}
                style={{fontSize:22}}
                getContainer={false} // Рендерим внутри родителя
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
                             style={{fontSize:18, width: '100%'}} // Устанавливаем ширину 100%
                            status={inputPriceError ? "error" : ""} // Отображаем статус ошибки
                             value={inputPrice}
                             onChange={(e) => {setInputPrice(e.target.value); setInputPriceError('');}} // Сбрасываем ошибку при вводе
                             placeholder="Введите стоимость" // Добавляем placeholder
                             type="number" // Устанавливаем тип number для клавиатуры на мобильных и базовой валидации браузера
                             min="1" // Минимальное значение
                        />
                    </ConfigProvider>
                    <Button onClick={handleEvaluatePrice} style={{borderRadius:"7px", flexShrink: 0}}>Готово</Button>
                </Flex>
                {inputPriceError && <Typography.Text type="danger" style={{display: 'block', marginTop:10}}>{inputPriceError}</Typography.Text>}
            </Drawer>
        </Card>
    )
}