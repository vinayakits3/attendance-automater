/**
 * Test script for new Duration-Based Attendance Logic
 * Tests the new timing rules:
 * - Regular Timing (9:30-10:01 AM): Must complete 8h45m for Full Day
 * - Unusual Timing (before 9:30 AM or after 10:01 AM): Must complete 9h for Full Day
 */

const { UTILS, ATTENDANCE_CONFIG } = require('./utils/constants');

console.log('🧪 Testing Duration-Based Attendance Logic');
console.log('=' .repeat(50));

// Test cases for the new duration-based logic
const testCases = [
  // Regular Timing - Full Days
  {
    name: 'Regular timing - Full day (exactly 8h45m)',
    punchTimes: ['09:45', '18:30'], // 8h45m
    expected: { timing: 'REGULAR', duration: 8.75, isFullDay: true }
  },
  {
    name: 'Regular timing - Full day (more than 8h45m)',
    punchTimes: ['10:00', '19:00'], // 9h
    expected: { timing: 'REGULAR', duration: 9, isFullDay: true }
  },
  
  // Regular Timing - Half Days
  {
    name: 'Regular timing - Half day (less than 8h45m)',
    punchTimes: ['09:45', '18:00'], // 8h15m
    expected: { timing: 'REGULAR', duration: 8.25, isFullDay: false }
  },
  {
    name: 'Regular timing - Half day (exactly at window end)',
    punchTimes: ['10:01', '18:30'], // 8h29m
    expected: { timing: 'REGULAR', duration: 8.48, isFullDay: false }
  },
  
  // Unusual Timing - Full Days
  {
    name: 'Unusual timing - Early arrival, Full day',
    punchTimes: ['08:30', '18:00'], // 9h30m (early arrival)
    expected: { timing: 'UNUSUAL', duration: 9.5, isFullDay: true }
  },
  {
    name: 'Unusual timing - Late arrival, Full day',
    punchTimes: ['10:30', '19:30'], // 9h (late arrival)
    expected: { timing: 'UNUSUAL', duration: 9, isFullDay: true }
  },
  
  // Unusual Timing - Half Days
  {
    name: 'Unusual timing - Early arrival, Half day',
    punchTimes: ['08:00', '16:30'], // 8h30m (insufficient for unusual timing)
    expected: { timing: 'UNUSUAL', duration: 8.5, isFullDay: false }
  },
  {
    name: 'Unusual timing - Late arrival, Half day',
    punchTimes: ['11:00', '19:00'], // 8h (insufficient for unusual timing)
    expected: { timing: 'UNUSUAL', duration: 8, isFullDay: false }
  },
  
  // Edge Cases
  {
    name: 'Absent - No punch times',
    punchTimes: [],
    expected: { timing: null, duration: 0, isFullDay: false, status: 'A' }
  },
  {
    name: 'Single punch time',
    punchTimes: ['09:30'],
    expected: { timing: 'REGULAR', duration: 0, isFullDay: false }
  }
];

console.log(`\n📊 Testing ${testCases.length} scenarios...\n`);

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Input: [${testCase.punchTimes.join(', ')}]`);
  
  try {
    // Use the new calculatePunchBasedStatus function
    const result = UTILS.calculatePunchBasedStatus(testCase.punchTimes, false);
    
    console.log(`   Result: ${result.status} - ${result.note || 'No note'}`);
    
    if (result.isPresent) {
      console.log(`   Details: ${result.timingCategory} timing, ${result.workDuration.toFixed(2)}h, ${result.isFullDay ? 'Full Day' : 'Half Day'}`);
      console.log(`   Required: ${result.requiredHours}h`);
      
      // Validate against expected results
      const timingMatch = result.timingCategory === testCase.expected.timing;
      const durationMatch = Math.abs(result.workDuration - testCase.expected.duration) < 0.1;
      const dayTypeMatch = result.isFullDay === testCase.expected.isFullDay;
      
      if (timingMatch && durationMatch && dayTypeMatch) {
        console.log(`   ✅ PASS`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL`);
        console.log(`      Expected: ${testCase.expected.timing} timing, ${testCase.expected.duration}h, ${testCase.expected.isFullDay ? 'Full Day' : 'Half Day'}`);
        failedTests++;
      }
    } else {
      // Check absent cases
      if (testCase.expected.status === 'A') {
        console.log(`   ✅ PASS (Correctly identified as absent)`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL (Expected present but got absent)`);
        failedTests++;
      }
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    failedTests++;
  }
});

console.log('\n' + '=' .repeat(50));
console.log('📈 TEST RESULTS:');
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   📊 Success Rate: ${Math.round((passedTests / testCases.length) * 100)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! Duration-based logic is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.');
}

console.log('\n🔧 Configuration Summary:');
console.log(`   Regular Timing Window: ${ATTENDANCE_CONFIG.REGULAR_TIMING_START} - ${ATTENDANCE_CONFIG.REGULAR_TIMING_END}`);
console.log(`   Regular Required Hours: ${ATTENDANCE_CONFIG.REGULAR_REQUIRED_HOURS}h`);
console.log(`   Unusual Required Hours: ${ATTENDANCE_CONFIG.UNUSUAL_REQUIRED_HOURS}h`);
console.log(`   System: ${ATTENDANCE_CONFIG.SYSTEM_NAME}`);
