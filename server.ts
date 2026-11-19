import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import type { FeatureInput, StoryCraftOutput } from './src/types/storycraft.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const storyCraftResponseSchema = {
  type: Type.OBJECT,
  properties: {
    userStories: {
      type: Type.ARRAY,
      description: 'Section A: User stories in As a / I want / So that format.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Identifier such as US-01' },
          title: { type: Type.STRING, description: 'Concise story title' },
          asA: {
            type: Type.STRING,
            description:
              'Role or persona without repeating "As a". MUST use "User" (generic user) if no persona or role was explicitly provided by the user.',
          },
          iWant: { type: Type.STRING, description: 'Goal or action without repeating "I want"' },
          soThat: { type: Type.STRING, description: 'User or business value without repeating "So that"' },
          priority: {
            type: Type.STRING,
            description: 'Must be one of: Must Have, Should Have, Could Have',
          },
          notes: {
            type: Type.STRING,
            description:
              'Short factual scope note. Prefix any unconfirmed detail with "[Assumption]" or "[To be confirmed]".',
          },
        },
        required: ['id', 'title', 'asA', 'iWant', 'soThat', 'priority', 'notes'],
      },
    },
    acceptanceCriteria: {
      type: Type.ARRAY,
      description: 'Section B: Testable acceptance criteria in Given / When / Then format.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Identifier such as AC-01' },
          storyRef: { type: Type.STRING, description: 'Related story ID, e.g. US-01' },
          title: { type: Type.STRING, description: 'Concise criterion title' },
          given: {
            type: Type.STRING,
            description:
              'Testable initial state/precondition without repeating the word "Given".',
          },
          when: {
            type: Type.STRING,
            description:
              'Specific, observable triggering action without repeating the word "When".',
          },
          then: {
            type: Type.STRING,
            description:
              'Concrete, measurable, verifiable outcome without repeating the word "Then" and without inventing unconfirmed policies.',
          },
        },
        required: ['id', 'storyRef', 'title', 'given', 'when', 'then'],
      },
    },
    flows: {
      type: Type.ARRAY,
      description: 'Section C: Happy paths and alternative flows strictly grounded in user input.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Identifier such as FLOW-01' },
          title: { type: Type.STRING, description: 'Flow title' },
          flowType: {
            type: Type.STRING,
            description: 'Must be either "Happy Path" or "Alternative Flow"',
          },
          actor: {
            type: Type.STRING,
            description:
              'Primary actor executing the flow. MUST be "User" if no specific persona or role was provided in the input.',
          },
          trigger: { type: Type.STRING, description: 'What initiates this flow' },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Ordered concrete steps in the flow',
          },
          outcome: { type: Type.STRING, description: 'End state after flow completes' },
        },
        required: ['id', 'title', 'flowType', 'actor', 'trigger', 'steps', 'outcome'],
      },
    },
    edgeCases: {
      type: Type.ARRAY,
      description:
        'Section D: Edge cases covering Invalid Input (validation errors), Empty States, Boundary Conditions, Duplicate Actions, Network Failures, Permissions, and System Failures.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Identifier such as EC-01' },
          category: {
            type: Type.STRING,
            description:
              'One of: Invalid Input, Empty States, Permissions, Network Failures, Boundary Conditions, Duplicate Actions, System Failures, Other',
          },
          scenario: { type: Type.STRING, description: 'Specific edge-case situation for this feature' },
          expectedHandling: {
            type: Type.STRING,
            description:
              'Handling grounded in supplied rules, or explicitly marked "[Assumption]" / "[To be confirmed]" when behavior was not specified.',
          },
          severity: { type: Type.STRING, description: 'One of: High, Medium, Low' },
        },
        required: ['id', 'category', 'scenario', 'expectedHandling', 'severity'],
      },
    },
    qaTestCases: {
      type: Type.ARRAY,
      description: 'Section E: Distinct, non-redundant QA test cases tailored to this feature.',
      items: {
        type: Type.OBJECT,
        properties: {
          testId: { type: Type.STRING, description: 'Test identifier such as TC-01' },
          scenario: { type: Type.STRING, description: 'Specific scenario being verified' },
          preconditions: { type: Type.STRING, description: 'Exact setup state required before running steps' },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Ordered actionable QA test steps',
          },
          expectedResult: { type: Type.STRING, description: 'Specific verifiable expected outcome' },
          priority: { type: Type.STRING, description: 'One of: High, Medium, Low' },
        },
        required: ['testId', 'scenario', 'preconditions', 'steps', 'expectedResult', 'priority'],
      },
    },
    gapAnalysis: {
      type: Type.OBJECT,
      description:
        'Section F: Strict separation of confirmed requirements vs assumptions vs recommendations, missing information gaps, and clarifying questions.',
      properties: {
        suppliedFacts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            'Confirmed requirements and facts explicitly stated in the user input ONLY. Zero inferred or assumed items.',
        },
        assumptionsAndRecommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            'Every entry MUST begin with either "Assumption: " (for any assumed behavior/scope) or "Recommendation: " (for suggested PM improvements).',
        },
        missingInformationGaps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Specific undefined policies, thresholds, roles, permissions, or behaviors missing from the input.',
        },
        clarifyingQuestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Concrete questions the PM must confirm with stakeholders or engineering.',
        },
        validationDisclaimer: {
          type: Type.STRING,
          description:
            'Explicit statement that this specification is an AI-assisted draft and has not been validated by engineering or QA.',
        },
      },
      required: [
        'suppliedFacts',
        'assumptionsAndRecommendations',
        'missingInformationGaps',
        'clarifyingQuestions',
        'validationDisclaimer',
      ],
    },
  },
  required: [
    'userStories',
    'acceptanceCriteria',
    'flows',
    'edgeCases',
    'qaTestCases',
    'gapAnalysis',
  ],
};

const SYSTEM_INSTRUCTION = `You are StoryCraft AI, a rigorous Senior Product Management Assistant built for Associate Product Managers and Product Managers.

Your job is to transform a feature brief into clear, structured product and QA documentation in JSON.

STRICT PRODUCT REQUIREMENT RULES (NON-NEGOTIABLE):
1. ZERO INVENTED ROLES, PERMISSIONS, WORKFLOWS, OR RULES:
   - NEVER invent user roles, personas, permissions, business rules, numeric thresholds (e.g. lockout limits, timeouts, character lengths), workflows (e.g. MFA, SSO, OAuth, password reset, admin audit consoles), or system behaviors that the user did not explicitly provide.
   - If a persona/role is NOT specified in the input, you MUST use a generic user ("User") across all user stories (asA: "User"), flows (actor: "User"), acceptance criteria, edge cases, and QA test cases. NEVER invent specific roles such as "Superadmin", "Store Manager", "Organization Admin", "Moderator", or "Support Agent" unless those exact roles appear in the user's brief.
2. CLEAR DISTINCTION BETWEEN CONFIRMED FACTS, ASSUMPTIONS, AND RECOMMENDATIONS:
   - In gapAnalysis.suppliedFacts: List ONLY confirmed requirements and facts explicitly stated by the user.
   - In gapAnalysis.assumptionsAndRecommendations: Every single assumption MUST begin with "Assumption: " and every recommendation MUST begin with "Recommendation: ". Never present an assumption or recommendation as a confirmed requirement.
   - Whenever an edge case handling, story note, or acceptance criterion references behavior that was not explicitly confirmed by the user, label it "[Assumption]" or "[To be confirmed]".
3. REQUIREMENT GAPS & CLARIFYING QUESTIONS:
   - Always generate a thorough gapAnalysis.missingInformationGaps list covering undefined policies, validations, permissions, error behaviors, security rules, or scope boundaries.
   - Pair those gaps with concrete, stakeholder-ready gapAnalysis.clarifyingQuestions.
4. TESTABLE ACCEPTANCE CRITERIA (GIVEN / WHEN / THEN):
   - Every acceptance criterion MUST be independently testable with concrete preconditions (given), an explicit user/system trigger (when), and an observable, verifiable result (then). Do not repeat "Given", "When", or "Then" inside the field values.
5. COMPREHENSIVE EDGE CASES:
   - Cover all relevant categories among: Invalid Input (validation errors), Empty States, Boundary Conditions, Duplicate Actions, Network Failures, Permissions, and System Failures.
   - Keep expected handling factual or explicitly marked "[Assumption]" / "[To be confirmed]".
6. COMPLETE, NON-REDUNDANT QA TEST CASES:
   - Every QA test case MUST include a unique testId (TC-01, TC-02, ...), specific scenario, exact preconditions, ordered actionable steps, and a verifiable expectedResult.
   - Avoid duplicate user stories and redundant QA test cases; each item must test a distinct requirement, flow, or failure mode.
7. VALIDATION DISCLAIMER:
   - Never claim generated requirements or test cases have been validated by engineering. Set validationDisclaimer to clearly state this is an AI-generated draft awaiting engineering, QA, and stakeholder validation.`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /ECONNRESET|ETIMEDOUT|fetch failed|503|502|500/i.test(message)
  );
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const statusCode = (err as { status?: number })?.status;

  if (statusCode === 400 || /API_KEY_INVALID|INVALID_ARGUMENT/i.test(raw)) {
    return {
      status: 400,
      message:
        'Gemini rejected the request or API key. Please verify GEMINI_API_KEY in Settings > Secrets and try again.',
    };
  }
  if (statusCode === 403 || /PERMISSION_DENIED/i.test(raw)) {
    return {
      status: 403,
      message:
        'Permission denied by Gemini API. Check that GEMINI_API_KEY is valid and enabled in Settings > Secrets.',
    };
  }
  if (statusCode === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(raw)) {
    return {
      status: 429,
      message:
        'Gemini API rate limit or quota exceeded. Wait a moment and try again, or verify your quota in Settings > Secrets.',
    };
  }
  if (statusCode === 404 || /NOT_FOUND/i.test(raw)) {
    return {
      status: 502,
      message: `Configured Gemini model (${MODEL_NAME}) was not found or is unavailable.`,
    };
  }
  return {
    status: 500,
    message: raw || 'Failed to generate documentation from Gemini API.',
  };
}

function stripLeadingKeyword(text: string, keyword: string): string {
  const pattern = new RegExp(`^${keyword}\\s*:?\\s+`, 'i');
  return text.trim().replace(pattern, '');
}

function normalizeOutput(
  raw: Partial<StoryCraftOutput>,
  input: FeatureInput
): StoryCraftOutput {
  const storiesRaw = Array.isArray(raw.userStories) ? raw.userStories : [];
  const acsRaw = Array.isArray(raw.acceptanceCriteria) ? raw.acceptanceCriteria : [];
  const flowsRaw = Array.isArray(raw.flows) ? raw.flows : [];
  const edgesRaw = Array.isArray(raw.edgeCases) ? raw.edgeCases : [];
  const testsRaw = Array.isArray(raw.qaTestCases) ? raw.qaTestCases : [];
  const gaps = raw.gapAnalysis ?? {
    suppliedFacts: [],
    assumptionsAndRecommendations: [],
    missingInformationGaps: [],
    clarifyingQuestions: [],
    validationDisclaimer:
      'Draft specification generated by StoryCraft AI. Not validated by engineering, QA, or security.',
  };

  const defaultActor = input.userPersona.trim() ? input.userPersona.trim() : 'User';

  // Deduplicate user stories by normalized (asA + iWant)
  const seenStories = new Set<string>();
  const dedupedStories = storiesRaw.filter((s) => {
    const key = `${(s.asA || '').trim().toLowerCase()}::${(s.iWant || '').trim().toLowerCase()}`;
    if (!key || key === '::' || seenStories.has(key)) {
      return false;
    }
    seenStories.add(key);
    return true;
  });

  // Deduplicate QA test cases by normalized scenario
  const seenTests = new Set<string>();
  const dedupedTests = testsRaw.filter((t) => {
    const key = (t.scenario || '').trim().toLowerCase();
    if (!key || seenTests.has(key)) {
      return false;
    }
    seenTests.add(key);
    return true;
  });

  // Ensure every assumption/recommendation entry is explicitly prefixed
  const rawAssumptions = Array.isArray(gaps.assumptionsAndRecommendations)
    ? gaps.assumptionsAndRecommendations
    : [];
  const labeledAssumptions = rawAssumptions
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) =>
      /^(Assumption|Recommendation)\s*:/i.test(item) ? item : `Assumption: ${item}`
    );

  const storyIdMap = new Map<string, string>();
  const normalizedStories = dedupedStories.map((s, idx) => {
    const newId = `US-${String(idx + 1).padStart(2, '0')}`;
    if (s.id?.trim()) {
      storyIdMap.set(s.id.trim(), newId);
    }
    return {
      id: newId,
      title: s.title?.trim() || 'Untitled User Story',
      asA: stripLeadingKeyword(s.asA || defaultActor, 'As a'),
      iWant: stripLeadingKeyword(s.iWant || '', 'I want(?: to)?'),
      soThat: stripLeadingKeyword(s.soThat || '', 'So that'),
      priority:
        s.priority === 'Must Have' || s.priority === 'Should Have' || s.priority === 'Could Have'
          ? s.priority
          : ('Should Have' as const),
      notes: s.notes?.trim() || '',
    };
  });

  return {
    userStories: normalizedStories,
    acceptanceCriteria: acsRaw.map((a, idx) => {
      const rawRef = a.storyRef?.trim() || 'US-01';
      return {
        id: `AC-${String(idx + 1).padStart(2, '0')}`,
        storyRef: storyIdMap.get(rawRef) || rawRef,
        title: a.title?.trim() || 'Acceptance Criterion',
        given: stripLeadingKeyword(a.given || '', 'Given'),
        when: stripLeadingKeyword(a.when || '', 'When'),
        then: stripLeadingKeyword(a.then || '', 'Then'),
      };
    }),
    flows: flowsRaw.map((f, idx) => ({
      id: `FLOW-${String(idx + 1).padStart(2, '0')}`,
      title: f.title?.trim() || 'User Flow',
      flowType: f.flowType === 'Alternative Flow' ? 'Alternative Flow' : 'Happy Path',
      actor: f.actor?.trim() || defaultActor,
      trigger: f.trigger?.trim() || '',
      steps: Array.isArray(f.steps) ? f.steps.map((st) => st.trim()).filter(Boolean) : [],
      outcome: f.outcome?.trim() || '',
    })),
    edgeCases: edgesRaw.map((e, idx) => ({
      id: `EC-${String(idx + 1).padStart(2, '0')}`,
      category: e.category || 'Other',
      scenario: e.scenario?.trim() || '',
      expectedHandling: e.expectedHandling?.trim() || '',
      severity: e.severity === 'High' || e.severity === 'Low' ? e.severity : 'Medium',
    })),
    qaTestCases: dedupedTests.map((t, idx) => ({
      testId: `TC-${String(idx + 1).padStart(2, '0')}`,
      scenario: t.scenario?.trim() || '',
      preconditions: t.preconditions?.trim() || '',
      steps: Array.isArray(t.steps) ? t.steps.map((st) => st.trim()).filter(Boolean) : [],
      expectedResult: t.expectedResult?.trim() || '',
      priority: t.priority === 'High' || t.priority === 'Low' ? t.priority : 'Medium',
    })),
    gapAnalysis: {
      suppliedFacts: Array.isArray(gaps.suppliedFacts)
        ? gaps.suppliedFacts.map((item) => item.trim()).filter(Boolean)
        : [],
      assumptionsAndRecommendations: labeledAssumptions,
      missingInformationGaps: Array.isArray(gaps.missingInformationGaps)
        ? gaps.missingInformationGaps.map((item) => item.trim()).filter(Boolean)
        : [],
      clarifyingQuestions: Array.isArray(gaps.clarifyingQuestions)
        ? gaps.clarifyingQuestions.map((item) => item.trim()).filter(Boolean)
        : [],
      validationDisclaimer:
        gaps.validationDisclaimer?.trim() ||
        'Draft specification generated by StoryCraft AI. Not yet validated by engineering or QA.',
    },
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY?.trim() && process.env.GEMINI_API_KEY?.trim() !== 'MY_GEMINI_API_KEY'
    );
    res.json({ ok: true, configured: hasKey });
  });

  app.post('/api/generate', async (req: Request, res: Response) => {
    const body = req.body as Partial<FeatureInput> | undefined;
    const featureName = body?.featureName?.trim() ?? '';
    const featureDescription = body?.featureDescription?.trim() ?? '';
    const businessContext = body?.businessContext?.trim() ?? '';
    const userPersona = body?.userPersona?.trim() ?? '';
    const constraints = body?.constraints?.trim() ?? '';

    if (!featureName) {
      res.status(400).json({ error: 'Feature name is required.' });
      return;
    }
    if (!featureDescription || featureDescription.length < 10) {
      res.status(400).json({
        error: 'Feature description is required (please provide at least a short sentence describing the feature).',
      });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Add your Gemini API key in Settings > Secrets (or .env for local runs) and restart the server.',
      });
      return;
    }

    const normalizedInput: FeatureInput = {
      featureName,
      featureDescription,
      businessContext,
      userPersona,
      constraints,
    };

    const userPrompt = [
      `Feature Name: ${featureName}`,
      `Feature Description:\n${featureDescription}`,
      businessContext ? `Business Context:\n${businessContext}` : 'Business Context: Not provided by user.',
      userPersona
        ? `User Type / Persona: ${userPersona}`
        : 'User Type / Persona: NOT SPECIFIED — use generic "User" only. Do NOT invent specific roles like Superadmin, Store Manager, Moderator, etc.',
      constraints
        ? `Constraints and Business Rules:\n${constraints}`
        : 'Constraints and Business Rules: None explicitly provided by user.',
      '',
      'Generate non-redundant product documentation across Sections A-F following all strict rules: (1) zero invented roles, permissions, workflows, or rules; (2) use generic "User" if no persona was supplied; (3) label every assumption as "Assumption: ..."; (4) list confirmed facts separately from assumptions/recommendations and requirement gaps/questions; (5) ensure testable Given/When/Then criteria and edge cases covering Invalid Input, Empty States, Boundary Conditions, Duplicate Actions, Network Failures, Permissions, and System Failures.',
    ].join('\n\n');

    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: userPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: storyCraftResponseSchema,
          },
        });

        const rawText = response.text?.trim();
        if (!rawText) {
          throw new Error('Gemini returned an empty response. Please try again.');
        }

        const parsed = JSON.parse(rawText) as Partial<StoryCraftOutput>;
        const normalized = normalizeOutput(parsed, normalizedInput);
        res.json({ output: normalized });
        return;
      } catch (err) {
        lastError = err;
        if (attempt < 2 && isRetryableError(err)) {
          await sleep(600 * Math.pow(2, attempt));
          continue;
        }
        break;
      }
    }

    const formatted = formatGeminiError(lastError);
    res.status(formatted.status).json({ error: formatted.message });
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Production build not found. Run npm run build first.');
      }
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StoryCraft AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start StoryCraft AI server:', err);
  process.exit(1);
});
