from fastapi import FastAPI
# import backend.models.init_db
from backend.api import user_api, resource_api, order_api, \
                 manufacture_api, order_resource_api, \
                 manufacture_user_api, manufacture_order_api

app = FastAPI()
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
