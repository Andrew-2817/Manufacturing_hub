export function Button({children,isActive, onClick, style}){
    return <button style={style} type="button" onClick={onClick} className={isActive ? "content_tabs content_tabs_active" : "content_tabs"}>{children}</button>
}