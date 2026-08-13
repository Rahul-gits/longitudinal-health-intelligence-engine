export interface EmergencyCheckResult {
  isEmergency: boolean;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  matchedKeywords: string[];
  protocolTitle: string;
  immediateAction: string;
  emergencyPhone: string;
  guidelines: string[];
}

const RED_FLAG_PATTERNS = [
  { pattern: /chest pain|crushing pain|pressure in chest|radiating to jaw|radiating to left arm/i, title: 'Possible Acute Coronary Syndrome (Heart Attack)' },
  { pattern: /shortness of breath|gasping|can't breathe|cyanosis|blue lips|stridor/i, title: 'Severe Respiratory Distress' },
  { pattern: /facial drooping|arm weakness|slurred speech|sudden vision loss|stroke/i, title: 'Possible Acute Stroke (FAST Protocol)' },
  { pattern: /anaphylaxis|swollen tongue|throat closing|hives all over/i, title: 'Severe Anaphylactic Allergic Reaction' },
  { pattern: /unconscious|fainting|unresponsive|seizure|convulsions/i, title: 'Neurological / Consciousness Crisis' },
  { pattern: /heavy bleeding|uncontrolled hemorrhage|coughing up blood/i, title: 'Acute Severe Hemorrhage' }
];

export class SafetyEngine {
  public static evaluateText(text: string): EmergencyCheckResult {
    const matchedTitles: string[] = [];
    const matchedKeywords: string[] = [];

    for (const item of RED_FLAG_PATTERNS) {
      if (item.pattern.test(text)) {
        matchedTitles.push(item.title);
        const matches = text.match(item.pattern);
        if (matches) {
          matchedKeywords.push(matches[0]);
        }
      }
    }

    if (matchedTitles.length > 0) {
      return {
        isEmergency: true,
        severity: 'critical',
        matchedKeywords,
        protocolTitle: matchedTitles[0],
        immediateAction: 'CALL EMERGENCY SERVICES (112 / 911) IMMEDIATELY OR PROCEED TO NEAREST EMERGENCY ROOM.',
        emergencyPhone: '911 / 112',
        guidelines: [
          'Do NOT drive yourself to the hospital.',
          'Unlock the front door so emergency responders can enter.',
          'Rest in a comfortable position (seated upright if breathing is difficult).',
          'Have your current medication list available for paramedics.'
        ]
      };
    }

    return {
      isEmergency: false,
      severity: 'low',
      matchedKeywords: [],
      protocolTitle: 'Standard Assessment Protocol',
      immediateAction: 'Continue clinical case conference assessment.',
      emergencyPhone: '911',
      guidelines: []
    };
  }
}
