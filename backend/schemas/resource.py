from pydantic import BaseModel

class ResourceCreate(BaseModel):
    manufacture_id: int
    type_resource: str
    resource_count: int


class Resource(ResourceCreate):
    id: int

    class Config:
        orm_mode = True
