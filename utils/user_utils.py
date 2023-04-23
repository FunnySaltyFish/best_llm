from mongo_db import appDB
from datetime import datetime
from typing import Any

def find_or_create_user(uid: str) -> dict[str, Any]:
    user = appDB.query_one(appDB.col_users, {'uid': uid})
    if not user:
        appDB.col_users.insert_one({'uid': uid, 'voted_llms': [], "create_time": datetime.now()})
        user = {'voted_llms': []}
    return user