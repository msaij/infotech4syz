from datetime import datetime, date
import pytz
from database import get_async_database
from typing import Optional

def get_ist_now() -> datetime:
    """Get current time in Indian Standard Time"""
    ist = pytz.timezone('Asia/Kolkata')
    return datetime.now(ist)

def get_ist_date() -> date:
    """Get current date in Indian Standard Time"""
    return get_ist_now().date()

def generate_challan_number() -> str:
    """Generate delivery challan number in format MMYY000001"""
    ist_now = get_ist_now()
    month = ist_now.strftime('%m')
    year = ist_now.strftime('%y')
    return f"{month}{year}"

async def get_next_sequence_number() -> int:
    """Get the next sequence number for the current month"""
    db = await get_async_database()
    collection = db.deliveryChallan_tracker
    
    # Get current month prefix
    month_prefix = generate_challan_number()
    
    # Find the highest sequence number for current month
    pipeline = [
        {
            "$match": {
                "delivery_challan_number": {"$regex": f"^{month_prefix}"}
            }
        },
        {
            "$addFields": {
                "sequence": {
                    "$toInt": {
                        "$substr": ["$delivery_challan_number", 4, 6]
                    }
                }
            }
        },
        {
            "$group": {
                "_id": None,
                "max_sequence": {"$max": "$sequence"}
            }
        }
    ]
    
    result = await collection.aggregate(pipeline).to_list(1)
    
    if result and result[0]['max_sequence']:
        return result[0]['max_sequence'] + 1
    else:
        return 1

async def generate_delivery_challan_number() -> str:
    """Generate complete delivery challan number"""
    month_prefix = generate_challan_number()
    sequence = await get_next_sequence_number()
    return f"{month_prefix}{sequence:06d}"

def validate_ist_date(date_value: date) -> bool:
    """Validate if date is in IST and not in future"""
    ist_date = get_ist_date()
    return date_value <= ist_date

def format_date_for_display(date_value: date) -> str:
    """Format date for display in DD/MM/YYYY format"""
    return date_value.strftime('%d/%m/%Y')

def parse_date_from_string(date_string: str) -> Optional[date]:
    """Parse date from string in DD/MM/YYYY format"""
    try:
        return datetime.strptime(date_string, '%d/%m/%Y').date()
    except ValueError:
        return None 