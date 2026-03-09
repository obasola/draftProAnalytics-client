// src/modules/draft-analysis/composables/useDraftGrading.ts

// PrimeVue doesn't export Severity in older versions, define it locally
type Severity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined;

export function useDraftGrading() {
  /**
   * Get PrimeVue severity level based on grade
   */
  function getGradeSeverity(grade: string): Severity {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
      case 'F':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get hex color based on grade
   */
  function getGradeColor(grade: string): string {
    switch (grade) {
      case 'A+':
        return '#22c55e'; // Green 500
      case 'A':
        return '#22c55e'; // Green 500
      case 'B':
        return '#3b82f6'; // Blue 500
      case 'C':
        return '#eab308'; // Yellow 500
      case 'D':
        return '#f97316'; // Orange 500
      case 'F':
        return '#ef4444'; // Red 500
      default:
        return '#6b7280'; // Gray 500
    }
  }

  /**
   * Format expected success rate as percentage string
   */
  function formatExpectedSuccess(success: number): string {
    return `${success.toFixed(1)}%`;
  }

  /**
   * Get color based on success rate percentage
   */
  function getSuccessColor(successRate: number): string {
    if (successRate >= 70) return '#22c55e'; // Green
    if (successRate >= 50) return '#3b82f6'; // Blue
    if (successRate >= 30) return '#eab308'; // Yellow
    if (successRate >= 15) return '#f97316'; // Orange
    return '#ef4444'; // Red
  }

  /**
   * Convert numeric score (0-100) to letter grade
   */
  function scoreToGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Determine if a grade is passing (B or better)
   */
  function isPassingGrade(grade: string): boolean {
    return ['A+', 'A', 'B'].includes(grade);
  }

  /**
   * Get descriptive text for grade
   */
  function getGradeDescription(grade: string): string {
    switch (grade) {
      case 'A+':
        return 'Excellent value, strong position, high success expected';
      case 'A':
        return 'Good pick, aligns with team strengths';
      case 'B':
        return 'Solid pick, reasonable value';
      case 'C':
        return 'Questionable selection, some concerns';
      case 'D':
        return 'Significant issues, likely reach';
      case 'F':
        return 'Major red flags, poor fit';
      default:
        return 'Unknown grade';
    }
  }

  /**
   * Get confidence level color
   */
  function getConfidenceColor(confidence: 'High' | 'Medium' | 'Low'): string {
    switch (confidence) {
      case 'High':
        return '#22c55e'; // Green
      case 'Medium':
        return '#eab308'; // Yellow
      case 'Low':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }

  /**
   * Get confidence level severity for PrimeVue tags
   */
  function getConfidenceSeverity(confidence: 'High' | 'Medium' | 'Low'): Severity {
    switch (confidence) {
      case 'High':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  return {
    getGradeSeverity,
    getGradeColor,
    formatExpectedSuccess,
    getSuccessColor,
    scoreToGrade,
    isPassingGrade,
    getGradeDescription,
    getConfidenceColor,
    getConfidenceSeverity
  };
}