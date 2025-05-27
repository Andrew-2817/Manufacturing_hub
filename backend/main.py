from fastapi import FastAPI
# import backend.models.init_db
from backend.api import user_api, resource_api, order_api, \
                 manufacture_api, order_resource_api, \
                 manufacture_user_api, manufacture_order_api
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",  # Разрешаем запросы с адреса, где запущен ваш фронтенд
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    # Добавьте другие адреса, если ваш фронтенд будет работать не на localhost:5173
]

# Добавляем middleware для обработки CORS запросов
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Список разрешенных источников
    allow_credentials=True, # Разрешаем передачу куки, заголовков авторизации и TLS сертификатов в CORS запросах
    allow_methods=["*"], # Разрешаем все HTTP методы (GET, POST, PUT, DELETE, PATCH и т.д.)
    allow_headers=["*"], # Разрешаем все заголовки в запросах, включая Authorization (для токенов)
)

app.include_router(user_api.router)
app.include_router(resource_api.router)
app.include_router(order_api.router)
app.include_router(manufacture_api.router)
app.include_router(order_resource_api.router)
app.include_router(manufacture_user_api.router)
app.include_router(manufacture_order_api.router)


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI!"}
