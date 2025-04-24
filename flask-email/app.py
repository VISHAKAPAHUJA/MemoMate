from flask import Flask, jsonify
from flask_mail import Mail, Message
from apscheduler.schedulers.background import BackgroundScheduler
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
import os
import atexit
from bson import ObjectId
import logging

# Fix for Windows console encoding
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('reminder_service.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

app = Flask(__name__)

# Configuration
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME='talentmatch.ats@gmail.com',
    MAIL_PASSWORD='wxou vsub pkvk yduu',
    MAIL_DEFAULT_SENDER=('Event Reminder', 'talentmatch.ats@gmail.com')
)

# Initialize extensions
mail = Mail(app)
scheduler = BackgroundScheduler()

# MongoDB Connection
try:
    client = MongoClient('mongodb://localhost:27017/eventDB')
    db = client.get_database()
    logging.info("✅ Connected to MongoDB")
except Exception as e:
    logging.error(f"❌ MongoDB connection error: {e}")
    raise

def send_reminder(app, email, event_title, event_time):
    """Send email reminder with proper application context"""
    try:
        with app.app_context():
            msg = Message(
                subject=f'⏰ Reminder: {event_title}',
                recipients=[email],
                body=f'''
                You have an upcoming event:
                
                Event: {event_title}
                Time: {event_time.strftime('%A, %B %d at %I:%M %p %Z')}
                
                Don't forget to prepare!
                '''
            )
            mail.send(msg)
            logging.info(f"📧 Successfully sent reminder to {email}")
            return True
    except Exception as e:
        logging.error(f"❌ Failed to send email to {email}: {str(e)}")
        return False

def check_events(app):
    """Check for events needing reminders with proper app context"""
    try:
        now = datetime.now(timezone.utc)
        look_ahead = now + timedelta(minutes=30)
        
        logging.info(f"\n⏰ Checking events from {now} to {look_ahead}")
        
        # Find events where reminder should be sent
        events = list(db.events.find({
            'reminderTimeCalculated': {
                '$gte': now - timedelta(minutes=5),  # 5 minute look-back window
                '$lte': look_ahead
            },
            'reminderSent': False,
            'start': {'$gt': now}  # Only future events
        }))
        
        logging.info(f"🔍 Found {len(events)} events needing reminders")
        
        for event in events:
            try:
                event_time = event['start'].replace(tzinfo=timezone.utc)
                reminder_time = event['reminderTimeCalculated'].replace(tzinfo=timezone.utc)
                
                logging.info(f"\nProcessing: {event['title']}")
                logging.info(f"Event time: {event_time}")
                logging.info(f"Reminder time: {reminder_time}")
                
                user = db.users.find_one({'_id': ObjectId(event['user'])})
                if not user or not user.get('email'):
                    logging.warning(f"⚠️ User not found or has no email for event {event['_id']}")
                    continue
                
                # Send reminder with app context
                if send_reminder(app, user['email'], event['title'], event_time):
                    db.events.update_one(
                        {'_id': event['_id']},
                        {'$set': {'reminderSent': True}}
                    )
                    logging.info("✅ Reminder processed successfully")
                    
            except Exception as e:
                logging.error(f"⚠️ Error processing event {event.get('_id')}: {str(e)}")
                continue
                
    except Exception as e:
        logging.error(f"❌ Fatal error in reminder check: {str(e)}")
        raise

def create_scheduler(app):
    """Create and configure scheduler with app context"""
    scheduler = BackgroundScheduler()
    
    def job_with_context():
        with app.app_context():
            check_events(app)
    
    scheduler.add_job(
        func=job_with_context,
        trigger='interval',
        minutes=5,
        next_run_time=datetime.now(timezone.utc) + timedelta(seconds=30),
        id='event_reminder_job'
    )
    return scheduler

@app.route('/test')
def test():
    """Test endpoint to manually trigger reminders"""
    check_events(app)
    return jsonify({'status': 'checked events'})

if __name__ == '__main__':
    try:
        scheduler = create_scheduler(app)
        scheduler.start()
        atexit.register(lambda: scheduler.shutdown())
        
        logging.info(f"⏰ Next reminder check at: {scheduler.get_jobs()[0].next_run_time}")
        logging.info("🚀 Starting Event Reminder Service")
        
        app.run(host='0.0.0.0', port=5001, debug=False)
    except Exception as e:
        logging.error(f"❌ Failed to start application: {str(e)}")
        if 'scheduler' in locals():
            scheduler.shutdown()