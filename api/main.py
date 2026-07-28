from dataclasses import dataclass
import datetime
import os

from fastapi import FastAPI, Request
from aiogram import Bot
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

class NotificationMessage(BaseModel):
    notify_at: datetime.datetime

    @field_validator("notify_at")
    @classmethod
    def remove_seconds(cls, value: datetime.datetime) -> datetime.datetime:
        return value.replace(second=0, microsecond=0)

@dataclass
class BotMessage:
    message: str
    date: datetime.datetime
    

@app.post("/send_notification")
async def send_notification(message: NotificationMessage):
    # print(message)
    # print(message.notify_at)
    
    bot_message = BotMessage(message=f"Встреча составлена, она будет в {message.notify_at}", date=message.notify_at)
    
    
    async with Bot(token=os.getenv("TELEGRAM_TOKEN")) as bot:
        bot.send_message(os.getenv("MY_CHAT_ID"), text=bot_message.message)