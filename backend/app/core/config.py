from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb+srv://admin:admin123@cluster0.mongodb.net/attendance_db?retryWrites=true&w=majority"
    JWT_SECRET: str = "supersecretkey123" # Change this in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
