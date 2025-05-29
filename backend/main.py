from fastapi import FastAPI
from backend.api import user_api, resource_api, order_api, \
                 manufacture_api, order_resource_api, \
                 manufacture_user_api, manufacture_order_api
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",

]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
