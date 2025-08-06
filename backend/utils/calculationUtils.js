/**
 * Calculation Utilities Service
 * Handles various mathematical calculations and statistical operations
 */
class CalculationUtils {
  /**
   * Calculate average from an array of numbers
   * @param {Array<number>} numbers - Array of numbers
   * @returns {number} Average value
   */
  static calculateAverage(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }

    const validNumbers = numbers.filter(num => typeof num === 'number' && !isNaN(num));
    if (validNumbers.length === 0) {
      return 0;
    }

    const sum = validNumbers.reduce((total, num) => total + num, 0);
    return Math.round((sum / validNumbers.length) * 100) / 100;
  }

  /**
   * Calculate percentage
   * @param {number} part - Part value
   * @param {number} total - Total value
   * @returns {number} Percentage (0-100)
   */
  static calculatePercentage(part, total) {
    if (!total || total === 0) {
      return 0;
    }
    return Math.round((part / total) * 100);
  }

  /**
   * Calculate standard deviation
   * @param {Array<number>} numbers - Array of numbers
   * @returns {number} Standard deviation
   */
  static calculateStandardDeviation(numbers) {
    if (!Array.isArray(numbers) || numbers.length <= 1) {
      return 0;
    }

    const validNumbers = numbers.filter(num => typeof num === 'number' && !isNaN(num));
    if (validNumbers.length <= 1) {
      return 0;
    }

    const average = this.calculateAverage(validNumbers);
    const squaredDifferences = validNumbers.map(num => Math.pow(num - average, 2));
    const variance = this.calculateAverage(squaredDifferences);
    
    return Math.round(Math.sqrt(variance) * 100) / 100;
  }

  /**
   * Calculate median from an array of numbers
   * @param {Array<number>} numbers - Array of numbers
   * @returns {number} Median value
   */
  static calculateMedian(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }

    const validNumbers = numbers
      .filter(num => typeof num === 'number' && !isNaN(num))
      .sort((a, b) => a - b);

    if (validNumbers.length === 0) {
      return 0;
    }

    const middle = Math.floor(validNumbers.length / 2);
    
    if (validNumbers.length % 2 === 0) {
      return (validNumbers[middle - 1] + validNumbers[middle]) / 2;
    }
    
    return validNumbers[middle];
  }

  /**
   * Find minimum value in array
   * @param {Array<number>} numbers - Array of numbers
   * @returns {number} Minimum value
   */
  static findMinimum(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }

    const validNumbers = numbers.filter(num => typeof num === 'number' && !isNaN(num));
    return validNumbers.length > 0 ? Math.min(...validNumbers) : 0;
  }

  /**
   * Find maximum value in array
   * @param {Array<number>} numbers - Array of numbers
   * @returns {number} Maximum value
   */
  static findMaximum(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }

    const validNumbers = numbers.filter(num => typeof num === 'number' && !isNaN(num));
    return validNumbers.length > 0 ? Math.max(...validNumbers) : 0;
  }

  /**
   * Calculate quartiles (Q1, Q2, Q3)
   * @param {Array<number>} numbers - Array of numbers
   * @returns {Object} Quartiles object
   */
  static calculateQuartiles(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return { q1: 0, q2: 0, q3: 0 };
    }

    const validNumbers = numbers
      .filter(num => typeof num === 'number' && !isNaN(num))
      .sort((a, b) => a - b);

    if (validNumbers.length === 0) {
      return { q1: 0, q2: 0, q3: 0 };
    }

    const q2 = this.calculateMedian(validNumbers);
    
    const firstHalf = validNumbers.slice(0, Math.floor(validNumbers.length / 2));
    const secondHalf = validNumbers.slice(Math.ceil(validNumbers.length / 2));
    
    const q1 = this.calculateMedian(firstHalf);
    const q3 = this.calculateMedian(secondHalf);

    return { q1, q2, q3 };
  }

  /**
   * Calculate attendance rate
   * @param {number} presentDays - Number of present days
   * @param {number} totalWorkingDays - Total working days
   * @returns {number} Attendance rate percentage
   */
  static calculateAttendanceRate(presentDays, totalWorkingDays) {
    return this.calculatePercentage(presentDays, totalWorkingDays);
  }

  /**
   * Calculate punctuality score based on late days and total days
   * @param {number} punctualDays - Number of punctual days
   * @param {number} totalWorkingDays - Total working days
   * @param {number} latePenalty - Penalty for late days (default: 1 per late day)
   * @returns {number} Punctuality score (0-100)
   */
  static calculatePunctualityScore(punctualDays, totalWorkingDays, latePenalty = 0) {
    const baseScore = this.calculatePercentage(punctualDays, totalWorkingDays);
    return Math.max(0, baseScore - latePenalty);
  }

  /**
   * Calculate efficiency metrics
   * @param {Array<Object>} data - Array of data objects with values
   * @param {string} valueField - Field name containing the values
   * @returns {Object} Efficiency metrics
   */
  static calculateEfficiencyMetrics(data, valueField) {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        average: 0,
        median: 0,
        standardDeviation: 0,
        minimum: 0,
        maximum: 0,
        total: 0,
        count: 0
      };
    }

    const values = data
      .map(item => item[valueField])
      .filter(value => typeof value === 'number' && !isNaN(value));

    return {
      average: this.calculateAverage(values),
      median: this.calculateMedian(values),
      standardDeviation: this.calculateStandardDeviation(values),
      minimum: this.findMinimum(values),
      maximum: this.findMaximum(values),
      total: values.reduce((sum, val) => sum + val, 0),
      count: values.length
    };
  }

  /**
   * Calculate distribution statistics
   * @param {Array} data - Array of data
   * @param {Function} groupingFunction - Function to group data
   * @returns {Object} Distribution statistics
   */
  static calculateDistribution(data, groupingFunction) {
    if (!Array.isArray(data) || data.length === 0) {
      return {};
    }

    const distribution = {};
    
    data.forEach(item => {
      const group = groupingFunction(item);
      distribution[group] = (distribution[group] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Calculate trend (increasing, decreasing, stable)
   * @param {Array<number>} values - Array of values in chronological order
   * @returns {string} Trend direction
   */
  static calculateTrend(values) {
    if (!Array.isArray(values) || values.length < 2) {
      return 'Insufficient Data';
    }

    const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length < 2) {
      return 'Insufficient Data';
    }

    let increases = 0;
    let decreases = 0;

    for (let i = 1; i < validValues.length; i++) {
      if (validValues[i] > validValues[i - 1]) {
        increases++;
      } else if (validValues[i] < validValues[i - 1]) {
        decreases++;
      }
    }

    const changeThreshold = validValues.length * 0.6; // 60% threshold

    if (increases >= changeThreshold) {
      return 'Increasing';
    } else if (decreases >= changeThreshold) {
      return 'Decreasing';
    } else {
      return 'Stable';
    }
  }

  /**
   * Round to specified decimal places
   * @param {number} value - Value to round
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {number} Rounded value
   */
  static roundToDecimals(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }
    
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Calculate cumulative values
   * @param {Array<number>} values - Array of values
   * @returns {Array<number>} Cumulative values
   */
  static calculateCumulative(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }

    const cumulative = [];
    let sum = 0;

    values.forEach(value => {
      if (typeof value === 'number' && !isNaN(value)) {
        sum += value;
      }
      cumulative.push(sum);
    });

    return cumulative;
  }

  /**
   * Calculate weighted average
   * @param {Array<Object>} data - Array of objects with value and weight properties
   * @returns {number} Weighted average
   */
  static calculateWeightedAverage(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return 0;
    }

    let totalValue = 0;
    let totalWeight = 0;

    data.forEach(item => {
      if (typeof item.value === 'number' && typeof item.weight === 'number' && 
          !isNaN(item.value) && !isNaN(item.weight)) {
        totalValue += item.value * item.weight;
        totalWeight += item.weight;
      }
    });

    return totalWeight > 0 ? this.roundToDecimals(totalValue / totalWeight) : 0;
  }
}

module.exports = CalculationUtils;