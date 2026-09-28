export const xssPatterns = [
  {
    id: 'XSS-SCRIPT-TAG',
    pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    severity: 'HIGH',
    description: 'Inline script tag injection'
  },
  {
    id: 'XSS-INLINE-EVENT',
    pattern: /<(?:img|svg|iframe|body|input)[^>]+?(?:onerror|onload|onclick)\s*=/i,
    severity: 'CRITICAL',
    description: 'Event-driven XSS injection attempt'
  }
];