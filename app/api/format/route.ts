import { NextRequest, NextResponse } from 'next/server';
import { 
  TaskType, 
  PersonalPlanResult, 
  SoftwareRequirementResult, 
  FormattedResult,
  ErrorResponse 
} from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { notes, taskType } = await request.json();
    
    if (!notes || notes.trim() === '') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Notes are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json<ErrorResponse>(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Use explicit task type if provided (override), otherwise let AI detect
    const useAIDetection = !taskType || taskType === 'auto';

    // Build prompt based on task type or AI detection
    const { systemPrompt, userPrompt } = useAIDetection 
      ? buildAIDetectionPrompt(notes)
      : buildPrompts(notes, taskType);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        { error: 'AI API request failed' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Empty response from AI' },
        { status: 500 }
      );
    }

    const result = parseResponse(content, useAIDetection ? undefined : taskType);
    return NextResponse.json<FormattedResult>(result);
  } catch {
    return NextResponse.json<ErrorResponse>(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Build prompt that lets AI detect the task type and format accordingly
 */
function buildAIDetectionPrompt(notes: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are an intelligent assistant that analyzes notes and determines their category:

1. PERSONAL - Personal tasks, shopping lists, personal budgets, travel plans, personal to-dos, life planning, buying things for yourself
2. SOFTWARE - Software requirements, feature requests, technical specifications, API designs, system architecture, coding tasks
3. BUSINESS - Business operations, stakeholder meetings, KPIs, ROI analysis, team workflows, quarterly planning, business strategy
4. MARKETING - Marketing campaigns, ads, social media strategy, SEO, content planning, brand awareness, lead generation
5. FINANCIAL - Investment planning, portfolio management, financial analysis, accounting, tax planning, loans, corporate budgets

CRITICAL CLASSIFICATION RULES:
- PERSONAL: Individual/self-focused activities (shopping, rent, salary, personal goals)
- SOFTWARE: Explicitly mentions technical implementation, coding, APIs, databases, software features, programming languages, frameworks, or technical systems
- BUSINESS: Focuses on company operations, team management, workplace collaboration, team dynamics, internal processes, stakeholder management, team workflows, business strategy, meetings, operations, workplace communication, team conflicts, employee relations, team collaboration, or business metrics WITHOUT technical implementation details
- MARKETING: Focuses on campaigns, promotion, advertising, audience engagement, brand awareness, lead generation, social media, content, SEO, or customer acquisition
- FINANCIAL: Focuses on money management, investments, portfolio, financial analysis, accounting, tax, loans, budget, revenue, profit, or corporate finance

ADDITIONAL CLASSIFICATION GUIDELINES:
- Pay special attention to urgency/timeframe constraints (e.g. 'immediate', 'urgent', 'asap', 'right now', 'this week', 'two weeks', 'phased delivery', 'long-term')
- Identify temporal indicators that distinguish immediate fixes vs. long-term solutions (e.g. 'quick fix', 'band-aid solution', 'stopgap measure' vs. 'comprehensive solution', 'strategic initiative', 'long-term plan')
- Identify team dynamics and cultural factors (e.g. 'not their job', 'blame game', team collaboration issues)
- Recognize emotional cues and frustration in the text (e.g. 'frustrated', 'desperate', 'embarrassing', 'look like they're about to cry')
- Note cross-team collaboration needs (e.g. 'talk to X team and Y team')

DISTINCTION RULES:
- If notes mention technical implementation (coding, APIs, databases, software features), classify as SOFTWARE
- If notes focus on business operations, processes, workflows, or strategy WITHOUT technical implementation details, classify as BUSINESS
- If notes mention both business needs AND technical implementation, prioritize based on PRIMARY focus

Look at the PRIMARY INTENT of the notes to classify.

FORMAT RULES:
- PERSONAL → Use personal plan format (budget breakdown, execution steps, constraints)
- SOFTWARE/BUSINESS/MARKETING/FINANCIAL → Use professional requirements format (requirements, user stories, stakeholder questions)

Return ONLY valid JSON, no markdown or extra text.`,
    userPrompt: `Analyze these notes in detail and determine their category (personal, software, business, marketing, or financial).

ANALYSIS PROCESS:
1. Identify key terms and phrases in the notes AND any urgency/timeframe constraints or temporal indicators (e.g. 'immediate', 'urgent', 'asap', 'right now', 'this week', 'two weeks', 'phased delivery', 'long-term', 'quick fix', 'band-aid solution', 'stopgap measure' vs. 'comprehensive solution', 'strategic initiative', 'long-term plan') or team dynamics indicators (e.g. 'not their job', 'blame game', 'team collaboration', 'talk to X team and Y team')
2. Determine the primary intent: Is this about technical implementation, business operations, personal tasks, marketing activities, or financial planning?
3. Look for specific indicators:
   - SOFTWARE: coding, APIs, databases, software features, programming languages, frameworks, technical systems
   - BUSINESS: operations, processes, workflows, stakeholder needs, KPIs, ROI, revenue, profit, business strategy, team management, workplace collaboration, team dynamics, team conflicts, employee relations, workplace communication
   - MARKETING: campaigns, promotion, advertising, audience, brand, social media, SEO, customer acquisition
   - FINANCIAL: investments, portfolio, accounting, tax, loans, budget, revenue, profit, finance
   - PERSONAL: individual activities, shopping, personal goals

CLASSIFICATION:
- If technical implementation details are present (coding, APIs, databases, software features, programming languages, frameworks) → SOFTWARE
- If focused on business operations, team management, workplace collaboration, team dynamics, internal processes, stakeholder management, team workflows, business strategy, workplace communication, team conflicts, employee relations, meetings, operations, KPIs, ROI, revenue, profit WITHOUT technical implementation details → BUSINESS
- If focused on marketing activities (campaigns, promotion, advertising, audience, brand, social media) → MARKETING
- If focused on financial matters (investments, portfolio, accounting, tax, loans, budget, revenue, profit) → FINANCIAL
- If focused on personal tasks (individual activities, shopping, personal goals) → PERSONAL

EXAMPLES:
- "We need to build a login API with JWT authentication" → SOFTWARE (technical implementation)
- "We need to improve our customer onboarding process to increase retention" → BUSINESS (business process without technical details)
- "The vibe in the office has been off between design and marketing teams, we need to fix the collaboration issue" → BUSINESS (team dynamics and workplace collaboration)
- "We need to run a social media campaign to increase brand awareness" → MARKETING
- "We need to analyze our Q3 revenue and expenses" → FINANCIAL
- "I need to buy groceries and schedule a doctor appointment" → PERSONAL

FIRST: Classify based on the content's primary intent using the above guidelines.
THEN: Format according to that classification.

If PERSONAL, return JSON:
{
  "detectedType": "personal",
  "taskName": "Clear name for this plan",
  "summary": "2-3 sentence summary",
  "budget": { 
    "total": 0, 
    "currency": "NGN", 
    "categories": [
      {
        "name": "",
        "allocated": 0,
        "items": [
          { "name": "", "amount": 0, "quantity": 1, "notes": "" }
        ]
      }
    ], 
    "remaining": 0 
  },
  "executionSteps": [
    { "id": "1", "action": "", "details": "", "location": "", "tips": ["", ""], "completed": false },
    { "id": "2", "action": "", "details": "", "location": "", "tips": ["", ""], "completed": false }
  ],
  "constraints": ["", ""],
  "checkpoints": ["", ""],
  "timeline": "",
  "unclearPoints": [
    { "id": "UC-001", "issue": "", "impact": "", "suggestedResolution": "" },
    { "id": "UC-002", "issue": "", "impact": "", "suggestedResolution": "" }
  ],
  "risks": [
    { "risk": "", "mitigation": "" },
    { "risk": "", "mitigation": "" }
  ]
}

If SOFTWARE, BUSINESS, MARKETING, or FINANCIAL, return JSON:
{
  "detectedType": "software" | "business" | "marketing" | "financial",
  "taskName": "Task/project name",
  "summary": "Executive summary",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "estimatedComplexity": "Simple" | "Moderate" | "Complex",
  "executiveSummary": {
    "problemStatement": "Clear description of the core issue",
    "immediateActions": ["", ""],
    "timeline": "Overall timeline and key milestones",
    "owners": ["", ""]
  },
  "functionalRequirements": [
    { "id": "FR-001", "title": "", "description": "", "acceptanceCriteria": ["", ""] },
    { "id": "FR-002", "title": "", "description": "", "acceptanceCriteria": ["", ""] }
  ],
  "timePhasedPlan": {
    "phase1": {
      "name": "Immediate Actions",
      "description": "Actions to take right away",
      "timeline": "When to complete",
      "owners": ["", ""]
    },
    "phase2": {
      "name": "Short-term Actions",
      "description": "Actions to take next",
      "timeline": "When to complete",
      "owners": ["", ""]
    },
    "phase3": {
      "name": "Long-term Actions",
      "description": "Strategic follow-up actions",
      "timeline": "When to complete",
      "owners": ["", ""]
    }
  },
  "technicalRequirements": [
    { "id": "TR-001", "title": "", "description": "" },
    { "id": "TR-002", "title": "", "description": "" }
  ],
  "userStories": [
    { "id": "US-001", "persona": "", "action": "", "benefit": "" },
    { "id": "US-002", "persona": "", "action": "", "benefit": "" }
  ],
  "unclearPoints": [
    { "id": "UC-001", "issue": "", "impact": "", "suggestedResolution": "" },
    { "id": "UC-002", "issue": "", "impact": "", "suggestedResolution": "" }
  ],
  "questionsForStakeholder": [
    { "id": "Q-001", "question": "", "context": "", "options": ["", ""] },
    { "id": "Q-002", "question": "", "context": "", "options": ["", ""] }
  ],
  "assumptions": ["", ""],
  "outOfScope": ["", ""],
  "dependencies": ["", ""],
  "risks": [
    { "risk": "", "mitigation": "" },
    { "risk": "", "mitigation": "" }
  ]
}

Notes to analyze:
${notes}`
  };
}


function buildPrompts(notes: string, taskType: TaskType): { systemPrompt: string; userPrompt: string } {
  if (taskType === 'personal') {
    return {
      systemPrompt: `You are a personal planning assistant. Your job is to transform messy personal notes into comprehensive, detailed execution plans.

CRITICAL RULES:
- DO NOT create software systems, mobile apps, or technical architectures
- DO NOT add technical requirements, API specs, or system designs
- DO NOT invent features the user didn't ask for
- Focus ONLY on: budget breakdown, actionable steps, constraints, risks, checkpoints, and timeline considerations
- Include detailed budget categories, cost estimates, and financial planning
- Provide comprehensive execution steps with locations, resources needed, and timing
- Address potential obstacles, risk mitigation strategies, and contingency plans
- Include detailed timeline planning and milestone tracking
- Consider resource availability, scheduling constraints, and dependency management
- When detecting crisis language (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), automatically structure deliverables with clear crisis response phases and timeline
- Include specific crisis response elements: immediate actions (24-hour), short-term actions (by deadline), stakeholder communications, and owner assignments
- Address the emotional context and urgency explicitly in the output structure

Return ONLY valid JSON, no markdown or extra text.`,
      userPrompt: `Transform these personal notes into a clear execution plan.

Follow this comprehensive analysis process:
1. Identify the core activity AND any urgency/timeframe constraints or temporal indicators (e.g. 'immediate', 'urgent', 'asap', 'right now', 'this week', 'two weeks', 'phased delivery', 'long-term', 'quick fix', 'band-aid solution', 'stopgap measure' vs. 'comprehensive solution', 'strategic initiative', 'long-term plan') or collaboration needs (e.g. 'talk to X team and Y team')
2. Define clear goals and specific needs in detail
3. Create comprehensive budget breakdown with detailed categories, cost estimates, and financial planning
4. Define detailed execution steps with locations, resources needed, timing, and comprehensive tips - when crisis language is detected (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), prioritize immediate crisis response actions in early steps and structure them with clear time-bound deliverables
5. Identify all constraints, risks, checkpoints, and potential obstacles
6. Note any unclear points that need clarification with specific questions
7. Address any dependencies or collaboration needs if mentioned
8. Consider resource availability, scheduling constraints, and dependency management
9. Include risk mitigation strategies and contingency plans
10. Develop detailed timeline planning with milestones and tracking mechanisms
11. Distinguish between immediate fixes/quick wins and long-term strategic solutions, structuring deliverables accordingly
12. When crisis language is detected, ensure the summary section includes a clear executive summary with immediate actions, timeline, and owner assignments
13. Structure execution steps with specific timeframes and measurable outcomes when crisis language is detected

Return JSON in this EXACT format:
{
  "detectedType": "personal",
  "taskName": "Clear name for this plan",
  "summary": "2-3 sentence summary of what needs to be done",
  "budget": {
    "total": 150000,
    "currency": "NGN",
    "categories": [
      {
        "name": "Category name",
        "allocated": 50000,
        "items": [
          { "name": "Item name", "amount": 20000, "quantity": 2, "notes": "Optional tips" }
        ]
      }
    ],
    "remaining": 10000
  },
  "executionSteps": [
    {
      "id": "1",
      "action": "What to do",
      "details": "How to do it",
      "location": "Where (if applicable)",
      "tips": ["Tip 1", "Tip 2"],
      "completed": false
    }
  ],
  "constraints": ["Constraint 1", "Constraint 2"],
  "checkpoints": ["Checkpoint 1", "Checkpoint 2"],
  "timeline": "When to complete",
  "unclearPoints": [
    {
      "id": "UC-001",
      "issue": "What's unclear",
      "impact": "Why it matters",
      "suggestedResolution": "How to resolve"
    }
  ],
  "risks": [
    { "risk": "Risk description", "mitigation": "How to handle" }
  ]
}

Notes to transform:
${notes}`
    };
  }
  
  if (taskType === 'business') {
    return {
      systemPrompt: `You are a business analyst and strategy consultant. Your job is to transform business meeting notes into comprehensive, detailed business action plans and process improvements.

CRITICAL RULES:
- Focus on business operations, team dynamics, process improvements, stakeholder management, workplace communication, team collaboration, and business workflows
- DO NOT create technical specifications unless specifically requested
- Include business impact, team effectiveness, communication improvements, and stakeholder alignment
- Frame requirements in terms of business processes, team workflows, communication protocols, and organizational improvements
- Address organizational challenges, stakeholder concerns, and implementation barriers
- Include detailed process mapping, role definitions, and accountability measures
- Consider business metrics, KPIs, and success measurement frameworks
- Address change management and adoption challenges
- Include detailed stakeholder analysis and communication strategies
- When detecting crisis language (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), automatically structure deliverables with clear crisis response phases and timeline
- Include specific crisis response elements: immediate actions (24-hour), short-term actions (by deadline), stakeholder communications, and owner assignments
- Address the emotional context and urgency explicitly in the output structure

Return ONLY valid JSON, no markdown or extra text.`,
      userPrompt: `Transform these business notes into a structured business action plan.

Follow this comprehensive analysis process:
1. Identify the core business initiative AND any urgency/timeframe constraints or temporal indicators (e.g. 'immediate', 'urgent', 'asap', 'right now', 'this week', 'two weeks', 'phased delivery', 'long-term', 'quick fix', 'band-aid solution', 'stopgap measure' vs. 'comprehensive solution', 'strategic initiative', 'long-term plan') or team dynamics indicators (e.g. 'not their job', 'blame game', 'team collaboration', 'talk to X team and Y team')
2. Define stakeholders and their specific needs in detail, including team dynamics and cultural factors (e.g. 'not their job', 'blame game', team collaboration issues)
3. Extract all business process requirements with comprehensive acceptance criteria that are specific and measurable - when crisis language is detected (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), prioritize immediate crisis response actions in early requirements and structure them with clear time-bound deliverables
4. Identify business requirements, organizational constraints, and implementation barriers
5. Note any unclear points that need clarification with specific questions
6. Consider potential business risks, dependencies, scalability challenges, and team adoption challenges
7. Address cross-team collaboration needs if mentioned (e.g. 'talk to X team and Y team')
8. Analyze stakeholder impact, communication protocols, and accountability measures
9. Consider business metrics, KPIs, success measurement frameworks, and performance indicators
10. Identify change management needs and organizational adoption strategies
11. Distinguish between immediate fixes/quick wins and long-term strategic solutions, structuring deliverables accordingly
12. When crisis language is detected, ensure the summary section includes a clear executive summary with immediate actions, timeline, and owner assignments
13. Structure acceptance criteria with specific timeframes and measurable outcomes when crisis language is detected

Return JSON in this EXACT format:
{
  "detectedType": "business",
  "taskName": "Clear, professional business task/project name",
  "summary": "2-3 sentence executive summary of the business initiative",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "estimatedComplexity": "Simple" | "Moderate" | "Complex",
  "functionalRequirements": [
    {
      "id": "BR-001",
      "title": "Business process requirement title",
      "description": "Detailed description of what the business process or team workflow must accomplish",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2"]
    }
  ],
  "technicalRequirements": [
    {
      "id": "TR-001",
      "title": "Technical requirement title",
      "description": "Technical implementation detail if applicable, otherwise keep minimal"
    }
  ],
  "userStories": [
    {
      "id": "BS-001",
      "persona": "Team member, stakeholder, or business role",
      "action": "What they need to accomplish",
      "benefit": "Business value or team improvement they will realize"
    }
  ],
  "unclearPoints": [
    {
      "id": "UC-001",
      "issue": "What's unclear about the business process or team dynamic",
      "impact": "Why this matters for team effectiveness or business operations",
      "suggestedResolution": "How to resolve"
    }
  ],
  "questionsForStakeholder": [
    {
      "id": "Q-001",
      "question": "The business question to ask",
      "context": "Why this question matters for team dynamics or business process",
      "options": ["Possible answer 1", "Possible answer 2"]
    }
  ],
  "assumptions": ["Business process assumption 1", "Business process assumption 2"],
  "outOfScope": ["What's NOT included in business scope"],
  "dependencies": ["Business process dependencies or stakeholder dependencies"],
  "risks": [
    { "risk": "Business risk or team dynamic risk", "mitigation": "How to mitigate" }
  ]
}

Business Notes:
${notes}`
    };
  }
  
  if (taskType === 'marketing') {
    return {
      systemPrompt: `You are a marketing strategist and campaign manager. Your job is to transform marketing notes into comprehensive, detailed marketing campaign plans that drive measurable results.

CRITICAL RULES:
- Focus on campaigns, audience targeting, engagement metrics, brand awareness, and marketing channels
- Include specific marketing KPIs, conversion metrics, and audience insights
- Define clear campaign objectives, target segments, and success metrics
- DO NOT create technical specifications unless specifically requested
- Ensure all requirements are actionable and measurable
- Include detailed audience personas, content strategies, and channel-specific tactics
- Address budget allocation, resource planning, and timeline considerations
- Consider competitive landscape and market positioning
- Include detailed measurement frameworks and attribution models
- Address cross-channel coordination and integrated marketing approaches
- When detecting crisis language (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), automatically structure deliverables with clear crisis response phases and timeline
- Include specific crisis response elements: immediate actions (24-hour), short-term actions (by deadline), stakeholder communications, and owner assignments
- Address the emotional context and urgency explicitly in the output structure

Create comprehensive marketing plans that marketing teams can execute effectively.

Return ONLY valid JSON, no markdown or extra text.`,
      userPrompt: `Transform these marketing notes into a comprehensive, actionable marketing campaign plan that can drive measurable results.

Follow this comprehensive analysis process:
1. Identify the primary campaign objective and target audience AND any urgency/timeframe constraints or temporal indicators (e.g. 'immediate', 'urgent', 'asap', 'right now', 'this week', 'two weeks', 'phased delivery', 'long-term', 'quick fix', 'band-aid solution', 'stopgap measure' vs. 'comprehensive solution', 'strategic initiative', 'long-term plan')
2. Define specific marketing goals and success metrics in detail
3. Extract all campaign requirements with comprehensive measurable outcomes - when crisis language is detected (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), prioritize immediate crisis response actions in early requirements and structure them with clear time-bound deliverables
4. Identify detailed audience personas and their specific needs, preferences, and behaviors
5. Note any unclear points that need clarification with specific questions
6. Consider potential marketing risks, dependencies, scalability challenges, and team adoption challenges
7. Address cross-team collaboration needs if mentioned (e.g. 'talk to X team and Y team')
8. Analyze budget allocation, resource planning, and channel-specific tactics
9. Consider competitive landscape, market positioning, and differentiation strategies
10. Include detailed measurement frameworks, attribution models, and performance indicators
11. Distinguish between immediate fixes/quick wins and long-term strategic solutions, structuring deliverables accordingly
12. When crisis language is detected, ensure the summary section includes a clear executive summary with immediate actions, timeline, and owner assignments
13. Structure acceptance criteria with specific timeframes and measurable outcomes when crisis language is detected

Return JSON in this EXACT format:
{
  "detectedType": "marketing",
  "taskName": "Clear, professional marketing campaign name",
  "summary": "2-3 sentence summary of the marketing initiative and its business objective",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "estimatedComplexity": "Simple" | "Moderate" | "Complex",
  "functionalRequirements": [
    {
      "id": "MR-001",
      "title": "Specific marketing campaign requirement",
      "description": "Detailed description of what the marketing campaign must accomplish, including target audience, channels, and expected outcomes",
      "acceptanceCriteria": ["Measurable criterion 1", "Measurable criterion 2"]
    }
  ],
  "technicalRequirements": [
    {
      "id": "TR-001",
      "title": "Technical requirement title",
      "description": "Technical implementation detail if applicable, such as marketing platform requirements or tracking tools"
    }
  ],
  "userStories": [
    {
      "id": "MS-001",
      "persona": "Specific target audience segment or customer persona",
      "action": "Specific action the target audience should take",
      "benefit": "Clear value proposition or benefit they will receive"
    }
  ],
  "unclearPoints": [
    {
      "id": "UC-001",
      "issue": "Specific unclear aspect of the marketing strategy",
      "impact": "Why this matters for campaign success",
      "suggestedResolution": "How to resolve or what additional information is needed"
    }
  ],
  "questionsForStakeholder": [
    {
      "id": "Q-001",
      "question": "Specific marketing question that needs to be answered",
      "context": "Why this question is important for campaign success",
      "options": ["Possible answer 1", "Possible answer 2"]
    }
  ],
  "assumptions": ["Assumption about target audience", "Assumption about market conditions"],
  "outOfScope": ["Marketing activities explicitly excluded", "Out of bounds channels or tactics"],
  "dependencies": ["External marketing partner dependency", "Budget or resource dependency"],
  "risks": [
    { "risk": "Specific marketing or brand risk", "mitigation": "Specific way to address or minimize the risk" }
  ]
}

Marketing Notes:
${notes}`
    };
  }
  
  if (taskType === 'financial') {
    return {
      systemPrompt: `You are a financial analyst and planning expert. Your job is to transform financial notes into comprehensive, detailed financial planning and analysis documents that support sound financial decision-making.

CRITICAL RULES:
- Focus on investments, budgets, cash flow, ROI, financial metrics, and risk analysis
- Include specific financial projections, budget allocations, and measurable financial KPIs
- Define clear financial objectives, targets, and success metrics
- DO NOT create technical specifications unless specifically requested
- Ensure all requirements are quantifiable and financially actionable
- Include detailed financial modeling, scenario analysis, and sensitivity assessments
- Address regulatory compliance, audit requirements, and financial reporting needs
- Consider tax implications, cash flow timing, and funding requirements
- Include risk assessment frameworks and financial controls
- Address stakeholder reporting needs and financial governance structures
- When detecting crisis language (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), automatically structure deliverables with clear crisis response phases and timeline
- Include specific crisis response elements: immediate actions (24-hour), short-term actions (by deadline), stakeholder communications, and owner assignments
- Address the emotional context and urgency explicitly in the output structure

Create comprehensive financial plans that financial teams can execute effectively.

Return ONLY valid JSON, no markdown or extra text.`,
      userPrompt: `Transform these financial notes into a comprehensive, actionable financial plan that supports sound financial decision-making.

Follow this comprehensive analysis process:
1. Identify the primary financial objective and target metrics AND any urgency/timeframe constraints or temporal indicators (e.g. 'immediate', 'urgent', 'asap', 'right now', 'this week', 'two weeks', 'phased delivery', 'long-term', 'quick fix', 'band-aid solution', 'stopgap measure' vs. 'comprehensive solution', 'strategic initiative', 'long-term plan')
2. Define specific financial goals and quantifiable targets in detail
3. Extract all financial requirements with comprehensive measurable outcomes - when crisis language is detected (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), prioritize immediate crisis response actions in early requirements and structure them with clear time-bound deliverables
4. Identify key stakeholders and their specific financial needs and reporting requirements
5. Note any unclear points that need clarification with specific questions
6. Consider potential financial risks, dependencies, scalability challenges, and team adoption challenges
7. Address cross-team collaboration needs if mentioned (e.g. 'talk to X team and Y team')
8. Analyze financial modeling, scenario planning, and sensitivity assessments
9. Consider regulatory compliance, audit requirements, and tax implications
10. Include risk assessment frameworks, financial controls, and governance structures
11. Distinguish between immediate fixes/quick wins and long-term strategic solutions, structuring deliverables accordingly
12. When crisis language is detected, ensure the summary section includes a clear executive summary with immediate actions, timeline, and owner assignments
13. Structure acceptance criteria with specific timeframes and measurable outcomes when crisis language is detected

Return JSON in this EXACT format:
{
  "detectedType": "financial",
  "taskName": "Clear, professional financial plan name",
  "summary": "2-3 sentence summary of the financial initiative and its financial objective",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "estimatedComplexity": "Simple" | "Moderate" | "Complex",
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "Specific financial requirement",
      "description": "Detailed description of what the financial plan must accomplish, including budget allocations, investment targets, or financial metrics",
      "acceptanceCriteria": ["Quantifiable financial criterion 1", "Quantifiable financial criterion 2"]
    }
  ],
  "technicalRequirements": [
    {
      "id": "TR-001",
      "title": "Technical requirement title",
      "description": "Technical implementation detail if applicable, such as financial software or reporting system requirements"
    }
  ],
  "userStories": [
    {
      "id": "FS-001",
      "persona": "Specific financial stakeholder type",
      "action": "Specific financial action or decision they need to make",
      "benefit": "Clear financial outcome or value they will realize"
    }
  ],
  "unclearPoints": [
    {
      "id": "UC-001",
      "issue": "Specific unclear aspect of the financial plan",
      "impact": "Why this matters financially and potential consequences",
      "suggestedResolution": "How to resolve or what additional financial information is needed"
    }
  ],
  "questionsForStakeholder": [
    {
      "id": "Q-001",
      "question": "Specific financial question that needs to be answered",
      "context": "Why this question is important for financial planning",
      "options": ["Possible answer 1", "Possible answer 2"]
    }
  ],
  "assumptions": ["Financial assumption about market conditions", "Financial assumption about economic factors"],
  "outOfScope": ["Financial activities explicitly excluded", "Out of bounds financial activities"],
  "dependencies": ["External financial dependency", "Regulatory or compliance dependency"],
  "risks": [
    { "risk": "Specific financial or investment risk", "mitigation": "Specific way to address or minimize the financial risk" }
  ]
}

Financial Notes:
${notes}`
    };
  }

  // Default: Software Requirement
  return {
    systemPrompt: `You are a senior product manager and requirements analyst. Your job is to transform messy meeting notes into comprehensive, detailed, professional software requirements documents that help developers build exactly what's needed.

CRITICAL RULES:
- Extract ALL functional and technical requirements mentioned or implied
- Identify user personas and their specific needs in detail
- Define comprehensive acceptance criteria for each requirement
- Highlight dependencies, constraints, potential risks, and implementation challenges
- Ask clarifying questions for any ambiguous points
- Include detailed technical specifications, performance requirements, and system architecture considerations
- Provide specific implementation guidance and best practices
- Be extremely thorough and detailed - developers need comprehensive, actionable specifications
- Address scalability, security, performance, and maintainability concerns
- Include data flow diagrams, API specifications, and integration requirements if relevant
- Consider user experience, accessibility, and compliance requirements
- Address team dynamics, collaboration needs, and implementation challenges
- Include detailed error handling, logging, and monitoring requirements
- When detecting crisis language (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), automatically structure deliverables with clear crisis response phases and timeline
- Include specific crisis response elements: immediate actions (24-hour), short-term actions (by deadline), stakeholder communications, and owner assignments
- Address the emotional context and urgency explicitly in the output structure

Focus on creating comprehensive requirements that will enable developers to build the right solution with minimal ambiguity and provide stress-reduction value to users.

Return ONLY valid JSON, no markdown or extra text.`,
    userPrompt: `Transform these messy notes into comprehensive, actionable software requirements that will enable developers to build exactly what's needed.

Follow this comprehensive analysis process:
1. Identify the core functionality being requested AND any urgency/timeframe constraints or temporal indicators (e.g. 'immediate', 'urgent', 'asap', 'right now', 'this week', 'two weeks', 'phased delivery', 'long-term', 'quick fix', 'band-aid solution', 'stopgap measure' vs. 'comprehensive solution', 'strategic initiative', 'long-term plan')
2. Define user personas and their specific needs in detail, including team dynamics and cultural factors (e.g. 'not their job', 'blame game', team collaboration issues)
3. Extract all functional requirements with comprehensive acceptance criteria that are specific and testable - when crisis language is detected (e.g. 'losing my mind', 'stressed', 'panic', 'urgent', 'bleeding', 'by [date]', 'deadline'), prioritize immediate crisis response actions in early requirements and structure them with clear time-bound deliverables
4. Identify technical requirements, system architecture considerations, performance requirements, security needs, and constraints
5. Note any unclear points that need clarification with specific questions
6. Consider potential risks, dependencies, scalability challenges, and team adoption challenges
7. Address cross-team collaboration needs if mentioned (e.g. 'talk to X team and Y team')
8. Analyze data flow, API specifications, integration requirements, and system dependencies
9. Consider user experience, accessibility, compliance, and monitoring requirements
10. Identify specific implementation challenges and provide detailed guidance
11. Distinguish between immediate fixes/quick wins and long-term strategic solutions, structuring deliverables accordingly
12. When crisis language is detected, ensure the summary section includes a clear executive summary with immediate actions, timeline, and owner assignments
13. Structure acceptance criteria with specific timeframes and measurable outcomes when crisis language is detected

Return JSON in this EXACT format:
{
  "detectedType": "software",
  "taskName": "Clear, professional task/feature name",
  "summary": "2-3 sentence executive summary of what needs to be built and why",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "estimatedComplexity": "Simple" | "Moderate" | "Complex",
  "executiveSummary": {
    "problemStatement": "Clear description of the core issue",
    "immediateActions": ["Action 1", "Action 2"],
    "timeline": "Overall timeline and key milestones",
    "owners": ["Owner 1", "Owner 2"]
  },
  "timePhasedPlan": {
    "phase1": {
      "name": "Immediate Actions",
      "description": "Actions to take right away",
      "timeline": "When to complete",
      "owners": ["Owner 1", "Owner 2"]
    },
    "phase2": {
      "name": "Short-term Actions", 
      "description": "Actions to take next",
      "timeline": "When to complete",
      "owners": ["Owner 1", "Owner 2"]
    },
    "phase3": {
      "name": "Long-term Actions",
      "description": "Strategic follow-up actions",
      "timeline": "When to complete",
      "owners": ["Owner 1", "Owner 2"]
    }
  },
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "Specific functional requirement title",
      "description": "Detailed description of what the system must do, including inputs, processes, and expected outputs",
      "acceptanceCriteria": ["Specific, testable criterion 1", "Specific, testable criterion 2"]
    }
  ],
  "technicalRequirements": [
    {
      "id": "TR-001",
      "title": "Technical requirement title",
      "description": "Specific technical implementation detail, technology choice, performance requirement, or system constraint"
    }
  ],
  "userStories": [
    {
      "id": "US-001",
      "persona": "Specific user role or persona",
      "action": "Specific action the user wants to perform",
      "benefit": "Clear business value or user benefit they will receive"
    }
  ],
  "unclearPoints": [
    {
      "id": "UC-001",
      "issue": "Specific unclear aspect that needs clarification",
      "impact": "Why this matters and what could go wrong if not clarified",
      "suggestedResolution": "How to resolve or what information is needed"
    }
  ],
  "questionsForStakeholder": [
    {
      "id": "Q-001",
      "question": "Specific question that needs to be answered",
      "context": "Why this question is important for the implementation",
      "options": ["Possible answer 1", "Possible answer 2"]
    }
  ],
  "assumptions": ["Assumption about requirements", "Assumption about technical approach"],
  "outOfScope": ["Feature or functionality explicitly excluded", "Out of bounds element"],
  "dependencies": ["External system dependency", "Team or resource dependency"],
  "risks": [
    { "risk": "Specific technical, business, or implementation risk", "mitigation": "Specific way to address or minimize the risk" }
  ]
}

Meeting Notes:
${notes}`
  };
}


function parseResponse(content: string, taskType?: TaskType): FormattedResult {
  let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  // Use AI-detected type from response, or explicit type if provided
  const detectedType = taskType || parsed.detectedType || 'software';
  
  if (detectedType === 'personal') {
    return parsePersonalPlanResult(parsed);
  }
  
  // For business, marketing, and financial, we'll use the same structure as software
  // since they all follow the same format
  return parseSoftwareRequirementResult(parsed);
}

function parsePersonalPlanResult(parsed: Record<string, unknown>): PersonalPlanResult {
  return {
    detectedType: 'personal',
    taskName: (parsed.taskName as string) || 'Untitled Plan',
    summary: (parsed.summary as string) || '',
    budget: parsed.budget as PersonalPlanResult['budget'],
    executionSteps: (parsed.executionSteps as PersonalPlanResult['executionSteps']) || [],
    constraints: (parsed.constraints as string[]) || [],
    checkpoints: (parsed.checkpoints as string[]) || [],
    timeline: parsed.timeline as string,
    unclearPoints: (parsed.unclearPoints as PersonalPlanResult['unclearPoints']) || [],
    risks: (parsed.risks as PersonalPlanResult['risks']) || []
  };
}

function parseSoftwareRequirementResult(parsed: Record<string, unknown>): SoftwareRequirementResult {
  return {
    detectedType: 'software',
    taskName: (parsed.taskName as string) || 'Untitled Task',
    summary: (parsed.summary as string) || '',
    priority: (parsed.priority as SoftwareRequirementResult['priority']) || 'MEDIUM',
    estimatedComplexity: (parsed.estimatedComplexity as SoftwareRequirementResult['estimatedComplexity']) || 'Moderate',
    executiveSummary: parsed.executiveSummary as SoftwareRequirementResult['executiveSummary'],
    timePhasedPlan: parsed.timePhasedPlan as SoftwareRequirementResult['timePhasedPlan'],
    functionalRequirements: (parsed.functionalRequirements as SoftwareRequirementResult['functionalRequirements']) || [],
    technicalRequirements: (parsed.technicalRequirements as SoftwareRequirementResult['technicalRequirements']) || [],
    userStories: (parsed.userStories as SoftwareRequirementResult['userStories']) || [],
    unclearPoints: (parsed.unclearPoints as SoftwareRequirementResult['unclearPoints']) || [],
    questionsForStakeholder: (parsed.questionsForStakeholder as SoftwareRequirementResult['questionsForStakeholder']) || [],
    assumptions: (parsed.assumptions as string[]) || [],
    outOfScope: (parsed.outOfScope as string[]) || [],
    dependencies: (parsed.dependencies as string[]) || [],
    risks: (parsed.risks as SoftwareRequirementResult['risks']) || []
  };
}
