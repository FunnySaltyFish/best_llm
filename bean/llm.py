from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# 数据模型
class LLM(BaseModel):
    # 从 0 开始的自增 ID
    id: int
    # LLM 名称，如 ChatGPT
    name: str
    # 公司名称
    vendor: str
    # 简单的介绍，以中文。如：基于 GPT-3.5 的多语言模型
    intro: str
    # 所在厂商的国家或地区，如中国、美国、日本等
    region: str = ""
    # # 一些标签，如 OpenSource、<1B、10B、100B、1T、MultiLanguage（或特定支持的语言，如中文）、Code（擅长的方面，或 QA、Completion）、主要特性缩写 等
    tags: List[str] = list()
    # 官网地址
    url: str
    # 图标的 url 或 base64 编码
    icon: str = ""
    # 发布日期，如果尚未发布，则为 None
    publish_time: Optional[datetime] = None

    vote_count: int = 0
    voted: bool = False