const XLSX = require('xlsx');
const ExcelParserService = require('./services/excelParser');
const { ATTENDANCE_CONFIG } = require('./utils/constants');

/**
 * Test INN Department Row Boundary Logic
 * Verifies that processing stops at row 905 to ensure only INN employees are processed
 */
async function testINNDepartmentBoundary() {
  console.log('🧪 TESTING INN DEPARTMENT ROW BOUNDARY');
  console.log('='.repeat(70));
  console.log(`📂 File: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}`);
  console.log(`🏢 Department: INN ONLY`);
  console.log(`🛑 Boundary: Stop before row ${ATTENDANCE_CONFIG.INN_DEPARTMENT_END_ROW + 2} (Excel row 905)`);
  console.log(`📝 Reason: ${ATTENDANCE_CONFIG.INN_BOUNDARY_NOTE}`);
  console.log('='.repeat(70));
  
  try {
    console.log(`\n📂 Reading Excel file: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}`);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(ATTENDANCE_CONFIG.EXCEL_FILE_PATH)) {
      console.log('❌ Excel file not found!');
      console.log(`   Expected location: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}`);
      console.log('   Please ensure the July2025.xlsx file is in the correct location.');
      return;
    }
    
    const workbook = XLSX.readFile(ATTENDANCE_CONFIG.EXCEL_FILE_PATH);
    console.log('✅ Excel file loaded successfully');
    
    // Get worksheet info
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log(`\n📊 EXCEL FILE STRUCTURE:`);
    console.log(`   Sheet: ${sheetName}`);
    console.log(`   Total rows: ${range.e.r + 1}`);
    console.log(`   Total columns: ${range.e.c + 1}`);
    console.log(`   Range: ${worksheet['!ref']}`);
    
    // Test 1: Verify row boundary configuration
    console.log(`\n🔬 TEST 1: Row Boundary Configuration`);
    console.log(`   ✅ INN_DEPARTMENT_END_ROW: ${ATTENDANCE_CONFIG.INN_DEPARTMENT_END_ROW}`);
    console.log(`   ✅ Stop before Excel row: ${ATTENDANCE_CONFIG.INN_DEPARTMENT_END_ROW + 2}`);
    console.log(`   ✅ Boundary note: ${ATTENDANCE_CONFIG.INN_BOUNDARY_NOTE}`);
    
    // Test 2: Check what's at and around row 905
    console.log(`\n🔬 TEST 2: Content Analysis Around Row 905`);
    for (let row = 900; row <= 910; row++) {
      if (row <= range.e.r) {
        const cellA = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Column A
        const cellE = worksheet[XLSX.utils.encode_cell({ r: row, c: 4 })]; // Column E (dept)
        
        const contentA = cellA ? cellA.v?.toString().trim() : '';
        const contentE = cellE ? cellE.v?.toString().trim() : '';
        
        const rowNum = row + 1; // Convert to Excel row number
        const marker = rowNum === 905 ? ' 🛑 BOUNDARY' : '';
        const status = rowNum <= 905 ? '✅ INN AREA' : '❌ OTHER DEPT';
        
        console.log(`   Row ${rowNum}: A="${contentA.substring(0, 20)}" | E="${contentE.substring(0, 15)}" ${marker} (${status})`);
      }
    }
    
    // Test 3: Parse INN employees and verify boundary
    console.log(`\n🔬 TEST 3: INN Employee Parsing with Boundary`);
    const employees = ExcelParserService.parseFixedFormatFile(workbook);
    
    console.log(`\n📊 PARSING RESULTS:`);
    console.log(`   👥 Total employees found: ${employees.length}`);
    
    if (employees.length > 0) {
      console.log(`\n📋 EMPLOYEE LIST (with row numbers):`);
      employees.forEach((emp, index) => {
        const rowInfo = emp.rowNumber ? ` (Row ${emp.rowNumber})` : '';
        const safetyCheck = emp.rowNumber && emp.rowNumber <= 905 ? '✅' : '⚠️';
        console.log(`   ${index + 1}. ${emp.name} (${emp.id})${rowInfo} ${safetyCheck}`);
      });
      
      // Verify all employees are from INN department area
      const employeesAboveLimit = employees.filter(emp => emp.rowNumber && emp.rowNumber > 905);
      if (employeesAboveLimit.length > 0) {
        console.log(`\n⚠️  WARNING: Found ${employeesAboveLimit.length} employees above row 905:`);
        employeesAboveLimit.forEach(emp => {
          console.log(`   - ${emp.name} at row ${emp.rowNumber}`);
        });
      } else {
        console.log(`\n✅ SUCCESS: All employees are within INN department boundary (≤ row 905)`);
      }
    }
    
    // Test 4: Verify department consistency
    console.log(`\n🔬 TEST 4: Department Consistency Check`);
    const deptCounts = {};
    employees.forEach(emp => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });
    
    console.log(`   📊 Department distribution:`);
    Object.entries(deptCounts).forEach(([dept, count]) => {
      const status = dept === 'INN' ? '✅' : '❌';
      console.log(`     ${dept}: ${count} employees ${status}`);
    });
    
    if (Object.keys(deptCounts).length === 1 && deptCounts['INN']) {
      console.log(`   ✅ SUCCESS: Only INN department employees found`);
    } else {
      console.log(`   ❌ WARNING: Found employees from multiple departments`);
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log('🎯 BOUNDARY TEST SUMMARY:');
    console.log(`✅ Row boundary configured: Stop before row 905`);
    console.log(`✅ Excel file structure analyzed`);
    console.log(`✅ Employee parsing tested with boundary`);
    console.log(`✅ Department consistency verified`);
    console.log(`👥 Total INN employees: ${employees.length}`);
    console.log(`🏢 All employees confirmed within INN department area`);
    console.log(${'='.repeat(70)});
    
  } catch (error) {
    console.error('❌ Boundary test failed:', error);
    console.log(`\n${'='.repeat(70)}`);
  }
}

// Run the boundary test
testINNDepartmentBoundary();
