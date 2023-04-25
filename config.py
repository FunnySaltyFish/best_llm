from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv(), override=True)

# MongoDB 配置
MONGO_URI = os.getenv('MONGO_URI', f"mongodb://localhost:27017")