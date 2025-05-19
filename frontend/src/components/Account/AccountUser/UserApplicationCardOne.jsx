import { useState, useEffect } from "react";
import { Layout, Typography, Card, Steps, Flex, ConfigProvider, message, Tag, Input } from "antd"
import app_reject from '../../../assets/app_reject.jpg'
import evaluation from '../../../assets/evaluation.jpg'
import pay from '../../../assets/pay.jpg'
import produced from '../../../assets/produced.jpg'
import production from '../../../assets/production.jpg'
import {Button} from "../../Button"
import { BulbFilled } from "@ant-design/icons";


export function UserApplicationCardOne({app, onStatusChange}) {
    const allStatuses = ['sent_for_evaluation', 'evaluated', 'paid_for', 'produced', 'sent']
    const [current, setCurrent] = useState(0);
    const [helpMessage, setHelpMessage] = useState('Заказ отправлен для оценивания')

    useEffect(() => {
        // Устанавливаем текущий шаг на основе статуса заявки
        const statusIndex = allStatuses.findIndex(status => status === app.status);
        if (app.status === 'sent_for_evaluation') {
            setHelpMessage('Заказ отправлен для оценивания')
        } else if (app.status === 'accepted_evaluation'){
            setHelpMessage('Заказ уже оценивается')
        }else if (app.status === 'evaluated'){
            setHelpMessage('Оценка прошла успешно, оплатите заказ')
        }else if (app.status === 'paid_for'){
            setHelpMessage('Заказ оплачен и отправлен на производство')
        }else if (app.status === 'produced'){
            setHelpMessage('Заказ готов')
        }else if (app.status === 'sent'){
            setHelpMessage('')
        }else if (app.status === 'accepted_production'){
            setHelpMessage('Заказ в проиводстве')
        }
        if (app.status === 'accepted_production'){
            setCurrent(2)
        }
        if (statusIndex !== -1 && app.status !== 'accepted_production' ) {
            setCurrent(statusIndex);
        }
    }, [app.status]);

    async function handlePay() {
        await onStatusChange(app.id, "paid_for")
    }
    const steps = [
        {
          title: 'Оценка',
          content: evaluation,
        },
        {
            title: 'Оплата',
            content: pay,
          },
          {
            title: 'Производство',
            content: production,
          },
          {
            title: 'Отправка',
            content: produced,
          },
    ];
    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));

    return (
        <Card style={{width: '90%', marginBottom:20}}>
            {(app.status !== 'sent' && app.status !== 'reject') && <Typography style={{fontSize:22, marginBottom:20}}>
                Заказ №<span style={{fontWeight:600}}>{app?.OrderId}</span>
            </Typography>}
            {app.status === 'sent' && <Flex align="center" justify="space-between">
                <Typography style={{fontSize:22, marginBottom:20}}>
                    Заказ №<span style={{fontWeight:600}}>{app?.OrderId}</span>
                </Typography>
                <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Заказ готов</Typography.Title>
            </Flex>}
            {app.status === 'reject' && <Flex align="center" justify="space-between">
                <Typography style={{fontSize:22, marginBottom:20}}>
                    Заказ №<span style={{fontWeight:600}}>{app?.OrderId}</span>
                </Typography>
                <Typography.Title style={{margin:0, fontWeight:400, color: 'red'}} level={4}>Заказ отклонен</Typography.Title>
            </Flex>}
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: 'rgb(224, 190, 121)',
                        colorBorderSecondary: 'rgb(218, 216, 239)'
                    },
                }}            
            >    
                {(app.status !== 'sent' && app.status !== 'reject') && <Steps progressDot items={items} current={current} />}
                {(app.status !== 'sent' && app.status !== 'reject') && <Flex gap={20} style={{marginLeft:30, marginTop:20}}>
                    <BulbFilled style={{color: 'rgb(225, 255, 0)', fontSize:22}} /><Typography.Text style={{fontSize:18}}>{helpMessage}</Typography.Text>
                </Flex>}
                <Flex justify="space-between" align="center" style={{margin: '20px 20px 0 20px', padding: '0 10px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap:5}}>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Почта: </span>{app?.email}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Файл: </span>{app?.file?.name || app?.file?.uid}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Описание: </span>{app?.description}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Сроки: </span>{app?.deadline}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Стоимость: </span><Tag style={{fontSize:16}} color="green" bordered={false}>{app?.paidFor}₽</Tag>
                        </Typography.Title>
                    </div>
                    {app.status === 'sent' && <img 
                        src="https://img.freepik.com/free-photo/3d-render-paper-clipboard-with-green-tick_107791-15840.jpg?t=st=1742913867~exp=1742917467~hmac=94a9a0272593b5667880a3fa2bb7d09e74b8be71af9a2f8a65b060acc1256fd7&w=996"
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"}/>}
                    {app.status === 'reject' && <img 
                        src={app_reject}
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"}/>}
                    {(app.status !=='sent' && app.status !== 'reject' &&
                        <img 
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"} 
                        src={steps[current]?.content} 
                    />
                    )}
                </Flex>
                {app.status === 'evaluated' &&
                    <Button onClick={handlePay} style={{padding: '0.5rem', marginLeft:30}}>Оплатить</Button>}
            </ConfigProvider>
        </Card>
    )
}