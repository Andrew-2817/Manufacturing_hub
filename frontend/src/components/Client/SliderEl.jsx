import { Layout, Carousel, ConfigProvider, Card, Typography } from "antd"
import { Button } from "../Button";
export function SliderEl({name, title, text, buttonText, onClick}){
    const sliderElStyle = {
        margin: 0,
        height: '55vh',
        color: '#fff',
        textAlign: 'center',
        borderRadius: 20,
        display: 'flex',
        alignItems: "center"
      };
    return(
        <div className={name}>
            <div style={sliderElStyle} >
                <div style={{marginLeft: 30, width:"40%", backdropFilter: "blur(25px)", padding: '1.5rem', borderRadius: 15}}>
                    <Typography.Title style={{color:"#ccc", fontWeight:400}}  level={2}>{title}</Typography.Title>
                    <Typography style={{textAlign: 'left', marginBottom:20, color: '#ccc'}}>{text}</Typography>
                    <Button isActive onClick={onClick}>{buttonText} </Button>
                </div>
            </div>
        </div>
    )
}