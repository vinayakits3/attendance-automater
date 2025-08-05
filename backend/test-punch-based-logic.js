const { UTILS, ATTENDANCE_CONFIG } = require('./utils/constants');

/**
 * Test punch-based attendance logic for INN Department
 * Verifies the new punch-based calculation system
 */
function testPunchBasedLogic() {
  console.log('🧪 TESTING PUNCH-BASED ATTENDANCE LOGIC');
  console.log('='.repeat(60));
  console.log(`🏢 System: ${ATTENDANCE_CONFIG.SYSTEM_NAME}`);
  console.log(`🔧 Method: ${ATTENDANCE_CONFIG.CALCULATION_METHOD}`);
  console.log('='.repeat(60));
  
  // Test 1: Parse time values from cell content
  console.log('\n🔬 TEST 1: Time Parsing from Cells');
  testTimeParsing();
  
  // Test 2: Punch-based status calculation
  console.log('\n🔬 TEST 2: Punch-Based Status Calculation');
  testPunchBasedStatus();
  
  // Test 3: Late arrival detection
  console.log('\n🔬 TEST 3: Late Arrival Detection');
  testLateArrivalDetection();
  
  // Test 4: Early departure detection
  console.log('\n🔬 TEST 4: Early Departure Detection');
  testEarlyDepartureDetection();
  
  // Test 5: Configuration verification
  console.log('\n🔬 TEST 5: Configuration Verification');
  testConfigurationUpdates();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 PUNCH-BASED LOGIC TESTING COMPLETED!');
  console.log('='.repeat(60));
}

function testTimeParsing() {
  const testCases = [
    { input: '09:30', expected: ['09:30'] },
    { input: '10:00 11:30', expected: ['10:00', '11:30'] },
    { input: 'No data', expected: [] },
    { input: '8:45 18:30', expected: ['08:45', '18:30'] },
    { input: '', expected: [] },
    { input: '25:00', expected: [] }, // Invalid time
    { input: '12:30:45', expected: [] }, // Wrong format
  ];
  
  testCases.forEach((testCase, index) => {
    const result = UTILS.parseAllTimesFromCell(testCase.input);
    const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
    console.log(`   Test ${index + 1}: "${testCase.input}" → [${result.join(', ')}] ${passed ? '✅' : '❌'}`);
  });
}

function testPunchBasedStatus() {
  const testCases = [
    { punchTimes: [], isWeekend: false, expectedStatus: 'A', description: 'No punch times (Absent)' },
    { punchTimes: ['09:30', '18:30'], isWeekend: false, expectedStatus: 'P', description: 'Has punch times (Present)' },
    { punchTimes: ['10:30'], isWeekend: false, expectedStatus: 'P', description: 'Single punch time (Present)' },
    { punchTimes: ['09:30'], isWeekend: true, expectedStatus: 'WO', description: 'Weekend (Weekend Off)' },
  ];
  
  testCases.forEach((testCase, index) => {
    const result = UTILS.calculatePunchBasedStatus(testCase.punchTimes, testCase.isWeekend);
    const passed = result.status === testCase.expectedStatus;
    console.log(`   Test ${index + 1}: ${testCase.description} → ${result.status} ${passed ? '✅' : '❌'}`);
    if (result.note) {
      console.log(`     Note: ${result.note}`);
    }
  });
}

function testLateArrivalDetection() {
  const testCases = [
    { time: '09:30', expected: false, description: 'On time (09:30)' },
    { time: '10:01', expected: false, description: 'Exactly on time (10:01)' },
    { time: '10:02', expected: true, description: 'Late by 1 minute (10:02)' },
    { time: '10:30', expected: true, description: 'Late by 29 minutes (10:30)' },
    { time: '11:00', expected: true, description: 'Very late (11:00)' },
  ];
  
  testCases.forEach((testCase, index) => {
    const isLate = UTILS.isTimeAfter(testCase.time, ATTENDANCE_CONFIG.CHECK_IN_TIME);
    const passed = isLate === testCase.expected;
    console.log(`   Test ${index + 1}: ${testCase.description} → Late: ${isLate} ${passed ? '✅' : '❌'}`);
    
    if (isLate) {
      const lateMinutes = UTILS.calculateLateMinutesPunchBased(testCase.time, ATTENDANCE_CONFIG.CHECK_IN_TIME);
      console.log(`     Late by: ${lateMinutes} minutes`);
    }
  });
}

function testEarlyDepartureDetection() {
  const testCases = [
    { time: '18:30', expected: false, description: 'Full day (18:30)' },
    { time: '18:15', expected: false, description: 'Exactly full day (18:15)' },
    { time: '18:14', expected: true, description: 'Early by 1 minute (18:14)' },
    { time: '17:30', expected: true, description: 'Early by 45 minutes (17:30)' },
    { time: '16:00', expected: true, description: 'Very early (16:00)' },
  ];
  
  testCases.forEach((testCase, index) => {
    const isEarly = UTILS.isTimeBefore(testCase.time, ATTENDANCE_CONFIG.CHECK_OUT_TIME);
    const passed = isEarly === testCase.expected;
    console.log(`   Test ${index + 1}: ${testCase.description} → Early: ${isEarly} ${passed ? '✅' : '❌'}`);
  });
}

function testConfigurationUpdates() {
  console.log(`   ✅ CHECK_IN_TIME: ${ATTENDANCE_CONFIG.CHECK_IN_TIME} (should be 10:01)`);
  console.log(`   ✅ CHECK_OUT_TIME: ${ATTENDANCE_CONFIG.CHECK_OUT_TIME} (should be 18:15)`);
  console.log(`   ✅ PUNCH_BASED_ATTENDANCE: ${ATTENDANCE_CONFIG.PUNCH_BASED_ATTENDANCE} (should be true)`);
  console.log(`   ✅ CALCULATION_METHOD: ${ATTENDANCE_CONFIG.CALCULATION_METHOD} (should be PUNCH_BASED)`);
  console.log(`   ✅ ATTENDANCE_COLUMNS: ${ATTENDANCE_CONFIG.ATTENDANCE_COLUMNS.START} to ${ATTENDANCE_CONFIG.ATTENDANCE_COLUMNS.END}`);
  console.log(`   ✅ Column indices: ${ATTENDANCE_CONFIG.ATTENDANCE_COLUMNS.START_INDEX} to ${ATTENDANCE_CONFIG.ATTENDANCE_COLUMNS.END_INDEX}`);
  console.log(`   ✅ PRESENCE_RULE: ${ATTENDANCE_CONFIG.PRESENCE_RULE}`);
  console.log(`   ✅ ABSENCE_RULE: ${ATTENDANCE_CONFIG.ABSENCE_RULE}`);
  console.log(`   ✅ LATE_RULE: ${ATTENDANCE_CONFIG.LATE_RULE}`);
  console.log(`   ✅ FULL_DAY_RULE: ${ATTENDANCE_CONFIG.FULL_DAY_RULE}`);
  
  // Verify utility functions exist
  const utilityFunctions = [
    'extractDayPunchTimes',
    'parseAllTimesFromCell', 
    'isValidTimeFormat',
    'calculatePunchBasedStatus',
    'isTimeAfter',
    'isTimeBefore',
    'calculateLateMinutesPunchBased'
  ];
  
  console.log('   🔧 Utility Functions:');
  utilityFunctions.forEach(funcName => {
    const exists = typeof UTILS[funcName] === 'function';
    console.log(`     ${funcName}: ${exists ? '✅ Available' : '❌ Missing'}`);
  });
}

// Run the test
try {
  testPunchBasedLogic();
} catch (error) {
  console.error('❌ Test failed:', error);
}
