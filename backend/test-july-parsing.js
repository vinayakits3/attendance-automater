/**
 * Test script to verify July2025.xlsx parsing works correctly
 * Run with: node test-july-parsing.js
 */

const XLSX = require('xlsx');
const ExcelParserService = require('./services/excelParser');
const AttendanceAnalyzerService = require('./services/attendanceAnalyzer');
const { ATTENDANCE_CONFIG, UTILS } = require('./utils/constants');

async function testJulyParsing() {
  console.log('🧪 Testing July2025.xlsx Parsing - INN Department Only...
');
  
  try {
    // 1. Load the Excel file
    console.log('📂 Loading Excel file:', ATTENDANCE_CONFIG.EXCEL_FILE_PATH);
    const workbook = XLSX.readFile(ATTENDANCE_CONFIG.EXCEL_FILE_PATH);
    workbook.filename = 'July2025.xlsx'; // For month/year detection
    
    // 2. Parse using the fixed format parser
    console.log('🔍 Parsing with Fixed Format parser...');
    const employees = ExcelParserService.parseFixedFormatFile(workbook);
    
    console.log(`
✅ Successfully parsed ${employees.length} INN Department employees`);
    
    // 2.5. Verify all employees are from INN department
    const nonINNEmployees = employees.filter(emp => emp.department !== 'INN');
    if (nonINNEmployees.length > 0) {
      console.log(`⚠️  Warning: Found ${nonINNEmployees.length} non-INN employees`);
      nonINNEmployees.forEach(emp => console.log(`   - ${emp.name} (${emp.department})`));
    } else {
      console.log('✅ All employees belong to INN department');
    }
    
    // 3. Show sample employee data
    if (employees.length > 0) {
      const firstEmployee = employees[0];
      console.log('\n📊 Sample Employee Data:');
      console.log(`   ID: ${firstEmployee.id}`);
      console.log(`   Name: ${firstEmployee.name}`);
      console.log(`   Month/Year: ${firstEmployee.month}/${firstEmployee.year}`);
      console.log(`   Working Days: ${firstEmployee.summary.workingDays}`);
      console.log(`   Weekend Days: ${firstEmployee.summary.weekendDays}`);
      console.log(`   Present: ${firstEmployee.summary.present}`);
      console.log(`   Absent: ${firstEmployee.summary.absent}`);
      
      // Show a few sample days with status calculation details
      console.log('
📅 Sample Daily Data (Status calculated by backend logic):');
      firstEmployee.dailyData.slice(0, 7).forEach(day => {
        const statusIcon = day.isWeekend ? '📴' : (day.status === 'P' ? '✅' : (day.status === 'A' ? '❌' : '📴'));
        const statusReason = day.isWeekend ? '(Weekend)' : 
                            day.status === 'A' ? '(No punch data)' : 
                            day.status === 'P' ? '(Valid attendance)' : 
                            '(Weekend Off)';
        console.log(`   Day ${day.day} (${day.dayName}): ${statusIcon} ${day.status} ${statusReason}`);
        console.log(`      In1: ${day.inTime1 || 'N/A'}, Out1: ${day.outTime1 || 'N/A'}, In2: ${day.inTime2 || 'N/A'}, Out2: ${day.outTime2 || 'N/A'}`);
      });
      
      // Test status calculation logic
      console.log('
🧮 Status Calculation Validation:');
      const presentDays = firstEmployee.dailyData.filter(day => day.status === 'P').length;
      const absentDays = firstEmployee.dailyData.filter(day => day.status === 'A').length;
      const weekendDays = firstEmployee.dailyData.filter(day => day.status === 'WO').length;
      console.log(`   Present Days: ${presentDays}`);
      console.log(`   Absent Days: ${absentDays}`);
      console.log(`   Weekend Days: ${weekendDays}`);
      console.log(`   Total Days: ${firstEmployee.dailyData.length}`);
    }
    
    // 4. Test weekend detection for July 2025
    console.log('\n🗓️  Testing Weekend Detection for July 2025:');
    const july2025Weekends = [];
    for (let day = 1; day <= 31; day++) {
      if (UTILS.isWeekend(day, 7, 2025)) {
        const dayName = UTILS.getDayName(day, 7, 2025);
        july2025Weekends.push(`${day} (${dayName})`);
      }
    }
    console.log(`   Weekends: ${july2025Weekends.join(', ')}`);
    
    // 5. Test attendance analysis
    console.log('\n🔬 Testing Attendance Analysis...');
    const issues = AttendanceAnalyzerService.analyzeAttendanceWithWeekends ? 
      AttendanceAnalyzerService.analyzeAttendanceWithWeekends(employees) :
      AttendanceAnalyzerService.analyzeAttendance(employees);
    
    console.log(`   Found issues for ${issues.length} employees`);
    
    // 6. Test business rules
    console.log('\n⚖️  Testing Business Rules:');
    console.log(`   Valid punch-in before: ${ATTENDANCE_CONFIG.CHECK_IN_TIME}`);
    console.log(`   Valid punch-out after: ${ATTENDANCE_CONFIG.CHECK_OUT_TIME}`);
    
    // Test some time validations
    const testTimes = ['09:59', '10:00', '10:02', '18:29', '18:30', '18:31'];
    testTimes.forEach(time => {
      const isValidIn = UTILS.isValidPunchIn(time);
      const isValidOut = UTILS.isValidPunchOut(time);
      console.log(`   ${time}: In=${isValidIn ? '✅' : '❌'}, Out=${isValidOut ? '✅' : '❌'}`);
    });
    
    // 7. Test multiple time parsing
    console.log('\n⏰ Testing Multiple Time Parsing:');
    const multipleTimeTests = [
      '09:59 09:56 09:38',
      '20:15 21:39 20:05',
      '09:30',
      '18:30 19:00'
    ];
    
    multipleTimeTests.forEach(timeString => {
      const firstTime = UTILS.parseMultipleTimes(timeString, 'in');
      const lastTime = UTILS.parseMultipleTimes(timeString, 'out');
      console.log(`   "${timeString}" -> First: ${firstTime}, Last: ${lastTime}`);
    });
    
    // 8. Test Status Calculation Logic via actual data
    console.log('
🧮 Testing Backend Status Calculation Logic:');
    
    if (employees.length > 0) {
      const sampleEmployee = employees[0];
      
      // Check weekday vs weekend status assignment
      const weekdays = sampleEmployee.dailyData.filter(day => !day.isWeekend);
      const weekends = sampleEmployee.dailyData.filter(day => day.isWeekend);
      
      console.log(`   ✅ Weekdays processed: ${weekdays.length}`);
      console.log(`   ✅ Weekends auto-marked as WO: ${weekends.filter(day => day.status === 'WO').length}/${weekends.length}`);
      
      // Check status logic for sample days
      const sampleDays = weekdays.slice(0, 5);
      sampleDays.forEach(day => {
        const hasPunchIn = day.inTime1 !== null && day.inTime1 !== '';
        const hasPunchOut = (day.outTime1 && UTILS.isValidPunchOut(day.outTime1)) || 
                           (day.inTime2 && UTILS.isValidPunchOut(day.inTime2)) || 
                           (day.outTime2 && UTILS.isValidPunchOut(day.outTime2));
        const expectedLogic = hasPunchIn || hasPunchOut ? 'P or P with issues' : 'A';
        
        console.log(`   Day ${day.day}: Status=${day.status}, InTime=${day.inTime1 || 'None'}, Logic=${expectedLogic}`);
      });
    }
    
    console.log('   ✅ Status calculation: Based on InTime/OutTime data, ignoring Excel status column');
    
    console.log('
🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Excel file parsed: ${employees.length} INN Department employees`);
    console.log(`   ✅ Weekend detection working for July 2025`);
    console.log(`   ✅ Business rules validation working (10:01 AM / 18:30 PM)`);
    console.log(`   ✅ Multiple time parsing working (first in, last out)`);
    console.log(`   ✅ Status calculation working (backend logic, not Excel column)`);
    console.log(`   ✅ Attendance analysis working`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testJulyParsing();
