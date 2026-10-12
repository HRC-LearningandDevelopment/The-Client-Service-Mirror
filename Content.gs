/**
 * CONTENT — every word the test shows lives here.
 * Profile colours: color = fill, text = text on white, on = text on top of the fill.
 * Edit text in this file only; the test page, the PDF and the sheet all read from it.
 */
var CONTENT = {
  title: 'The Client Service Mirror',
  subtitle: 'A behavioural assessment of how you serve your clients and stakeholders',
  instructions: '“Client” means anyone you serve, whether an external client or an internal team. For each scenario, choose the response that best describes what you would actually do, not what you think the “right” answer is. Answer honestly. There are no correct responses.',
  mirrorNote: 'The descriptions are intentionally direct. They are designed to serve as a mirror, not a judgment. Use your result to reflect on how your client service style may be experienced by others and what you can strengthen moving forward.',
  tieNote: 'Your answers split evenly between more than one profile. Read each one. Together they often reveal something useful.',

  questions: [
    { q: 'A client emails at 9am asking why a key performance number is worse than last month. You…',
      options: {
        A: 'Pull the data immediately and send a detailed metric breakdown by mid-morning.',
        B: 'Call them immediately — you want to resolve this on the call before it escalates.',
        C: 'Reply warmly to say you’re on it, then investigate and follow up.',
        D: 'Analyse the root cause and trend, then schedule a call to walk through the data and your prevention plan.' } },
    { q: 'Your quarterly business review is tomorrow. How do you prepare?',
      options: {
        A: 'Pull all KPIs. Make sure every metric is accurate, visualised, and ready to present.',
        B: 'Review the last three escalations and prepare clean resolution summaries.',
        C: 'Think carefully about how to frame any difficult news so it doesn’t upset the client.',
        D: 'Map performance trends to the client’s business goals and prepare forward-looking recommendations.' } },
    { q: 'A client says they’re ‘not happy with how things are going’ but gives no specifics. You…',
      options: {
        A: 'Send them a performance dashboard to show where you’re hitting every target.',
        B: 'Ask what specific issues to fix and commit to resolving them before end of day.',
        C: 'Spend the call listening and making them feel heard — rebuild the warmth first.',
        D: 'Ask structured questions to identify whether it’s operational, relational, or expectation-related.' } },
    { q: 'On Tuesday you realise a deliverable will be delayed until Thursday. The client expects it Wednesday. You…',
      options: {
        A: 'Flag it in the weekly report going out Thursday — with full context included.',
        B: 'Wait to see if you can fix it before telling the client. No point alarming them early.',
        C: 'Call Tuesday afternoon — focus on the apology and making sure they know you care.',
        D: 'Contact the client Tuesday morning, state the delay clearly, explain the impact, and confirm your revised plan.' } },
    { q: 'A team member consistently has tense interactions with a key client contact. You…',
      options: {
        A: 'Review the interaction logs and report on any measurable SLA or performance impact.',
        B: 'Step in and handle that client contact yourself going forward — problem solved.',
        C: 'Have an informal chat with the team member to check how they’re feeling about working with that client.',
        D: 'Coach the team member on the specific dynamic, role play it, then monitor and support their development.' } },
    { q: 'A client is fully satisfied — no escalations, SLAs met, calls going smoothly. You…',
      options: {
        A: 'Maintain current reporting cadence and performance standard. Don’t fix what isn’t broken.',
        B: 'Feel relieved and shift your attention to more demanding clients and projects.',
        C: 'Schedule a casual check-in call to keep the relationship warm and personal.',
        D: 'Use this stability to understand their next quarter’s priorities and get ahead of upcoming changes.' } },
    { q: 'You’re on a client call and they raise an issue you hadn’t flagged first. You feel…',
      options: {
        A: 'Focused — you start compiling data in your head to respond with evidence.',
        B: 'Alert — you commit to resolving it before end of day, whatever it takes.',
        C: 'Glad they felt comfortable raising it with you. You make sure they feel genuinely heard.',
        D: 'Reflective — you note it as a proactive monitoring gap and own the oversight straight away.' } },
    { q: 'A new client has just onboarded. What do your first 30 days look like?',
      options: {
        A: 'Set up reporting templates, share first-week data, and establish performance baselines.',
        B: 'Make yourself available to jump on any issues that come up as they get settled in.',
        C: 'Focus on relationship-building — lots of touchpoints, warmth, and rapport first.',
        D: 'Run a structured onboarding: understand their business goals, set explicit expectations, and map your work to their priorities.' } },
    { q: 'How do you define a truly successful client relationship?',
      options: {
        A: 'Consistent KPI performance, clean reporting, and no SLA breaches across the board.',
        B: 'The client knows without doubt you’ll be there and deliver when something goes wrong.',
        C: 'The client genuinely enjoys working with you and considers you a trusted partner.',
        D: 'The client proactively includes you in their planning and sees you as a strategic resource.' } },
    { q: 'When a client relationship ends — they decide to leave — your first reaction is to…',
      options: {
        A: 'Review the performance data to identify where SLAs or KPIs were missed.',
        B: 'Think through which escalations you handled and whether any could have gone differently.',
        C: 'Feel it personally — client relationships matter deeply to you, and losing one stings.',
        D: 'Analyse the full arc: what was the earliest signal? When did trust start to shift? What would you design differently?' } }
  ],

  profiles: {
    A: {
      name: 'The Scorecard Manager', short: 'Scorecard Manager', color: '#2683C6', text: '#1F6FA8', on: '#FFFFFF',
      headline: 'You manage with precision. Your clients feel measured, not partnered.',
      body: [
        'You are exceptionally good at what most people call “doing your job.” Your data is accurate. Your reports are on time. Your SLAs are consistently clean. And yet, something may still be missing from your client relationships.',
        'Here is what it may be: your clients feel managed, not partnered.',
        'They receive information from you, but they may not always receive understanding. When a key number spikes, you send a breakdown. When the quarterly review arrives, you have every metric accounted for. But sometimes, the client may leave the conversation feeling like they reviewed numbers instead of strengthening a relationship.',
        'The Scorecard Manager often believes that good performance, when properly documented, speaks for itself. In client service, it does not always work that way. Client leaders do not read reports only for accuracy. They read them through the lens of trust, context, and business impact. Trust is not a column in a spreadsheet.'
      ],
      clientsSay: 'They’re very professional. Always responsive. The data is always right. I just sometimes wish they would tell me what it actually means for us. I feel like I have to do the analysis myself.',
      blindSpot: 'You may be confusing compliance with care. You are measuring what is easy to count, but not always what the client is actually experiencing.',
      next30: [
        'After every performance update, add one sentence that translates the data into a specific business outcome the client cares about.',
        'In your next QBR, spend the first 10 minutes discussing what the numbers mean for the client’s goals, not just what the numbers are.',
        'Ask one client this week: “What would make this relationship feel different for you?” Then listen without defending.'
      ]
    },
    B: {
      name: 'The Firefighter', short: 'Firefighter', color: '#124163', text: '#124163', on: '#FFFFFF',
      headline: 'You are brilliant in a crisis. The problem is, there should not always be one.',
      body: [
        'You are the person people want during a crisis. Because of that, you may often find yourself in one.',
        'Your responsiveness is genuine and impressive. When a client escalates, you are there. When something breaks, you fix it. Your clients know they can count on you in an emergency, and that trust is real and hard-earned.',
        'But here is what the Firefighter must remember: the best managers do not just respond well when problems happen. They create conditions where the fires are less likely to start.',
        'Your clients may experience you as reliable in a crisis, but not always proactive. Over time, this can train clients to escalate because they have learned that this is when they get your strongest attention. Your work may not be chaotic because bad luck follows you. They may be chaotic because you have become excellent at reacting instead of preventing.'
      ],
      clientsSay: 'When things go wrong, they’re great. They really come through. But I keep wondering why we’re dealing with the same issues every quarter. I don’t feel like we’re ever getting ahead of anything.',
      blindSpot: 'Your responsiveness may have become your brand. The clients who value you most may also be the ones who are unsure whether you can prevent what is coming next.',
      next30: [
        'For each client relationship, identify the top three risks that exist right now before they become escalations. Write them down today.',
        'Schedule one proactive update per client each week that starts with: “Before you ask…”',
        'Track how many of your client interactions this month are reactive versus proactive. The number may surprise you.'
      ]
    },
    C: {
      name: 'The Pleaser', short: 'Pleaser', color: '#57B6C0', text: '#2B8791', on: '#0F2A30',
      headline: 'Your clients like you. They are just not always sure they can rely on you.',
      body: [
        'You may be one of the most personally appreciated client service styles. Your clients genuinely like you. They look forward to your calls, refer to you by first name, and may tell others that you are easy to work with.',
        'That warmth is real. It is a skill. But it can also quietly affect your credibility if it is not balanced with clarity and follow-through.',
        'The Pleaser’s common challenge is the quick “yes.” You may commit to timelines before confirming them with the team. You may agree to deliverables before mapping the dependencies. You may say, “Of course, by Friday,” because the client sounds stressed and you want to help. Then Friday comes, and the email goes out late with a partial deliverable and a very warm apology.',
        'Your clients may like you, but they may also learn to follow up as a habit. In client service, likability without reliability becomes a slow leak in trust.'
      ],
      clientsSay: 'I love working with them. So warm, always willing. I just… I’ve started following up as a habit. They’re good people, but I’ve learned not to assume it’s done until I check.',
      blindSpot: 'You may be mistaking the absence of conflict for the presence of trust. Some clients are not comfortable; they may simply be avoiding difficult conversations. There is a difference.',
      next30: [
        'Before saying yes to any client request, pause and say: “Let me confirm the timeline with my team and come back to you within the hour.” Practice this consistently.',
        'Keep a commitment log. Track every promise made to a client, including the delivery date. Review it every Friday before you leave.',
        'In your next difficult conversation, resist the urge to soften the news first. Practice being clear, warm, and honest — in that order.'
      ]
    },
    D: {
      name: 'The Strategic Partner', short: 'Strategic Partner', color: '#76BDA7', text: '#3D8A73', on: '#0F2A30',
      headline: 'You are what every client actually hired. The risk now is complacency.',
      body: [
        'You are not just a processor, a reporter, or a problem-solver. You operate as a partner.',
        'You think about client relationships the way a strategist thinks about a campaign. You do not just manage the relationship; you steward it. You understand the client’s business goals, not just their SLAs. You flag risks before they become visible problems. When something goes wrong, you own it, fix it, and design the prevention plan, not just the response.',
        'Your clients trust you not because you have never failed them, but because when challenges happen, you show ownership, judgment, and care. They do not follow up constantly because they trust that you are already thinking ahead.',
        'The Strategic Partner’s risk is complacency. You may have earned the trust that many managers are still working toward. The question is whether you are still actively investing in that trust or starting to coast on it.'
      ],
      clientsSay: 'They think like we do. I don’t feel like they work for us — I feel like they work with us. If we ever had to change vendors, they would be the reason we hesitated.',
      blindSpot: 'You may have mastered the relationship, but the risk is assuming alignment instead of actively building it. Even the strongest partnerships can drift without consistent attention.',
      next30: [
        'Schedule a relationship audit with your top three clients this quarter. This is not a performance review. It is a genuine “How are we really doing?” conversation.',
        'Identify one manager on your team who has the potential to operate at this level. Invest 30 minutes a week coaching them toward it.',
        'Ask yourself: “When did I last genuinely surprise a client with something they did not ask for?” If you cannot remember, that is your signal.'
      ]
    }
  }
};
