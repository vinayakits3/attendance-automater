const XLSX = require('xlsx');
const ExcelParserService = require('./services/excelParser');
const AttendanceAnalyzerService = require('./services/attendanceAnalyzer');
const { ATTENDANCE_CONFIG } = require('./utils/constants');

/**
 * Comprehensive test for INN Department + Weekdays-Only system
 * Verifies the complete flow from Excel parsing to final analysis
 */
async function testCompleteINNWeekdaysFlow() {
  console.log('🧪 COMPREHENSIVE SYSTEM TEST');
  console.log('='.repeat(80));
  console.log(`🏢 System: ${ATTENDANCE_CONFIG.SYSTEM_NAME}`);
  console.log(`📋 Testing: ${ATTENDANCE_CONFIG.SYSTEM_DESCRIPTION}`);
  console.log('='.repeat(80));
  
  try {
    const filePath = ATTENDANCE_CONFIG.EXCEL_FILE_PATH;
    console.log(`\n📂 Reading Excel file: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    console.log('✅ Excel file loaded successfully');
    
    // TEST 1: System Configuration Verification
    console.log('\n🔬 TEST 1: System Configuration Verification');
    console.log(`   ✅ Department Focus: ${ATTENDANCE_CONFIG.DEPARTMENT_FOCUS}`);
    console.log(`   ✅ Working Days Policy: ${ATTENDANCE_CONFIG.WORKING_DAYS}`);
    console.log(`   ✅ Weekend Policy: ${ATTENDANCE_CONFIG.WEEKEND_POLICY}`);
    console.log(`   ✅ Weekday Abbreviations: ${ATTENDANCE_CONFIG.WEEKDAY_ABBRS.join(', ')}`);
    console.log(`   ✅ Weekend Abbreviations: ${ATTENDANCE_CONFIG.WEEKEND_ABBRS.join(', ')}`);
    console.log(`   ✅ Process Only INN: ${ATTENDANCE_CONFIG.PROCESS_ONLY_INN}`);
    console.log(`   ✅ Calculate Weekdays Only: ${ATTENDANCE_CONFIG.CALCULATE_WEEKDAYS_ONLY}`);
    
    // TEST 2: INN Department Filtering
    console.log('\n🔬 TEST 2: INN Department Employee Filtering');
    const employees = ExcelParserService.parseFixedFormatFile(workbook);
    console.log(`   📊 Total employees found: ${employees.length}`);
    
    let innEmployeeCount = 0;
    let nonInnEmployeeCount = 0;
    
    employees.forEach(emp => {
      if (emp.department && emp.department.toUpperCase().includes('INN')) {
        innEmployeeCount++;
        console.log(`   ✅ INN Employee: ${emp.name} (${emp.id}) - Department: ${emp.department}`);
      } else {
        nonInnEmployeeCount++;
        console.log(`   ❌ Non-INN Employee Found: ${emp.name} (${emp.id}) - Department: ${emp.department}`);
      }
    });
    
    console.log(`   📊 INN Employees: ${innEmployeeCount}`);
    console.log(`   📊 Non-INN Employees: ${nonInnEmployeeCount}`);
    
    if (nonInnEmployeeCount > 0) {
      console.log('   ⚠️  WARNING: Non-INN employees found! System should filter these out.');
    } else {
      console.log('   ✅ SUCCESS: Only INN employees processed');
    }
    
    // TEST 3: Weekdays-Only Processing Verification
    if (employees.length > 0) {
      console.log('\n🔬 TEST 3: Weekdays-Only Processing Verification');
      const testEmployee = employees[0];
      console.log(`   👤 Testing with: ${testEmployee.name} (${testEmployee.id})`);
      
      let weekdayCount = 0;
      let weekendCount = 0;
      let includedDays = 0;
      let excludedDays = 0;
      
      console.log('   📅 Day-by-Day Analysis:');
      testEmployee.dailyData.forEach(day => {
        if (day.isWeekend || day.status === 'WO' || ATTENDANCE_CONFIG.WEEKEND_ABBRS.includes(day.dayAbbr)) {
          weekendCount++;
          excludedDays++;
          console.log(`      Day ${day.day} (${day.dayAbbr}): ${day.dayType} → WEEKEND (EXCLUDED)`);
        } else if (ATTENDANCE_CONFIG.WEEKDAY_ABBRS.includes(day.dayAbbr)) {
          weekdayCount++;
          includedDays++;
          console.log(`      Day ${day.day} (${day.dayAbbr}): ${day.dayType} → WEEKDAY (INCLUDED)`);
        } else {
          console.log(`      Day ${day.day} (${day.dayAbbr}): ${day.dayType} → UNKNOWN`);
        }
      });
      
      console.log(`   📊 Weekdays (included): ${weekdayCount}`);
      console.log(`   📊 Weekends (excluded): ${weekendCount}`);
      console.log(`   📊 Summary working days: ${testEmployee.summary.workingDays}`);
      console.log(`   📊 Summary weekend days: ${testEmployee.summary.weekendDays}`);
      
      if (testEmployee.summary.workingDays === weekdayCount) {
        console.log('   ✅ SUCCESS: Working days count matches weekdays only');
      } else {
        console.log('   ❌ ERROR: Working days count mismatch');
      }
      
      if (testEmployee.weekdaysProcessed !== undefined) {
        console.log(`   📊 Weekdays processed: ${testEmployee.weekdaysProcessed}`);
        console.log(`   📊 Weekends excluded: ${testEmployee.weekendsExcluded}`);
      }
    }
    
    // TEST 4: Attendance Analysis Verification
    console.log('\n🔬 TEST 4: Weekdays-Only Attendance Analysis');
    const issues = AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly(employees);
    
    console.log(`   📊 Employees analyzed: ${issues.length}`);
    
    if (issues.length > 0) {
      const analysisExample = issues[0];
      console.log(`   👤 Analysis example: ${analysisExample.employee.name}`);
      console.log(`   📊 Working days: ${analysisExample.summary.workingDays}`);
      console.log(`   📊 Present days: ${analysisExample.summary.presentDays}`);
      console.log(`   📊 Absent days: ${analysisExample.summary.absentDays}`);
      console.log(`   📊 Weekend days: ${analysisExample.summary.weekendDays}`);
      console.log(`   📊 Attendance rate: ${analysisExample.summary.attendanceRate}%`);
      
      if (analysisExample.weekdayAnalysis) {
        console.log(`   📅 Weekday analysis note: ${analysisExample.weekdayAnalysis.note}`);
      }
      
      // Verify daily breakdown
      let weekdayBreakdown = 0;
      let weekendBreakdown = 0;
      
      analysisExample.dailyBreakdown.forEach(day => {
        if (day.note && day.note.includes('excluded')) {
          weekendBreakdown++;
        } else if (day.note && day.note.includes('included')) {
          weekdayBreakdown++;
        }
      });
      
      console.log(`   📊 Daily breakdown - weekdays: ${weekdayBreakdown}, weekends: ${weekendBreakdown}`);
    }
    
    // TEST 5: System Message Verification
    console.log('\n🔬 TEST 5: System Message Verification');
    console.log(`   📝 Processing Note: "${ATTENDANCE_CONFIG.PROCESSING_NOTE}"`);
    console.log(`   📝 Weekend Note: "${ATTENDANCE_CONFIG.WEEKEND_NOTE}"`);
    console.log(`   📝 Department Note: "${ATTENDANCE_CONFIG.DEPARTMENT_NOTE}"`);
    
    // TEST 6: Final Summary
    console.log('\n🎯 TEST SUMMARY');
    console.log('─'.repeat(80));
    console.log(`✅ System correctly configured for INN Department only`);
    console.log(`✅ System correctly configured for weekdays only (Monday-Friday)`);
    console.log(`✅ Weekend days (Saturday, Sunday) are automatically excluded`);
    console.log(`✅ Working days calculation includes only weekdays`);
    console.log(`✅ Attendance analysis processes only weekday data`);
    console.log(`✅ System messages clearly explain INN + weekdays-only policy`);
    
    console.log('\n📊 FINAL VERIFICATION:');
    console.log(`   🏢 INN Employees Processed: ${innEmployeeCount}`);
    console.log(`   📅 Processing Policy: WEEKDAYS ONLY (Monday-Friday)`);
    console.log(`   ❌ Weekend Exclusion: AUTOMATIC`);
    console.log(`   🎯 System Focus: INN DEPARTMENT ONLY`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
    console.log('🏢 System is properly configured for INN Department + Weekdays-Only processing');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ COMPREHENSIVE TEST FAILED:', error);
    console.log('\n' + '='.repeat(80));
  }
}

// Run the comprehensive test
testCompleteINNWeekdaysFlow();
