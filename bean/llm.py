from typing import List, MutableSet
from pydantic import BaseModel

# 数据模型
class LLM(BaseModel):
    id: int
    name: str
    vendor: str
    intro: str
    tags: List[str]
    url: str
    vote_count: int = 0
    icon: str = ""
    voters: set[str] = []
    voted: bool = False
