export const sqliPatterns = [
  {
    id: 'SQLI-OR-BYPASS',
    pattern: /(?:\b(OR|AND)\b\s+[\w'"]+\s*=\s*[\w'"]+|(?:\b(OR|AND)\b\s+\d+\s*=\s*\d+))/i,
    severity: 'CRITICAL',
    description: 'Boolean-based SQL Injection bypass attempt'
  },
  {
    id: 'SQLI-UNION-SELECT',
    pattern: /\bUNION\b\s+(?:\bALL\b\s+)?\bSELECT\b/i,
    severity: 'CRITICAL',
    description: 'UNION SELECT SQL Injection attempt'
  },
  {
    id: 'SQLI-DROP-COMMENT',
    pattern: /(?:--|#|\/\*).*?\b(DROP|ALTER|EXEC|TRUNCATE)\b/i,
    severity: 'HIGH',
    description: 'Destructive SQL comment execution attempt'
  }
];