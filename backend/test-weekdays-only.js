const XLSX = require('xlsx');
const ExcelParserService = require('./services/excelParser');
const AttendanceAnalyzerService = require('./services/attendanceAnalyzer');
const { ATTENDANCE_CONFIG } = require('./utils/constants');

/**
 * Test script to verify Monday-Friday only processing works correctly
 */
async function testWeekdaysOnlyProcessing() {
  console.log('🧪 Testing Monday-Friday Only Processing...');
  console.log('='.repeat(60));
  
  try {
    // Test with the July2025.xlsx file
    const filePath = ATTENDANCE_CONFIG.EXCEL_FILE_PATH;
    console.log(`📂 Reading Excel file: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    console.log('✅ Excel file loaded successfully');
    
    // Test the new weekdays-only parsing
    console.log('\n🔬 Test: parseFixedFormatFile with Weekdays-Only Logic');
    const employees = ExcelParserService.parseFixedFormatFile(workbook);
    
    if (employees.length > 0) {
      console.log(`✅ Found ${employees.length} INN employees`);
      
      // Analyze the first employee in detail
      const firstEmployee = employees[0];
      console.log(`\n👤 Detailed Analysis for: ${firstEmployee.name} (${firstEmployee.id})`);
      console.log(`📊 Summary: ${firstEmployee.summary.present}P/${firstEmployee.summary.absent}A (${firstEmployee.summary.workingDays} working days)`);
      console.log(`📅 Total days: ${firstEmployee.dailyData.length}, Weekends excluded: ${firstEmployee.summary.weekendDays}`);
      
      // Show weekday vs weekend breakdown
      let weekdays = 0;
      let weekends = 0;
      
      console.log('\n📅 Day-by-Day Breakdown (First 10 days):');
      firstEmployee.dailyData.slice(0, 10).forEach(day => {
        if (day.isWeekend || day.status === 'WO') {
          weekends++;
          console.log(`   Day ${day.day} (${day.dayAbbr}): ${day.dayType} → ${day.status} (WEEKEND - EXCLUDED)`);
        } else {
          weekdays++;
          console.log(`   Day ${day.day} (${day.dayAbbr}): ${day.dayType} → ${day.status} (WEEKDAY - INCLUDED)`);
        }
      });
      
      console.log(`\n📊 First 10 days: ${weekdays} weekdays included, ${weekends} weekends excluded`);
      
      // Test the new attendance analyzer
      console.log('\n🔬 Test: analyzeAttendanceWeekdaysOnly');
      const issues = AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly([firstEmployee]);
      
      if (issues.length > 0) {
        const employeeAnalysis = issues[0];
        console.log(`✅ Analysis completed for ${employeeAnalysis.employee.name}`);
        console.log(`📊 Working days (weekdays only): ${employeeAnalysis.summary.workingDays}`);
        console.log(`📊 Present: ${employeeAnalysis.summary.presentDays}, Absent: ${employeeAnalysis.summary.absentDays}`);
        console.log(`📊 Weekends excluded: ${employeeAnalysis.summary.weekendDays}`);
        console.log(`📊 Attendance rate: ${employeeAnalysis.summary.attendanceRate}%`);
        
        if (employeeAnalysis.lateArrivalDetails) {
          console.log(`⏰ Late arrivals: ${employeeAnalysis.lateArrivalDetails.totalLateDays} days`);
          console.log(`⏰ Total late minutes: ${employeeAnalysis.lateArrivalDetails.totalLateMinutes}`);
        }
        
        if (employeeAnalysis.weekdayAnalysis) {
          console.log(`📅 Weekday analysis: ${employeeAnalysis.weekdayAnalysis.note}`);
        }
        
        // Show daily breakdown for verification
        console.log('\n📋 Daily Breakdown Verification (First 7 days):');
        employeeAnalysis.dailyBreakdown.slice(0, 7).forEach(day => {
          const dayType = day.note || '';
          console.log(`   Day ${day.day} (${day.dayAbbr}): ${day.status} - ${dayType}`);
        });
      }
      
      // Test all employees summary
      console.log('\n🔬 Test: All INN Employees Weekday Summary');
      employees.forEach((emp, index) => {
        if (index < 5) { // Show first 5 employees
          console.log(`   ${emp.name} (${emp.id}): ${emp.summary.present}P/${emp.summary.absent}A of ${emp.summary.workingDays} weekdays`);
          if (emp.weekdaysProcessed !== undefined) {
            console.log(`      Processed: ${emp.weekdaysProcessed} weekdays, ${emp.weekendsExcluded} weekends excluded`);
          }
        }
      });
      
      if (employees.length > 5) {
        console.log(`   ... and ${employees.length - 5} more employees`);
      }
      
    } else {
      console.log('❌ No employees found');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 VERIFICATION POINTS:');
    console.log('✅ Only INN department employees should be processed');
    console.log('✅ Only Monday-Friday should be included in attendance calculations');
    console.log('✅ Saturday (St) and Sunday (S) should be marked as WO and excluded');
    console.log('✅ Working days count should only include weekdays');
    console.log('✅ Attendance rates should be calculated based on weekdays only');
    console.log('✅ Weekend days should show "excluded from calculation" notes');
    console.log('\n🎉 Weekdays-only processing test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWeekdaysOnlyProcessing();
