from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

# from files.models import StackedMBTIModel
from files.get_posts import process_posts  # import the function from get_posts.py
from files.supabase_utils import get_user_posts
import files.make_prediction 
import asyncio


app = FastAPI()

class Post(BaseModel):
    content: str
    # Add any other fields you expect

class PingRequest(BaseModel):
    user_id: str
    posts: List[Post]


@app.post("/ping")
async def ping(data: PingRequest):
    print(f"✅ Ping from {data.user_id}")
    post = await asyncio.to_thread (get_user_posts, data.user_id)  # fetch posts from Supabase

    print(f"Got {len(post)} posts from Supabase.")

    predictions = []

    for i, p in enumerate(post, start=1):
        print(f"Post #{i}: {p}")
        mbti = files.make_prediction.predict_mbti(p)
        print(f"Predicted MBTI: {mbti}")
        predictions.append(mbti)

    return {
        "message": "pong",
        "user_id_received": data.user_id,
        "posts_received": len(post),
        "mbti_predictions": predictions
    }
