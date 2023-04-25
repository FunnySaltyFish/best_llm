import pymongo
from pymongo.collection import Collection
from config import MONGO_URI

class DB():
    def __init__(self) -> None:
        # uri = "mongodb+srv://funny:<password>@bestllm.fh2pqjw.mongodb.net/?retryWrites=true&w=majority"
        uri = MONGO_URI
        print("mongo uri: ", uri)
        self.client = pymongo.MongoClient(uri)
        self.db = self.client["db_best_llm"]
        self.col_llms = self.db["llms"]
        self.col_users = self.db["users"]
        self.col_contributors = self.db["contributors"]


    def query_lasted(self, col: Collection, default={}):
        t = col.find_one(sort=[('_id', -1)])
        if t is not None:
            return t
        else:
            return default

    def remove_id(self, data: dict):
        data.pop("_id")

    def query_paged(self, col: Collection, page: int = 0, size: int = 20, sort: list = None, filter: dict = None):
        """分页查询，page从0开始"""
        size = int(size)
        page = int(page)
        return self.query_all(col, filter=filter, skip=page*size, limit=size, sort=sort)

    def query_one(self, col: Collection, filter: dict = {}, projection: dict = {"_id": False}, sort: list = None, **args) -> dict:
        if isinstance(sort, str):
            # 传入的sort格式为
            # [('_id', -1)]
            try:
                sort = eval(sort)
            except Exception:
                sort = None
        return col.find_one(filter=filter, projection=projection, sort=sort, **args)

    def query_all(self, col: Collection, filter: dict = {}, projection: dict = {"_id": False}, sort: list = None, **args) -> list:
        if isinstance(sort, str):
            # 传入的sort格式为
            # [('_id', -1)]
            try:
                sort = eval(sort)
            except Exception:
                sort = None
        return [each for each in col.find(filter=filter, projection=projection, sort=sort, **args)]


appDB = DB()

if __name__ == "__main__":
    # data = {
    #     "name": "产品1",
    #     "vendor": "公司1",
    #     "intro": "这是产品1的介绍",
    #     "tags": ["标签1", "标签2"],
    #     "url": "http://www.example.com/product1",
    #     "vote_count": 5
    # }
    # import json
    # arr = json.load(open("llms.json", "r", encoding="utf-8"))
    # print(len(arr))
    # appDB.col_llms.insert_many(arr)
    # print("done")

    from pymongo.server_api import ServerApi
    from pymongo.mongo_client import MongoClient
    import json
    import datetime
    try:
        appDB.client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
        arr = json.load(open("llms.json", "r", encoding="utf-8"))
        for each in arr:
            if each.get("publish_time"):
                each["publish_time"] = datetime.datetime.strptime(each["publish_time"], "%Y-%m-%dT%H:%M:%SZ")
            appDB.col_llms.update_one({'id': each["id"]}, {"$set": each}, upsert=True)
        print("finish insert all")
    except Exception as e:
        print(e)
