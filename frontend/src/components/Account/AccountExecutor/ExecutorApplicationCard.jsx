import { useState, useEffect } from "react";
import { Drawer, Typography, Card, Steps, Flex, ConfigProvider, message, Tag } from "antd"
// Импортируем Button, так как он используется
import {Button} from "../../Button"
// Импортируем изображения
import app_reject from '../../../assets/app_reject.jpg'
import accept from '../../../assets/accept.jpg' // Принято в производство
import produced from '../../../assets/produced.jpg' // Завершено производство
import production from '../../../assets/production.jpg' // На производстве
import sent from '../../../assets/sent.jpg' // Отправлено/Выполнено


export function ExecutorApplicationCard({app, onStatusChange}) {
    // Определяем жизненный цикл статусов для производителя
    const EXECUTOR_LIFECYCLE_STATUSES = ['paid_for','accepted_production', 'produced', 'sent'];
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Effect для определения текущего шага Steps на основе статуса заказа
    useEffect(() => {
        // Находим индекс текущего статуса в EXECUTOR_LIFECYCLE_STATUSES
        const statusIndex = EXECUTOR_LIFECYCLE_STATUSES.findIndex(status => status === app.status);
        if (statusIndex !== -1) {
            setCurrentStepIndex(statusIndex);
        } else {
            // Если статус не найден в EXECUTOR_LIFECYCLE_STATUSES (например, 'evaluated' или 'reject'),
            // это не должно отображаться на шкале прогресса производителя.
            // Для 'paid_for' (начальный статус для производителя), index будет 0.
            setCurrentStepIndex(0); // По умолчанию на первый шаг
        }
    }, [app.status]);

    // Обработчик перехода к следующему статусу
    async function handleNextStatus() {
        const currentStatus = app.status;
        const currentStatusIndex = EXECUTOR_LIFECYCLE_STATUSES.findIndex(el => el === currentStatus);

        // Если текущий статус не найден или уже является последним в цепочке производителя
        if (currentStatusIndex === -1 || currentStatusIndex >= EXECUTOR_LIFECYCLE_STATUSES.length - 1) {
            message.warning('Заказ уже имеет конечный статус или неактивен для изменений.');
            return;
        }

        const newStatus = EXECUTOR_LIFECYCLE_STATUSES[currentStatusIndex + 1];

        // Вызываем onStatusChange, переданный от родителя
        await onStatusChange(app.id, { status: newStatus });
    }

    // Обработчик перехода к предыдущему статусу
    async function handlePrevStatus() {
        const currentStatus = app.status;
        const currentStatusIndex = EXECUTOR_LIFECYCLE_STATUSES.findIndex(el => el === currentStatus);

        // Нельзя вернуться назад, если текущий статус не в шкале прогресса или он первый шаг
        if (currentStatusIndex <= 0) {
            message.warning('Нельзя вернуться назад из текущего статуса.');
            return;
        }

        const newStatus = EXECUTOR_LIFECYCLE_STATUSES[currentStatusIndex - 1];

        // Вызываем onStatusChange, переданный от родителя
        await onStatusChange(app.id, { status: newStatus });
    }

    // Определяем шаги для отображения в Steps
    const steps = [
        {
            title: 'Принято в производство',
            content: accept, // Изображение для 'accepted_production'
            status: 'accepted_production'
        },
        {
            title: 'На производстве',
            content: production, // Изображение для 'produced'
            status: 'produced'
        },
        {
            title: 'Готово',
            content: produced, // Изображение для 'sent' (готово к отправке)
            status: 'sent'
        },
    ];

    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));

    // Определяем, когда показывать Steps и кнопки
    const showControls = app.status !== 'sent'; // Показывать, пока статус не 'sent' (завершено)
    // Изображение статуса
    const getStatusImage = () => {
        if (app.status === 'sent') {
            return sent; // Изображение для завершенного (отправленного)
        }
        // Если статус 'paid_for', то это "Новый" для производителя, можно показать accept или что-то нейтральное
        if (app.status === 'paid_for') {
            return accept; // Или другое изображение
        }
        const step = steps.find(step => step.status === app.status);
        return step ? step.content : null;
    };


    return (
        <Card style={{width: '100%', position: 'relative', overflow: 'hidden', marginBottom:20}}>
            <Flex justify="space-between" align="center" style={{marginBottom:20}}>
                <Typography style={{fontSize:22}}>
                    Заказ №<span style={{fontWeight:600}}>{app?.order_number || app?.id}</span>
                </Typography>
                {app.status === 'sent' && <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Выполнен</Typography.Title>}
                {app.status === 'paid_for' && <Typography.Title style={{margin:0, fontWeight:400, color: 'orange'}} level={4}>Новый заказ</Typography.Title>}
                {app.status === 'accepted_production' && <Typography.Title style={{margin:0, fontWeight:400, color: 'blue'}} level={4}>В производстве</Typography.Title>}
                {app.status === 'produced' && <Typography.Title style={{margin:0, fontWeight:400, color: 'darkgreen'}} level={4}>Готов к отправке</Typography.Title>}
            </Flex>

            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: 'rgb(224, 190, 121)',
                        colorBorderSecondary: 'rgb(218, 216, 239)'
                    },
                }}
            >
                {showControls && ( // Показывать Steps, пока заказ не отправлен
                    <Steps progressDot
                        items={items}
                        current={EXECUTOR_LIFECYCLE_STATUSES.findIndex(el => el === app.status) -1} // -1 потому что 'paid_for' это 0-й статус, но его нет в steps.items
                    />
                )}
                <Flex justify="space-between" align="center" style={{margin: '20px 0', padding: '0 10px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap:5}}>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Почта заказчика: </span>{app?.email}
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
                            <span style={{fontWeight: 600}}>Сроки (заявки): </span>{app?.deadline || 'Не указаны'}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Стоимость: </span><Tag style={{fontSize:16}} color="green" bordered={false}>{app?.price}₽</Tag>
                        </Typography.Title>
                        {app.assigned_manufacturer_name && (
                            <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                                <span style={{fontWeight: 600}}>Назначен производитель: </span>{app.assigned_manufacturer_name}
                            </Typography.Title>
                        )}
                    </div>
                    <img
                        src={getStatusImage()}
                        style={{borderRadius:10, transition: 'all ease .4s'}}
                        width={"45%"}
                        alt={`Статус: ${app.status}`}
                    />
                </Flex>
            </ConfigProvider>
            <Flex gap={20}>
                {app.status === 'paid_for' && (
                    <Button
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        onClick={handleNextStatus}
                    >
                        Принять в производство
                    </Button>
                )}
                {app.status === 'accepted_production' && (
                    <>
                        <Button
                            onClick={handlePrevStatus}
                            style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        >
                            Предыдущий шаг
                        </Button>
                        <Button
                            style={{padding: '0.5rem 1rem', borderRadius: 10}}
                            onClick={handleNextStatus}
                        >
                            Следующий шаг
                        </Button>
                    </>
                )}
                {app.status === 'produced' && (
                    <>
                        <Button
                            onClick={handlePrevStatus}
                            style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        >
                            Предыдущий шаг
                        </Button>
                        <Button
                            isActive={true}
                            style={{padding: '0.5rem 1rem', borderRadius: 10}}
                            onClick={handleNextStatus}
                        >
                            Отправить заказ
                        </Button>
                    </>
                )}
            </Flex>
        </Card>
    )
}