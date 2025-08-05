# Updated Timing Rules for Attendance System

## New Business Logic Requirements

### Timing Categories
The system now needs to distinguish between two timing categories based on check-in time:

#### **Regular Timing**
- **Check-in Window**: Between 9:30 AM - 10:01 AM
- **Required Work Hours**: 8 hours 45 minutes
- **Rule**: If total work hours < 8h45m → Mark as **Half Day**
- **Rule**: If total work hours ≥ 8h45m → Mark as **Full Day**

#### **Unusual Timing** 
- **Check-in Window**: Before 9:30 AM OR after 10:01 AM
- **Required Work Hours**: 9 hours
- **Rule**: If total work hours < 9h → Mark as **Half Day**
- **Rule**: If total work hours ≥ 9h → Mark as **Full Day**

## Implementation Requirements

### Work Hours Calculation
- Calculate total work time from punch data: (OutTime2 - InTime1) - (InTime2 - OutTime1)
- Account for lunch break duration properly
- Handle cases where lunch punches might be missing

### Status Determination Logic
```
1. Extract first punch time (InTime1) to determine timing category
2. Calculate total work hours from all punch times
3. Apply appropriate hour threshold based on timing category
4. Mark as Full Day or Half Day accordingly
```

### Integration with Existing System
- This replaces the current simple present/absent logic
- Still maintains weekdays-only processing for INN department
- Still uses punch-based time extraction from columns C to AJ
- Adds complexity to status calculation beyond just late/early detection

## Questions for Implementation
1. Should "Half Day" be a new status code or modify existing status?
2. How to handle cases with missing lunch punches when calculating total hours?
3. Should weekends and holidays still use existing logic?
4. What should happen if punch data is insufficient to calculate total hours?