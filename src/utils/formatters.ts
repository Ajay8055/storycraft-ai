import type { FeatureInput, SectionKey, StoryCraftOutput } from '../types/storycraft.ts';

export function formatUserStoriesMarkdown(output: StoryCraftOutput): string {
  const lines = ['## A. User Stories', ''];
  output.userStories.forEach((s) => {
    lines.push(`### ${s.id}: ${s.title} (${s.priority})`);
    lines.push(`- **As a** ${s.asA}`);
    lines.push(`- **I want** ${s.iWant}`);
    lines.push(`- **So that** ${s.soThat}`);
    if (s.notes.trim()) {
      lines.push(`- **Notes:** ${s.notes}`);
    }
    lines.push('');
  });
  return lines.join('\n').trim();
}

export function formatAcceptanceCriteriaMarkdown(output: StoryCraftOutput): string {
  const lines = ['## B. Acceptance Criteria', ''];
  output.acceptanceCriteria.forEach((ac) => {
    lines.push(`### ${ac.id} (${ac.storyRef}) — ${ac.title}`);
    lines.push(`- **Given** ${ac.given}`);
    lines.push(`- **When** ${ac.when}`);
    lines.push(`- **Then** ${ac.then}`);
    lines.push('');
  });
  return lines.join('\n').trim();
}

export function formatFlowsMarkdown(output: StoryCraftOutput): string {
  const lines = ['## C. Happy Paths & Alternative Flows', ''];
  output.flows.forEach((flow) => {
    lines.push(`### ${flow.id}: ${flow.title} [${flow.flowType}]`);
    lines.push(`- **Actor:** ${flow.actor}`);
    lines.push(`- **Trigger:** ${flow.trigger}`);
    lines.push('- **Steps:**');
    flow.steps.forEach((step, idx) => {
      lines.push(`  ${idx + 1}. ${step}`);
    });
    lines.push(`- **Outcome:** ${flow.outcome}`);
    lines.push('');
  });
  return lines.join('\n').trim();
}

export function formatEdgeCasesMarkdown(output: StoryCraftOutput): string {
  const lines = ['## D. Edge Cases', ''];
  output.edgeCases.forEach((ec) => {
    lines.push(`### ${ec.id} [${ec.category} · ${ec.severity} Severity]`);
    lines.push(`- **Scenario:** ${ec.scenario}`);
    lines.push(`- **Expected Handling:** ${ec.expectedHandling}`);
    lines.push('');
  });
  return lines.join('\n').trim();
}

export function formatQaTestCasesMarkdown(output: StoryCraftOutput): string {
  const lines = ['## E. QA Test Cases', ''];
  output.qaTestCases.forEach((tc) => {
    lines.push(`### ${tc.testId}: ${tc.scenario} (${tc.priority} Priority)`);
    lines.push(`- **Preconditions:** ${tc.preconditions}`);
    lines.push('- **Steps:**');
    tc.steps.forEach((step, idx) => {
      lines.push(`  ${idx + 1}. ${step}`);
    });
    lines.push(`- **Expected Result:** ${tc.expectedResult}`);
    lines.push('');
  });
  return lines.join('\n').trim();
}

export function formatGapAnalysisMarkdown(output: StoryCraftOutput): string {
  const g = output.gapAnalysis;
  const lines = ['## F. Requirement Gaps, Assumptions & Clarifying Questions', ''];

  lines.push('### Facts Supplied by User');
  if (g.suppliedFacts.length === 0) {
    lines.push('- None listed.');
  } else {
    g.suppliedFacts.forEach((item) => lines.push(`- ${item}`));
  }
  lines.push('');

  lines.push('### Assumptions & Recommendations (Unconfirmed)');
  if (g.assumptionsAndRecommendations.length === 0) {
    lines.push('- None listed.');
  } else {
    g.assumptionsAndRecommendations.forEach((item) => lines.push(`- ${item}`));
  }
  lines.push('');

  lines.push('### Missing Information / Requirement Gaps');
  if (g.missingInformationGaps.length === 0) {
    lines.push('- None flagged.');
  } else {
    g.missingInformationGaps.forEach((item) => lines.push(`- ${item}`));
  }
  lines.push('');

  lines.push('### Clarifying Questions for Stakeholders & Engineering');
  if (g.clarifyingQuestions.length === 0) {
    lines.push('- None listed.');
  } else {
    g.clarifyingQuestions.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`));
  }
  lines.push('');
  lines.push(`> **Validation Notice:** ${g.validationDisclaimer}`);

  return lines.join('\n').trim();
}

export function formatSectionMarkdown(section: SectionKey, output: StoryCraftOutput): string {
  switch (section) {
    case 'userStories':
      return formatUserStoriesMarkdown(output);
    case 'acceptanceCriteria':
      return formatAcceptanceCriteriaMarkdown(output);
    case 'flows':
      return formatFlowsMarkdown(output);
    case 'edgeCases':
      return formatEdgeCasesMarkdown(output);
    case 'qaTestCases':
      return formatQaTestCasesMarkdown(output);
    case 'gapAnalysis':
      return formatGapAnalysisMarkdown(output);
  }
}

export function formatAllMarkdown(input: FeatureInput, output: StoryCraftOutput): string {
  const header = [
    `# ${input.featureName}`,
    '',
    input.userPersona ? `**Target Persona:** ${input.userPersona}` : null,
    `**Feature Description:** ${input.featureDescription}`,
    input.businessContext ? `**Business Context:** ${input.businessContext}` : null,
    input.constraints ? `**Constraints & Rules:** ${input.constraints}` : null,
    '',
    `> ${output.gapAnalysis.validationDisclaimer}`,
    '',
    '---',
    '',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return [
    header,
    formatUserStoriesMarkdown(output),
    '',
    formatAcceptanceCriteriaMarkdown(output),
    '',
    formatFlowsMarkdown(output),
    '',
    formatEdgeCasesMarkdown(output),
    '',
    formatQaTestCasesMarkdown(output),
    '',
    formatGapAnalysisMarkdown(output),
  ].join('\n');
}
