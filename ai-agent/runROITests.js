#!/usr/bin/env node

/**
 * ROI Test Runner
 * Executes comprehensive ROI validation tests and generates detailed reports
 */

import ROIValidationTests from './tests/ROIValidationTests.js'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('🚀 Starting NeuroSwap ROI Validation Testing...\n')
  
  const testSuite = new ROIValidationTests()
  
  try {
    // Run all validation tests
    const testReport = await testSuite.runAllTests()
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'ROI_VALIDATION_REPORT.json')
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2))
    
    // Generate summary
    console.log('\n' + '='.repeat(80))
    console.log('📋 ROI VALIDATION SUMMARY')
    console.log('='.repeat(80))
    
    console.log(`\n🎯 Overall Performance: ${testReport.summary.overallStatus}`)
    console.log(`📊 Pass Rate: ${testReport.summary.passRate}`)
    console.log(`✅ Tests Passed: ${testReport.summary.passedTests}/${testReport.summary.totalTests}`)
    
    if (testReport.summary.failedTests > 0) {
      console.log(`❌ Tests Failed: ${testReport.summary.failedTests}`)
      console.log('\n🔧 Recommendations:')
      testReport.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`)
      })
    }
    
    // Detailed results
    console.log('\n📈 Detailed Results:')
    testReport.testResults.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌'
      console.log(`   ${status} ${test.test}`)
      
      if (test.avgImprovement) {
        console.log(`      - Average Improvement: ${test.avgImprovement} (Target: ${test.target})`)
      }
      if (test.avgReduction) {
        console.log(`      - Average Reduction: ${test.avgReduction} (Target: ${test.target})`)
      }
      if (test.avgIncrease) {
        console.log(`      - Average Increase: ${test.avgIncrease} (Target: ${test.target})`)
      }
      if (test.avgLatency) {
        console.log(`      - Average Latency: ${test.avgLatency} (Target: ${test.target})`)
      }
      if (test.avgResponseTime) {
        console.log(`      - Average Response Time: ${test.avgResponseTime} (Target: ${test.target})`)
      }
      if (test.avgScore) {
        console.log(`      - Average Score: ${test.avgScore} (Target: ${test.target})`)
      }
      if (test.annualizedROI) {
        console.log(`      - Annualized ROI: ${test.annualizedROI}, Win Rate: ${test.winRate}`)
      }
      if (test.avgConfidence) {
        console.log(`      - Adaptations: ${test.totalAdaptations}, Confidence: ${test.avgConfidence}`)
      }
    })
    
    // Performance metrics comparison
    console.log('\n🏆 KEY PERFORMANCE METRICS vs TARGETS:')
    console.log('─'.repeat(60))
    
    const metricsTable = [
      ['Metric', 'Target', 'Achieved', 'Status'],
      ['Capital Efficiency', '+30-50%', getMetricValue(testReport, 'Capital Efficiency Gains', 'avgImprovement'), getMetricStatus(testReport, 'Capital Efficiency Gains')],
      ['Impermanent Loss', '-50%', getMetricValue(testReport, 'Impermanent Loss Reduction', 'avgReduction'), getMetricStatus(testReport, 'Impermanent Loss Reduction')],
      ['Slippage Reduction', '-33-50%', getMetricValue(testReport, 'Slippage Reduction', 'avgReduction'), getMetricStatus(testReport, 'Slippage Reduction')],
      ['Fee Revenue', '+15-30%', getMetricValue(testReport, 'Fee Revenue Increase', 'avgIncrease'), getMetricStatus(testReport, 'Fee Revenue Increase')],
      ['Cross-Chain Latency', '<60s', getMetricValue(testReport, 'Cross-Chain Latency', 'avgLatency'), getMetricStatus(testReport, 'Cross-Chain Latency')]
    ]
    
    metricsTable.forEach((row, i) => {
      if (i === 0) {
        console.log(`   ${row[0].padEnd(20)} ${row[1].padEnd(12)} ${row[2].padEnd(12)} ${row[3]}`)
        console.log('   ' + '─'.repeat(55))
      } else {
        const status = row[3] === 'PASSED' ? '✅' : '❌'
        console.log(`   ${row[0].padEnd(20)} ${row[1].padEnd(12)} ${row[2].padEnd(12)} ${status}`)
      }
    })
    
    // Save human-readable summary
    const summaryPath = path.join(process.cwd(), 'ROI_VALIDATION_SUMMARY.md')
    generateMarkdownSummary(testReport, summaryPath)
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
    console.log(`📄 Summary report saved to: ${summaryPath}`)
    
    if (testReport.summary.overallStatus === 'PASSED') {
      console.log('\n🎉 All ROI targets achieved! Strategy is ready for deployment.')
      process.exit(0)
    } else {
      console.log('\n⚠️  Some targets not met. Review recommendations and optimize strategy.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

function getMetricValue(report, testName, metricKey) {
  const test = report.testResults.find(t => t.test === testName)
  return test ? (test[metricKey] || 'N/A') : 'N/A'
}

function getMetricStatus(report, testName) {
  const test = report.testResults.find(t => t.test === testName)
  return test ? test.status : 'UNKNOWN'
}

function generateMarkdownSummary(report, filePath) {
  const content = `# NeuroSwap ROI Validation Report

## Executive Summary

- **Overall Status**: ${report.summary.overallStatus}
- **Pass Rate**: ${report.summary.passRate}
- **Tests Passed**: ${report.summary.passedTests} / ${report.summary.totalTests}
- **Generated**: ${new Date(report.timestamp).toISOString()}

## Performance Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Capital Efficiency | +30-50% | ${getMetricValue(report, 'Capital Efficiency Gains', 'avgImprovement')} | ${getMetricStatus(report, 'Capital Efficiency Gains')} |
| Impermanent Loss | -50% | ${getMetricValue(report, 'Impermanent Loss Reduction', 'avgReduction')} | ${getMetricStatus(report, 'Impermanent Loss Reduction')} |
| Slippage Reduction | -33-50% | ${getMetricValue(report, 'Slippage Reduction', 'avgReduction')} | ${getMetricStatus(report, 'Slippage Reduction')} |
| Fee Revenue | +15-30% | ${getMetricValue(report, 'Fee Revenue Increase', 'avgIncrease')} | ${getMetricStatus(report, 'Fee Revenue Increase')} |
| Cross-Chain Latency | <60s | ${getMetricValue(report, 'Cross-Chain Latency', 'avgLatency')} | ${getMetricStatus(report, 'Cross-Chain Latency')} |

## Test Results

${report.testResults.map(test => `
### ${test.test}
- **Status**: ${test.status}
- **Target**: ${test.target}
${Object.entries(test).filter(([key, value]) => 
  !['test', 'status', 'target', 'timestamp', 'results'].includes(key) && 
  typeof value === 'string'
).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}
`).join('\n')}

## Recommendations

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Conclusion

${report.summary.overallStatus === 'PASSED' 
  ? 'NeuroSwap ROI maximization strategy successfully meets all performance targets. The AI-driven approach demonstrates significant improvements over traditional AMMs across all key metrics.'
  : 'Some performance targets require optimization. Implement the recommendations above to achieve full ROI targets.'
}

---
*Generated by NeuroSwap ROI Validation Suite*
`

  fs.writeFileSync(filePath, content)
}

// Run the tests
main().catch(console.error)