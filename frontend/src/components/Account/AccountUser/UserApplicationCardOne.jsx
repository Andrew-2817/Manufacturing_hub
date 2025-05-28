import { useState, useEffect } from "react";
import { Layout, Typography, Card, Steps, Flex, ConfigProvider, message, Tag, Input } from "antd"
import app_reject from '../../../assets/app_reject.jpg'
import evaluation from '../../../assets/evaluation.jpg'
import pay from '../../../assets/pay.jpg'
import produced from '../../../assets/produced.jpg'
import production from '../../../assets/production.jpg'
// Импортируем sent.jpg, если он используется для "отправлено"
import sent from '../../../assets/sent.jpg'; // Убедитесь, что этот файл есть в assets

import {Button} from "../../Button"
import { BulbFilled } from "@ant-design/icons";


export function UserApplicationCardOne({app, onStatusChange}) {
    // allStatuses отражает шаги для клиента.
    // 'accepted_evaluation' и 'accepted_production' - это внутренние статусы отделов,
    // для клиента они агрегируются в "На оценке" и "На производстве".
    const USER_LIFECYCLE_STATUSES = ['sent_for_evaluation', 'evaluated', 'paid_for', 'produced', 'sent'];
    const [currentStepIndex, setCurrentStepIndex] = useState(0); // Используем другое имя для ясности
    const [helpMessage, setHelpMessage] = useState('Заказ отправлен для оценивания');

    useEffect(() => {
        let newHelpMessage = '';
        let newCurrentStepIndex = 0;

        switch (app.status) {
            case 'sent_for_evaluation':
                newHelpMessage = 'Заказ отправлен для оценивания';
                newCurrentStepIndex = 0;
                break;
            case 'accepted_evaluation': // Внутренний статус отдела, для пользователя - все еще "На оценке"
                newHelpMessage = 'Заказ уже оценивается технологическим отделом';
                newCurrentStepIndex = 0; // Для Steps пользователя, это все еще 0-й шаг (Оценка)
                break;
            case 'evaluated':
                newHelpMessage = 'Оценка прошла успешно, оплатите заказ';
                newCurrentStepIndex = 1; // 1-й шаг (Оплата)
                break;
            case 'paid_for':
                newHelpMessage = 'Заказ оплачен и отправлен на производство';
                newCurrentStepIndex = 2; // 2-й шаг (Производство)
                break;
            case 'accepted_production': // Внутренний статус производителя, для пользователя - все еще "На производстве"
                newHelpMessage = 'Заказ находится в производстве';
                newCurrentStepIndex = 2; // Для Steps пользователя, это все еще 2-й шаг (Производство)
                break;
            case 'produced':
                newHelpMessage = 'Заказ готов к отправке';
                newCurrentStepIndex = 3; // 3-й шаг (Отправка)
                break;
            case 'sent':
                newHelpMessage = ''; // Заказ выполнен, сообщение не нужно
                newCurrentStepIndex = 4; // 4-й шаг (Завершено)
                break;
            case 'reject':
                newHelpMessage = 'Ваш заказ был отклонен.'; // Отдельное сообщение для отклоненных
                newCurrentStepIndex = -1; // Не отображаем Steps
                break;
            default:
                newHelpMessage = '';
                newCurrentStepIndex = -1; // Неизвестный статус
        }

        setHelpMessage(newHelpMessage);
        setCurrentStepIndex(newCurrentStepIndex);

    }, [app.status]);

    // Обработчик оплаты
    async function handlePay() {
        if (app.price <= 0) {
            message.warning("Заказ еще не оценен или имеет нулевую стоимость.");
            return;
        }
        // Вызываем функцию onStatusChange, переданную от родителя, для обновления статуса на бэкенде
        await onStatusChange(app.id, { status: "paid_for" });
    }

    // Определяем шаги для отображения в Steps
    const steps = [
        {
          title: 'Оценка',
          content: evaluation, // Изображение для оценки
        },
        {
            title: 'Оплата',
            content: pay, // Изображение для оплаты
          },
          {
            title: 'Производство',
            content: production, // Изображение для производства
          },
          {
            title: 'Отправка',
            content: produced, // Изображение для отправки
          },
          {
            title: 'Завершено', // Добавляем шаг "Завершено"
            content: sent, // Изображение для завершенных/отправленных
          },
    ];

    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));

    // Определяем, когда показывать Steps
    const showSteps = app.status !== 'reject' && app.status !== 'sent';
    // Определяем, какое изображение показывать
    const getStatusImage = () => {
        if (app.status === 'reject') {
            return app_reject;
        }
        if (app.status === 'sent') {
            return sent; // Изображение для отправленных/завершенных
        }
        // Используем изображение из текущего шага. Если currentStepIndex = -1, то null
        return steps[currentStepIndex]?.content;
    };


    return (
        <Card style={{width: '100%', marginBottom:20}}>

            <Flex justify="space-between" align="center" style={{marginBottom:20}}>
                <Typography style={{fontSize:22}}>
                    Заказ №<span style={{fontWeight:600}}>{app?.order_number || app?.id}</span>
                </Typography>
                {app.status === 'sent' && <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Заказ выполнен</Typography.Title>}
                {app.status === 'reject' && <Typography.Title style={{margin:0, fontWeight:400, color: 'red'}} level={4}>Заказ отклонен</Typography.Title>}
                {app.status === 'sent_for_evaluation' && <Typography.Title style={{margin:0, fontWeight:400, color: 'orange'}} level={4}>На оценке</Typography.Title>}
                {app.status === 'accepted_evaluation' && <Typography.Title style={{margin:0, fontWeight:400, color: 'orange'}} level={4}>На оценке</Typography.Title>}
                {app.status === 'evaluated' && <Typography.Title style={{margin:0, fontWeight:400, color: 'blue'}} level={4}>Ожидает оплаты</Typography.Title>}
                {app.status === 'paid_for' && <Typography.Title style={{margin:0, fontWeight:400, color: 'purple'}} level={4}>Оплачен</Typography.Title>}
                {app.status === 'accepted_production' && <Typography.Title style={{margin:0, fontWeight:400, color: 'darkblue'}} level={4}>На производстве</Typography.Title>}
                {app.status === 'produced' && <Typography.Title style={{margin:0, fontWeight:400, color: 'darkgreen'}} level={4}>Готов</Typography.Title>}
            </Flex>

            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: 'rgb(224, 190, 121)',
                        colorBorderSecondary: 'rgb(218, 216, 239)'
                    },
                }}
            >

                {showSteps && (
                    <>
                        <Steps
                            progressDot
                            items={items}
                            current={currentStepIndex}
                        />

                        {helpMessage && (
                            <Flex gap={20} style={{marginLeft:30, marginTop:20}}>
                                <BulbFilled style={{color: 'rgb(225, 255, 0)', fontSize:22}} />
                                <Typography.Text style={{fontSize:18}}>{helpMessage}</Typography.Text>
                            </Flex>
                        )}
                    </>
                )}

                <Flex justify="space-between" align="center" style={{margin: '20px 20px 0 20px', padding: '0 10px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap:5}}>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Почта: </span>{app?.email}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Файл: </span>
                            {app?.file_path ? ( // Используем app.file_path
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
                            <span style={{fontWeight: 600}}>Сроки: </span>{app?.deadline || 'Не указаны'}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Стоимость: </span>
                            {app?.price > 0 ? ( // Используем app.price
                                <Tag style={{fontSize:16}} color="green" bordered={false}>{app.price}₽</Tag>
                            ) : (
                                <Typography.Text type="secondary">Не оценена</Typography.Text>
                            )}
                        </Typography.Title>
                        {app.status === 'reject' && app.comments && ( // Отображаем причину отклонения
                            <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400, color: 'red'}} level={5}>
                                <span style={{fontWeight: 600}}>Причина отклонения: </span>{app.comments}
                            </Typography.Title>
                        )}
                    </div>
                    <img
                        style={{borderRadius:10, transition: 'all ease .4s'}}
                        width={"45%"}
                        src={getStatusImage()}
                        alt={`Статус: ${app.status}`}
                    />
                </Flex>
                {app.status === 'evaluated' && app.price > 0 && (
                    <Button onClick={handlePay} style={{padding: '0.5rem', marginLeft:30}}>Оплатить</Button>
                )}
            </ConfigProvider>
        </Card>
    )
}