import asyncio

from aiogram import Bot, Dispatcher
from aiogram.filters import Command, CommandStart
from dotenv import load_dotenv
import os

load_dotenv()


async def main():
    bot = Bot(os.getenv("TELEGRAM_TOKEN"))
    
    dp = Dispatcher()
    
    @dp.message(CommandStart())
    async def send_hellow():
        print("heelo worlds")
        
        
    await dp.start_polling(bot)
    
if __name__ == "__main__":
    print("start bot")
    asyncio.run(main())