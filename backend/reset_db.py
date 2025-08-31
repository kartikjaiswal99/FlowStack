from database import engine, SessionLocal
import models

def reset_database():
    # Drop all tables
    models.Base.metadata.drop_all(bind=engine)
    
    # Recreate all tables
    models.Base.metadata.create_all(bind=engine)
    
    print("Database reset successfully!")

if __name__ == "__main__":
    reset_database()