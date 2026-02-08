// ==================== DAILY PLANNING ADVICE ====================
export interface DailyPlanningAdvice {
  date: Date;
  advice: string; // AI-generated text
  generatedAt: Date;
}

// ==================== PRODUCTIVITY INSIGHTS ====================
export interface ProductivityInsight {
  insights: string; // Multi-line AI analysis
  generatedAt: Date;
  period: string; // "4 weeks"
}

// ==================== PROCRASTINATION RISK ====================
export interface ProcrastinationRiskResponse {
  taskId: string;
  isAtRisk: boolean;
  checkedAt: Date;
}

// ==================== DAILY WELLNESS INSIGHTS ====================
export interface DailyWellnessInsight {
  date: Date;
  insights: string; // AI wellness feedback
  generatedAt: Date;
}

// ==================== FULL INSIGHTS RESPONSE ====================
export interface PlannerInsightsResponse {
  dailyAdvice: DailyPlanningAdvice;
  productivityInsights: ProductivityInsight;
  dailyWellness: DailyWellnessInsight;
  procrastinationRisks: ProcrastinationRiskResponse[];
}
