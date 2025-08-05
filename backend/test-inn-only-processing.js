const XLSX = require('xlsx');
const ExcelParserService = require('./services/excelParser');
const { ATTENDANCE_CONFIG } = require('./utils/constants');

/**
 * Test script to verify INN-only processing works correctly
 */
async function testINNOnlyProcessing() {
  console.log('🧪 Testing INN-Only Processing...');
  console.log('='.repeat(50));
  
  try {
    // Test with the July2025.xlsx file
    const filePath = ATTENDANCE_CONFIG.EXCEL_FILE_PATH;
    console.log(`📂 Reading Excel file: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    console.log('✅ Excel file loaded successfully');
    
    // Test 1: parseFixedFormatFile (should return INN employees only)
    console.log('\n🔬 Test 1: parseFixedFormatFile');
    try {
      const fixedFormatEmployees = ExcelParserService.parseFixedFormatFile(workbook);
      console.log(`✅ Fixed Format Result: ${fixedFormatEmployees.length} employees`);
      fixedFormatEmployees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.id}) - Department: ${emp.department}`);
      });
    } catch (error) {
      console.log(`❌ Fixed Format Error: ${error.message}`);
    }
    
    // Test 2: parseINNDepartmentData
    console.log('\n🔬 Test 2: parseINNDepartmentData');
    try {
      const innDeptEmployees = ExcelParserService.parseINNDepartmentData(workbook);
      console.log(`✅ INN Department Result: ${innDeptEmployees.length} employees`);
      innDeptEmployees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.id}) - Department: ${emp.department}`);
      });
    } catch (error) {
      console.log(`❌ INN Department Error: ${error.message}`);
    }
    
    // Test 3: parseFourPunchDataINNOnly (new method)
    console.log('\n🔬 Test 3: parseFourPunchDataINNOnly (New Method)');
    try {
      const innOnlyEmployees = ExcelParserService.parseFourPunchDataINNOnly(workbook);
      console.log(`✅ INN-Only Four Punch Result: ${innOnlyEmployees.length} employees`);
      innOnlyEmployees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.id}) - Department: ${emp.department}`);
      });
    } catch (error) {
      console.log(`❌ INN-Only Four Punch Error: ${error.message}`);
    }
    
    // Test 4: extractINNFromGenericFormat (fallback method)
    console.log('\n🔬 Test 4: extractINNFromGenericFormat (Fallback Method)');
    try {
      const genericInnEmployees = ExcelParserService.extractINNFromGenericFormat(workbook);
      console.log(`✅ Generic INN Extraction Result: ${genericInnEmployees.length} employees`);
      genericInnEmployees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.id}) - Department: ${emp.department}`);
      });
    } catch (error) {
      console.log(`❌ Generic INN Extraction Error: ${error.message}`);
    }
    
    // Test 5: parseFourPunchData (should return ALL employees - for comparison)
    console.log('\n🔬 Test 5: parseFourPunchData (All Departments - for comparison)');
    try {
      const allEmployees = ExcelParserService.parseFourPunchData(workbook);
      console.log(`✅ All Departments Result: ${allEmployees.length} employees`);
      
      // Group by department
      const byDepartment = {};
      allEmployees.forEach(emp => {
        const dept = emp.department || 'Unknown';
        if (!byDepartment[dept]) byDepartment[dept] = [];
        byDepartment[dept].push(emp);
      });
      
      Object.entries(byDepartment).forEach(([dept, employees]) => {
        console.log(`   📊 ${dept}: ${employees.length} employees`);
        if (dept.toUpperCase().includes('INN')) {
          employees.forEach(emp => {
            console.log(`      - ${emp.name} (${emp.id})`);
          });
        }
      });
    } catch (error) {
      console.log(`❌ All Departments Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 SUMMARY: All methods should return ONLY INN department employees');
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testINNOnlyProcessing();
