from pydantic import BaseModel
from typing import Optional

class ResourceCreate(BaseModel):
    manufacture_id: int
    type_resource: str
    ready_time: int

class Resource(ResourceCreate):
    id: int

    class Config:
        orm_mode = True

class ResourceUpdate(BaseModel):
    type_resource: Optional[str] = None
    ready_time: Optional[int] = None
