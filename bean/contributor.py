from pydantic import BaseModel

class Contributor(BaseModel):
    name: str
    link: str
