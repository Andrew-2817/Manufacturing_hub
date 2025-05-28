export function Button({children, isActive, onClick, style, htmlType}){
    return (
        <button
            style={style}
            type={htmlType || "button"} // Если htmlType передан, используем его, иначе 'button'
            onClick={onClick}
            className={isActive ? "content_tabs content_tabs_active" : "content_tabs"}
        >
            {children}
        </button>
    );
}