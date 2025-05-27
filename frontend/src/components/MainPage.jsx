import { Layout, Carousel, ConfigProvider, Card, Typography, Flex, Drawer } from "antd"
import {PlusCircleTwoTone, InfoCircleOutlined } from "@ant-design/icons";
// import { useTRPS } from "../../context"; // useTRPS здесь больше не используется для location, только для currentUser
import { useTRPS } from "../../context"; // Оставляем для currentUser
import { UserOrder } from "./Client/UserOrder";
import { SliderEl } from "./Client/SliderEl";
import { useState } from "react";
// Импортируем useLocation
import { useLocation } from "react-router-dom";

const {Content}  = Layout
export function MainPage(){
    // Получаем location напрямую из react-router-dom
    const location = useLocation();
    // Получаем currentUser из контекста useTRPS, если он нужен в MainPage
    const { currentUser } = useTRPS(); // Убедитесь, что currentUser используется в MainPage, если нет - эту строку тоже можно удалить

    console.log(location); // Логируем location

    const generateShuffledFourDigitNumbers = () => {
      const numbers = [];
      for (let i = 1000; i <= 9999; i++) {
        numbers.push(i);
      }
      // Перемешиваем массив
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      return numbers;
    };


    const [shuffledNumbers, setShuffledNumbers] = useState(generateShuffledFourDigitNumbers());
    const [selectedNumber, setSelectedNumber] = useState(null);

    const handleSelectNumber = () => {
      setDrawer(true)
      if (shuffledNumbers.length > 0) {
        const newNumber = shuffledNumbers.pop(); // Берём последнее число из массива
        setSelectedNumber(newNumber);
        setShuffledNumbers([...shuffledNumbers]); // Обновляем массив
      } else {
        // Если числа закончились, генерируем новый набор
        setShuffledNumbers(generateShuffledFourDigitNumbers());
        // Возможно, здесь нужно сразу выбрать первое число из нового набора
        const newNumbers = generateShuffledFourDigitNumbers();
        const newNumber = newNumbers.pop();
        setSelectedNumber(newNumber);
        setShuffledNumbers(newNumbers);
      }
    };

    const contentStyle = {
        width: '75%',
        minHeight: '85vh',
        margin: '20px auto',
        // position: 'relative'
    }
    const [drawer, setDrawer] = useState(false)

    return(
        <Content style={contentStyle}>
            <div className="slider">
            <ConfigProvider
            theme={{
                components: {
                Carousel: {
                    arrowOffset: -50,
                    // arrowSize: 30
                },
                },
            }}
            >
                {(location.pathname ==='/user' && currentUser) && ( // Теперь location получаем напрямую, currentUser из контекста
                    <div onClick={() => handleSelectNumber()} style={{position: 'fixed', top: '15%', right: '1%', zIndex: 100, cursor: 'pointer',textAlign: 'center', padding: '0.5rem', border: '1px solid rgb(248, 187, 80)', borderRadius:"10px"}} className="buy">
                        <Typography.Title style={{fontWeight: 400}} level={5}>Оформить заказ</Typography.Title>
                        <PlusCircleTwoTone style={{fontSize:30}} twoToneColor={"#e2b932"} />
                    </div>
                )}
                {location.pathname === '/user' && <div style={{marginTop:100}}></div>}
                {location.pathname === '/department' && <Flex style={{marginTop:100, marginLeft:20}} gap={20} align="center"><InfoCircleOutlined style={{fontSize:25, color: 'rgb(226, 185, 50)'}} /><Typography style={{fontSize:18}}>Для просмотра заявок перейдите в <span style={{fontWeight:600}}>Личный кабинет</span></Typography></Flex>}
                {location.pathname === '/executor' && <Flex style={{marginTop:100, marginLeft:20}} gap={20} align="center"><InfoCircleOutlined style={{fontSize:25, color: 'rgb(226, 185, 50)'}} /><Typography style={{fontSize:18}}>Для просмотра заказов перейдите в <span style={{fontWeight:600}}>Личный кабинет</span></Typography></Flex>}

                <Carousel style={{marginBottom:80, marginTop: 20}} autoplay  arrows={false}>
                <SliderEl
                    name={"slider_image1"}
                    title={"Агрегатор производственных услуг"}
                    text={<><p>— это инновационная платформа, которая помогает клиентам находить надежных производителей деталей на заказ.</p> <p>Наша цель — сделать процесс заказа деталей быстрым, прозрачным и беззаботным для каждого клиента</p></>}
                    buttonText={"Сделать заказ"}
                    // Кнопка "Сделать заказ" ведет к открытию Drawer с формой заказа.
                    // Открывать Drawer имеет смысл только для авторизованного пользователя.
                    // Если пользователь не авторизован, кнопка должна вести на страницу логина,
                    // или Drawer должен сообщать о необходимости авторизации.
                    // Сейчас Drawer открывается независимо от авторизации, но отправка возможна только при наличии currentUser (логика в UserOrder.jsx)
                    // Пока оставим так, как было, но в будущем можно уточнить эту логику.
                    onClick={() => setDrawer(true)}

                />
                <SliderEl
                    name={"slider_image2"}
                    title={"Технический отдел"}
                    text={<><p>Наш технический отдел оперативно оценивает стоимость заказа после оформления заявки.</p><p>Мы гарантируем прозрачность расчетов и индивидуальный подход к каждому проекту.</p></> }
                    buttonText={"Подробнее"}
                    // Кнопка "Подробнее" сейчас не ведет никуда.
                    // В будущем можно добавить ссылку на страницу с информацией о отделе.
                    onClick={() => { /* Логика для "Подробнее" */ }} // Добавляем пустую функцию onClick
                />
                <SliderEl
                    name={"slider_image3"}
                    title={"Профессионалы своего дела"}
                    text={<><p>Наши инженеры и технологи имеют многолетний опыт работы в производстве деталей.</p><p>Каждый специалист проходит регулярное обучение для работы с современным оборудованием.</p></> }
                    buttonText={"Подробнее"}
                     // Кнопка "Подробнее" сейчас не ведет никуда.
                    // В будущем можно добавить ссылку на страницу с информацией о производителях.
                    onClick={() => { /* Логика для "Подробнее" */ }} // Добавляем пустую функцию onClick
                />
                <SliderEl
                    name={"slider_image4"}
                    title={"Рассчитайте стоимость заказа"}
                    text={<><p>Узнайте предварительную стоимость вашего заказа прямо сейчас.</p><p>Просто заполните короткую форму, и наш технический отдел оперативно свяжется с вами для уточнения деталей</p></>}
                    buttonText={"Рассчитать стимость"}
                     // Эта кнопка также ведет к открытию Drawer с формой заказа.
                    onClick={() => setDrawer(true)}
                />
                </Carousel>
                </ConfigProvider>
                </div>
                <div style={{marginBottom: 50}} className="our_advantages">
                    <Typography.Title style={{color: '#e2b932', fontWeight:400}} level={2}>Наши преимущесва</Typography.Title>
                    <Flex gap={90} justify="space-between" align="center">
                        <img style={{borderRadius:20}} width={'45%'} src="https://avatars.mds.yandex.net/i?id=4f20430d2de554cab397ed38c3b6bcce_l-5233675-images-thumbs&ref=rim&n=13&w=3000&h=2000" alt="" />
                        <ul className="markers" style={{display: 'flex', flexDirection: 'column', gap: 25, fontSize: 20}}>
                            <li>Высокое качество продукции благодаря современному оборудованию </li>
                            <li>Индивидуальный подход к каждому клиенту.</li>
                            <li>Короткие сроки выполнения заказов.</li>
                            <li>Гарантия на все виды продукции.</li>
                        </ul>
                    </Flex>
                </div>
                <div style={{marginBottom: 50}} className="how_place_order">
                    <Typography.Title style={{color: '#e2b932', fontWeight:400}} level={2}>Как оформить заказ</Typography.Title>
                    <Flex gap={90} justify="space-between" align="center">
                        <img style={{borderRadius:20}} width={'45%'} src="https://www.susu.ru/sites/default/files/images/hj.jpg" alt="" />
                        <ul style={{display: 'flex', flexDirection: 'column', gap: 25, fontSize: 20, listStyle: 'none'}}>
                            <li>
                                <Flex gap={15} align="center">
                                    <p style={{padding: "0.3rem 0.85rem"}} className="marker_num">1</p>
                                    <div className="how_place_order_text">
                                        <Typography.Title style={{fontWeight:400}} level={4}>Оформить заявку на производство детали</Typography.Title>
                                    </div>
                                </Flex>
                                <Typography style={{marginLeft: "12%"}}>Начните с оформления заявки, подробно описав техническое задание и прикрепив необходимые чертежи. Это поможет нам точно понять ваши требования и предложить оптимальное решение.</Typography>
                            </li>
                            <li>
                                <Flex gap={15} align="center">
                                    <p style={{padding: "0.3rem 0.8rem"}} className="marker_num">2</p>
                                    <div className="how_place_order_text">
                                        <Typography.Title style={{fontWeight:400}} level={4}>Отправить заявку в технический отдел</Typography.Title>
                                    </div>
                                </Flex>
                                <Typography style={{marginLeft: "12%"}}>После оформления заявки она будет направлена в наш технический отдел для детального анализа и расчета стоимости. Мы свяжемся с вами в кратчайшие сроки с предварительной оценкой.</Typography>
                            </li>
                            <li>
                                <Flex gap={15} align="center">
                                    <p style={{padding: "0.3rem 0.8rem"}} className="marker_num">3</p>
                                    <div className="how_place_order_text">
                                        <Typography.Title style={{fontWeight:400}} level={4}>Обсудить детали и оплатить заказ</Typography.Title>
                                    </div>
                                </Flex>
                                <Typography style={{marginLeft: "12%"}}>Как только стоимость будет рассчитана, наш специалист свяжется с вами для обсуждения всех нюансов заказа. После согласования деталей вы сможете оформить оплату, и мы приступим к производству.</Typography>
                            </li>
                        </ul>
                    </Flex>
                </div>
                {(location.pathname === '/user') && <UserOrder isOpen={drawer} onClose={() => setDrawer(false)} selectedNumber={selectedNumber}/>}
        </Content>
    )
}