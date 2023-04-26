
import uvicorn
from fastapi import Depends, FastAPI, Form, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from bean.llm import LLM
from bean.contributor import Contributor
from config import *
from mongo_db import appDB
from utils.user_utils import find_or_create_user
from typing import List, Optional

DEFAULT_VOTE_NUM = 3

templates = Jinja2Templates(directory="templates")

# CORS 中间件配置
origins = [
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8000'
]

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 装饰器，修饰函数，使得能在被修饰的函数内部获取到请求的 IP 地址
def get_client_ip(request: Request) -> str:
    return request.headers.get('X-Forwarded-For') or request.headers.get("X-Real-IP") or request.client.host or ""


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
    

@app.get("/api/contributors")
async def get_contributors() -> list[Contributor]:
    return appDB.query_all(appDB.col_contributors)

@app.post("/api/users/vote_num")
async def get_vote_num(uid: str = Header("")):
    user = appDB.query_one(appDB.col_users, {'uid': uid})
    user = find_or_create_user(uid)
    return max(DEFAULT_VOTE_NUM - len(user.get('voted_llms', [])), 0)


# 获取 LLM 列表
@app.get('/api/llms')
async def get_llm_list(
    page: int = 1, 
    size: int = 10, 
    sort=[("vote_count", -1)], 
    client_ip: str = Depends(get_client_ip),
    uid: str = "",
) -> List[LLM]:
    print("client_ip: ", client_ip)
    user = find_or_create_user(uid)
    llms = appDB.query_paged(appDB.col_llms, page, size, sort)
    for llm in llms:
        # 通过 user.voted_llms 判断当前用户是否已经投过票
        llm['voted'] = llm["id"] in user.get('voted_llms', [])
    return llms


# 提交投票
@app.post('/api/llms/{llm_id}/vote')
async def vote(llm_id: int, client_ip: str = Depends(get_client_ip), uid: str = Header("")):
    print("uid", uid)
    user = find_or_create_user(uid)
    if len(user.get('voted_llms', [])) >= DEFAULT_VOTE_NUM:
        raise HTTPException(status_code=412, detail='You have reached the maximum number of votes')
    appDB.col_llms.update_one(
        {'id': llm_id}, {'$inc': {'vote_count': 1}})
    appDB.col_users.update_one(
        {'uid': uid}, {'$push': {'voted_llms': llm_id}})


# 撤销投票
@app.post('/api/llms/{llm_id}/revoke_vote')
async def revoke_vote(llm_id: int, client_ip: str = Depends(get_client_ip), uid: str = Header("")):
    voted_llms = appDB.query_one(appDB.col_users, {'uid': uid}).get('voted_llms', [])
    if llm_id not in voted_llms:
        raise HTTPException(status_code=412, detail='You have not voted yet')
    appDB.col_llms.update_one(
        {'id': llm_id}, {'$inc': {'vote_count': -1}, '$pull': {'voters': uid}})
    appDB.col_users.update_one(
        {'uid': uid}, {'$pull': {'voted_llms': llm_id}})


if __name__ == '__main__':
    uvicorn.run('best_llm:app', host='127.0.0.1', port=8000, reload=DEBUG,
                reload_excludes=[".history/**", "static/", "templates/"])
