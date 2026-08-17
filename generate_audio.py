import asyncio
import os
import edge_tts

VOICE = "fa-IR-DilaraNeural"

# Feedback audio files configuration
# We use cheerful pitch and rate settings suited for children
AUDIO_FILES = {
    "public/audio/correct/correct_01.mp3": "آفرین! عالی بود!",
    "public/audio/correct/correct_02.mp3": "بی‌نظیری! درست حساب کردی!",
    "public/audio/correct/correct_03.mp3": "چقدر باهوشی! پاسخ صحیح است!",
    "public/audio/wrong/wrong_01.mp3": "دوباره تلاش کن، حتماً می‌تونی!",
    "public/audio/wrong/wrong_02.mp3": "نزدیک بود! یک بار دیگه دقت کن.",
    "public/audio/wrong/wrong_03.mp3": "اشکال نداره عزیزم، دوباره فکر کن.",
    "public/audio/instructions/game_start.mp3": "بریم بازی رو شروع کنیم! آماده‌ای؟",
    "public/audio/rewards/level_complete.mp3": "هورااا! این مرحله با موفقیت تموم شد!",
    "public/audio/rewards/reward_star.mp3": "تبریک می‌گم! یک ستاره‌ی طلایی جدید گرفتی!",
    "public/audio/rewards/reward_badge.mp3": "مدال جدید باز شد! آفرین به تو قهرمان!",
}

async def generate():
    for filepath, text in AUDIO_FILES.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        print(f"Generating {filepath} -> '{text}'")
        communicate = edge_tts.Communicate(
            text=text,
            voice=VOICE,
            rate="+8%",
            pitch="+18Hz"
        )
        await communicate.save(filepath)
    print("Done generating feedback audio files!")

if __name__ == "__main__":
    asyncio.run(generate())
