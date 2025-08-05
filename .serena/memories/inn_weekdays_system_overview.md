# INN Department Weekdays-Only Attendance System

## System Identity
- **Name**: INN Department Weekdays-Only Attendance Automater
- **Version**: 2.0 - INN Department Weekdays-Only Edition
- **Purpose**: Dedicated attendance system for INN department employees with weekdays-only processing

## Core Features
- **Department Focus**: INN Department Only
- **Processing Policy**: Weekdays Only (Monday-Friday)
- **Weekend Policy**: Automatically Excluded (Saturday, Sunday)
- **Excel Support**: Four Punch attendance system format

## Key Configuration
- Department Filter: INN_ONLY (hard-coded)
- Working Days: Monday, Tuesday, Wednesday, Thursday, Friday
- Excluded Days: Saturday (St), Sunday (S)
- Check-in Deadline: 10:01 AM
- Check-out Minimum: 6:30 PM (18:30)

## Processing Logic
1. Filter Excel files for INN department employees only
2. Parse day headers from row 6 (M, T, W, Th, F vs St, S)
3. Process only weekday attendance data
4. Exclude weekends from all calculations and statistics
5. Generate comprehensive weekdays-only analysis

## User Interface
- INN-branded hero section with department badge
- Upload section with INN-specific messaging
- Results section with weekdays-only notice
- Clear indication this is an INN-dedicated system

## System Startup Message
Displays detailed information about INN-only, weekdays-only processing policy with clear feature breakdown.
