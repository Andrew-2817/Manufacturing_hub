from pydantic import BaseModel

class ManufactureCreate(BaseModel):
    name: str
    geoip_lat: float
    geoip_lon: float

class Manufacture(ManufactureCreate):
    id: int

    class Config:
        orm_mode = True
