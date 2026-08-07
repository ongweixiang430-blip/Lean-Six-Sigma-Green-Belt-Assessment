export function getQuestionExplanation(id: string, text: string, correctAnswer: string): string {
  const txt = text.toLowerCase();
  
  // Hand-tuned rich explanations for core concepts
  if (id === 'LSSGB-01') {
    return `A Prioritization Matrix is a quantitative decision-making tool used to rank projects, ideas, or alternatives based on weighted criteria like impact, effort, and cost. Gantt Charts are for scheduling, Control Charts track variation over time, and Scatter Diagrams analyze relationships between two variables.`;
  }
  if (id === 'LSSGB-02') {
    return `Active support, visible leadership, and commitment of top management are the absolute primary success factors for Lean Six Sigma implementation. Without executive sponsorship, change initiatives fail to receive resources, alignment, or organizational buy-in.`;
  }
  if (id === 'LSSGB-03' || id === 'LSSGB-46' || id === 'LSSGB-136') {
    return `Lean's primary objective is the systematic identification and complete elimination of waste (Muda) to optimize process flow and maximize customer value. Six Sigma, conversely, concentrates primarily on reducing variation.`;
  }
  if (id === 'LSSGB-04' || id === 'LSSGB-47' || id === 'LSSGB-137') {
    return `Six Sigma's core focus is reducing process variation. By stabilizing processes and minimizing deviation around the mean, businesses achieve highly predictable, repeatable outcomes with ultra-low defect rates.`;
  }
  if (id === 'LSSGB-05') {
    return `Organizational culture is the set of shared assumptions, values, symbols, and beliefs that guide how people behave in organizations. It is taught to new members as the correct way to perceive, think, and feel.`;
  }
  if (id === 'LSSGB-06' || id === 'LSSGB-07') {
    return `Safety in continuous improvement is two-dimensional: Physical Safety (preventing bodily harm) and Psychological Safety (creating a trust-filled environment where people feel safe to speak up, share ideas, voice concerns, and make mistakes without fear of retribution).`;
  }
  if (id === 'LSSGB-08' || id === 'LSSGB-78' || id === 'LSSGB-195') {
    return `The Fishbone Diagram, also known as the Ishikawa or Cause-and-Effect diagram, is a visual brainstorming tool used to identify, organize, and explore all potential root causes of a specific problem, grouping them into standard categories like the 6 Ms.`;
  }
  if (id === 'LSSGB-09' || id === 'LSSGB-31' || id === 'LSSGB-198') {
    return `The Voice of the Customer (VOC) represents the stated and unstated needs and requirements of the customer. Every functional requirement of a project or process must be traceable back to these customer expectations to ensure value-add alignment.`;
  }
  if (id === 'LSSGB-11' || id === 'LSSGB-141' || id === 'LSSGB-190') {
    return `RCA stands for Root Cause Analysis. It is a systematic process for identifying the underlying, fundamental causes of process problems or failures, ensuring that corrective actions address the actual cause rather than merely treating symptoms.`;
  }
  if (id === 'LSSGB-12' || id === 'LSSGB-13') {
    return `The 5M + E is a categorization framework used in Fishbone (Ishikawa) diagrams to group causes. It stands for: Manpower/Mindset, Machine, Material, Method, Measurement, and Environment (the 'E').`;
  }
  if (id === 'LSSGB-14') {
    return `According to quality management pioneer W. Edwards Deming, approximately 85% of all operational problems and defects are caused by the system or process design itself, while only about 15% are due to individual worker error or special assignable causes.`;
  }
  if (id === 'LSSGB-15') {
    return `Servant Leadership is a leadership philosophy where the leader's primary goal is to serve their team. It emphasizes empathy, listening, coaching, and removing barriers to help employees succeed and grow in their roles.`;
  }
  if (id === 'LSSGB-17') {
    return `The Pareto Principle (80/20 Rule) states that approximately 80% of consequences or defects come from 20% of the causes. In Six Sigma, this helps teams focus their limited resources on the 'vital few' root causes rather than the 'useful many'.`;
  }
  if (id === 'LSSGB-18' || id === 'LSSGB-19') {
    return `In the Lean House model, the foundation represents Culture & Engagement (including standardized work and stable processes), while the ultimate outputs are Quality, Cost, Delivery, and Innovation.`;
  }
  if (id === 'LSSGB-20' || id === 'LSSGB-22' || id === 'LSSGB-24' || id === 'LSSGB-25') {
    return `Control charts monitor statistical variation: I-MR (Individual-Moving Range) is used for continuous data with subgroup size of 1. X-bar R tracks continuous data with subgroup sizes of 2-10. P charts track proportion of defectives, and NP charts track the actual count of defectives in a constant sample.`;
  }
  if (id === 'LSSGB-23' || id === 'LSSGB-128') {
    return `A Six Sigma quality level mathematically corresponds to exactly 3.4 defects per million opportunities (DPMO). This standard accounts for a typical long-term process mean shift of 1.5 standard deviations.`;
  }
  if (id === 'LSSGB-26') {
    return `Return on Investment (ROI) is calculated as (Total Net Benefit / Total Cost) x 100%. It measures the efficiency and financial gain of an investment relative to its cost.`;
  }
  if (id === 'LSSGB-27' || id === 'LSSGB-28' || id === 'LSSGB-29' || id === 'LSSGB-30') {
    return `SWOT stands for Strengths, Weaknesses, Opportunities, and Threats. It is a strategic planning framework used to evaluate an organization's internal state (Strengths and Weaknesses) and external environment (Opportunities and Threats).`;
  }
  if (id === 'LSSGB-32' || id === 'LSSGB-63' || id === 'LSSGB-65' || id === 'LSSGB-66' || id === 'LSSGB-183') {
    return `Activities are categorized into: Value Add (tasks the customer is willing to pay for and which physically transform the product/service), Non-Value Add (pure waste), and Business Non-Value Add (tasks that do not add customer value but are legally, contractually, or operationally required).`;
  }
  if (id === 'LSSGB-35' || id === 'LSSGB-200') {
    return `CTQ stands for Critical to Quality. These are the key, measurable characteristics of a product or service whose performance standards must be met in order to satisfy the voice of the customer (VOC).`;
  }
  if (id === 'LSSGB-36' || id === 'LSSGB-64' || id === 'LSSGB-180') {
    return `Kaizen means 'continuous improvement' in Japanese. A Kaizen Event is a highly focused, multi-day workshop (usually consisting of 4 to 8 cross-functional team members) dedicated to mapping, analyzing, and improving a specific target process.`;
  }
  if (id === 'LSSGB-38') {
    return `ANOVA stands for Analysis of Variance. It is a statistical test used to evaluate the difference among three or more group means to determine if variation is due to random chance or statistically significant factors.`;
  }
  if (id === 'LSSGB-40' || id === 'LSSGB-41' || id === 'LSSGB-42' || id === 'LSSGB-44' || id === 'LSSGB-45' || id === 'LSSGB-89') {
    return `In Measurement System Analysis (MSA), total variance is split into process variance and measurement variance. Accuracy represents closeness to the true value (influenced by bias, stability, and linearity), while Precision represents statistical consistency (repeatability and reproducibility).`;
  }
  if (id === 'LSSGB-43') {
    return `A Paired t-test compares the means of two related groups (such as 'Before' and 'After' training scores of the same workers) to determine whether there is a statistically significant difference between them.`;
  }
  if (id === 'LSSGB-48' || id === 'LSSGB-49' || id === 'LSSGB-50' || id === 'LSSGB-51' || id === 'LSSGB-52' || id === 'LSSGB-142') {
    return `SIPOC is a high-level process mapping tool representing Suppliers, Inputs, Process, Outputs, and Customers. It helps the project team identify key stakeholders and define the boundaries and elements of the system.`;
  }
  if (id === 'LSSGB-55' || id === 'LSSGB-56' || id === 'LSSGB-57' || id === 'LSSGB-58' || id === 'LSSGB-94' || id === 'LSSGB-95' || id === 'LSSGB-96' || id === 'LSSGB-97' || id === 'LSSGB-98') {
    return `Tuckman's team development model defines four distinct stages: Forming (seeking inclusion, setting rules), Storming (navigating conflict, seeking direction/authority), Norming (cohesive agreement, mutual respect), and Performing (autonomous collaboration, driving for results).`;
  }
  if (id === 'LSSGB-71' || id === 'LSSGB-90' || id === 'LSSGB-168') {
    return `FMEA stands for Failure Mode and Effects Analysis. It is a proactive, risk-assessment tool used to identify potential failure points in a process. Risks are prioritized using the Risk Priority Number (RPN), which is calculated as: Severity x Occurrence x Detection.`;
  }
  if (id === 'LSSGB-72') {
    return `The Theory of Constraints (TOC) asserts that every process has a limiting bottleneck. In most service and manufacturing environments, constraints are not physical limits but rather policies, rules, and procedures.`;
  }
  if (id === 'LSSGB-74' || id === 'LSSGB-81' || id === 'LSSGB-146' || id === 'LSSGB-189') {
    return `Poka-yoke is a Japanese phrase meaning 'mistake-proofing' or 'error-proofing'. It refers to design features or mechanisms built directly into a process to prevent human error or immediately halt operations if a mistake occurs, making it impossible to produce a defect.`;
  }
  if (id === 'LSSGB-83') {
    return `SMED stands for Single-Minute Exchange of Die. It is a Lean technique pioneered by Shigeo Shingo to dramatically reduce machine set-up and changeover times down to a single-digit number of minutes (less than 10 minutes), boosting flexibility and flow.`;
  }
  if (id === 'LSSGB-84' || id === 'LSSGB-120' || id === 'LSSGB-121' || id === 'LSSGB-122' || id === 'LSSGB-123' || id === 'LSSGB-124' || id === 'LSSGB-125' || id === 'LSSGB-126' || id === 'LSSGB-127' || id === 'LSSGB-184') {
    return `Waste in Lean is categorized into 8 types using the acronym DOWNTIME: Defects, Overproduction, Waiting, Non-utilized talent/skills, Transportation, Inventory, Motion, and Extra processing. Eliminating these wastes directly shortens cycle times.`;
  }
  if (id === 'LSSGB-85' || id === 'LSSGB-149' || id === 'LSSGB-187') {
    return `Kanban is a visual signaling system used to enable pull-based production. It prevents overproduction and excessive inventory by signaling upstream workstations to produce or move parts only when a downstream process requests them.`;
  }
  if (id === 'LSSGB-103' || id === 'LSSGB-131' || id === 'LSSGB-132' || id === 'LSSGB-133' || id === 'LSSGB-134' || id === 'LSSGB-135' || id === 'LSSGB-178' || id === 'LSSGB-179') {
    return `DMAIC is the standard data-driven problem-solving structure in Six Sigma: Define the problem, Measure current performance, Analyze root causes of variation, Improve process capability by implementing solutions, and Control the process to sustain improvements.`;
  }
  if (id === 'LSSGB-112') {
    return `In a perfectly normal distribution, standard deviation intervals cover specific percentages of the population: ±1 sigma is 68.27%, ±2 sigma is 95.45% (often rounded to 95%), and ±3 sigma covers 99.73% of the data points.`;
  }
  if (id === 'LSSGB-113' || id === 'LSSGB-153') {
    return `In the Six Sigma equation Y = f(x), Y represents the critical process output variable (the effect/result), while x represents the input variables or process factors (the causes). To control Y, you must measure and manage x.`;
  }
  if (id === 'LSSGB-157') {
    return `Takt Time is the pace at which a process must produce to meet customer demand. It is calculated as: Net Available Time for Production / Customer Demand. It represents the heartbeat of a balanced process.`;
  }
  if (id === 'LSSGB-173' || id === 'LSSGB-176' || id === 'LSSGB-191') {
    return `Gemba is a Japanese term meaning 'the real place'—where value is actually created. A Gemba Walk involves leadership going directly to the workspace to observe processes, engage with frontline employees, and identify wastes.`;
  }
  if (id === 'LSSGB-193') {
    return `Standard Work is the documented, best-known method for safely and efficiently performing a task, agreed upon by the team. It forms the baseline for continuous improvement; without standards, there can be no stable basis for improvement.`;
  }

  // Dynamic Contextual Explanation for general questions
  const cleanAnswer = correctAnswer.replace(/[“”"']/g, '');
  if (txt.includes('waste')) {
    return `The correct answer is "${correctAnswer}". This relates directly to Lean's core mission: mapping value streams and eliminating the 8 wastes (DOWNTIME) to optimize throughput and cycle times.`;
  }
  if (txt.includes('variation')) {
    return `The correct answer is "${correctAnswer}". Reducing variation is the mathematical heart of Six Sigma, ensuring that process boundaries stay well within specification limits to maintain high yields.`;
  }
  if (txt.includes('process map') || txt.includes('swim lane') || txt.includes('flowchart')) {
    return `The correct answer is "${correctAnswer}". Process mapping and visual flowcharts are critical diagnostic tools used to visually inspect sequences, handover points, bottlenecks, and wastes in a workflow.`;
  }
  if (txt.includes('cost')) {
    return `The correct answer is "${correctAnswer}". Managing the Cost of Poor Quality (COPQ) divides costs into failure costs (internal/external) and appraisal/prevention costs to track the financial impacts of quality issues.`;
  }

  return `The correct answer is "${correctAnswer}". This concept is fundamental to the Lean Six Sigma Green Belt body of knowledge, requiring professionals to recognize standard visual cues, mathematical indices (like Cpk), and structured DMAIC problem-solving steps.`;
}
