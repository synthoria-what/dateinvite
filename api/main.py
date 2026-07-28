from dataclasses import dataclass
import datetime
import os
from zoneinfo import ZoneInfo

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from aiogram import Bot
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://frontend:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEEKDAYS = (
    "понедельник",
    "вторник",
    "среду",
    "четверг",
    "пятницу",
    "субботу",
    "воскресенье",
)

MONTHS = (
    "",
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
)

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

    def formatted_date(self) -> str:
        local_date = self.date.astimezone(
            ZoneInfo("Asia/Yekaterinburg")
        )

        weekday = WEEKDAYS[local_date.weekday()]
        month = MONTHS[local_date.month]

        return (
            f"в {weekday}, "
            f"{local_date.day} {month}, "
            f"в {local_date:%H:%M}"
        )

    def text(self) -> str:
        return f"{self.message} {self.formatted_date()}"
    

@app.post("/send_notification")
async def send_notification(message: NotificationMessage):
    # print(message)
    # print(message.notify_at)
    
    bot_message = BotMessage(message=f"{os.getenv('BOT_MESSAGE')}", date=message.notify_at)
    
    try:
        async with Bot(token=os.getenv("TELEGRAM_TOKEN")) as bot:
            await bot.send_message(os.getenv("MY_CHAT_ID"), text=bot_message.text())
        return {"status": status.HTTP_200_OK,
                "message": "notification sended"
                }
    except Exception as ex:
        return {"status": status.HTTP_400_BAD_REQUEST,
                "message": f"notification didnt sended, error: {ex}"
                }