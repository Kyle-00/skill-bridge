// frontend/src/components/pages/resourcesData.js
//
// Static article content for the Resources section.
// To add a new article, append a new object to `RESOURCES_DATA` below.
//
// Supported content block types:
//   { type: 'heading',   text }
//   { type: 'paragraph', text }
//   { type: 'list',      items: [] }
//   { type: 'numbered',  items: [] }
//   { type: 'quote',     text }
//   { type: 'callout',   variant: 'tip' | 'warning' | 'info', title, text }
//
// Optional top-level fields on an article:
//   icon: 'book' | 'file'   (video icon is no longer used)
//   category: string
//   readTime: string

export const RESOURCES_DATA = [
  // ---------------------------------------------------------------------------
  // 1. How to Write the Perfect Proposal
  // ---------------------------------------------------------------------------
  {
    slug: 'perfect-proposal',
    title: 'How to Write the Perfect Proposal',
    description: 'A step-by-step guide to winning your first gigs on SkillBridge.',
    category: 'For Freelancers',
    readTime: '6 min read',
    icon: 'book',
    content: [
      {
        type: 'paragraph',
        text: 'A great proposal is the difference between getting hired and getting ignored. On SkillBridge, clients review dozens of bids for every project. Your proposal needs to stand out in the first 10 seconds — and it needs to make the client feel confident that you are the right person for the job.',
      },
      {
        type: 'heading',
        text: 'The 6-Part Proposal Structure',
      },
      {
        type: 'paragraph',
        text: 'Every winning proposal follows the same structure. Master it once and you can adapt it to any project in minutes.',
      },
      {
        type: 'numbered',
        items: [
          'The Hook — A personalized opening line that proves you read the brief.',
          "The Understanding — Restate the client's problem in your own words.",
          'The Plan — A concrete 3-step approach for how you will deliver.',
          'The Credentials — A short, relevant proof point (not your life story).',
          'The Price — A clear, justified number with a breakdown if helpful.',
          'The Call to Action — A specific next step, like scheduling a call.',
        ],
      },
      {
        type: 'heading',
        text: 'The Hook',
      },
      {
        type: 'paragraph',
        text: 'Never start with "Hi, I am a freelancer with 5 years of experience." Every freelancer says that. Instead, open with something that proves you actually read the project brief. For example, if the client mentioned they need an e-commerce site for a boutique clothing brand, open with: "I noticed your brand focuses on minimalist aesthetics — I recently built a store with that exact vibe for a client in the fashion space."',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Pro Tip',
        text: 'Mention a specific detail from the brief in your first sentence. Clients can instantly tell whether you actually read it or copy-pasted a template.',
      },
      {
        type: 'heading',
        text: 'The Understanding',
      },
      {
        type: 'paragraph',
        text: "Restate the client's problem in your own words. This does two things: it proves you understood the brief, and it shows you can think critically about their business. For example: \"It sounds like your current site is losing visitors on mobile, and you need a faster, more conversion-focused experience.\"",
      },
      {
        type: 'heading',
        text: 'The Plan',
      },
      {
        type: 'paragraph',
        text: 'Give a concrete plan. Three numbered steps work best. For a web development project: "(1) Discovery call to confirm requirements. (2) Design mockups for your approval. (3) Development and launch." Clients love specifics because they reduce uncertainty.',
      },
      {
        type: 'heading',
        text: 'The Credentials',
      },
      {
        type: 'paragraph',
        text: 'Keep this SHORT. One or two sentences max. Attach one relevant portfolio link — not five. If your portfolio is thin, mention a relevant skill instead: "I have shipped 12 production React apps in the last 2 years."',
      },
      {
        type: 'heading',
        text: 'The Price',
      },
      {
        type: 'paragraph',
        text: "Give a clear number. If your price is above the client's budget, explain why. If you are below it, do not undersell — a client who values quality is wary of bargain bids. Example: \"My price for this scope is $850, which includes 2 rounds of revisions and 30 days of post-launch support.\"",
      },
      {
        type: 'heading',
        text: 'The Call to Action',
      },
      {
        type: 'paragraph',
        text: 'End with a specific next step. Not "let me know if you have questions" but "I am available for a 15-minute call this Thursday or Friday. Would either work for you?"',
      },
      {
        type: 'heading',
        text: 'Common Mistakes to Avoid',
      },
      {
        type: 'list',
        items: [
          'Copy-pasting the same proposal to every project.',
          "Writing paragraphs about yourself before addressing the client's problem.",
          'Attaching 5+ portfolio links that are not relevant.',
          'Guessing at the price instead of justifying it.',
          'Forgetting to end with a clear next step.',
          'Using "I" more than "you".',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Watch Out',
        text: "Never share contact info (email, phone, social media) in your proposal. SkillBridge's chat and escrow system is what protects you. Going off-platform means you lose protection.",
      },
      {
        type: 'heading',
        text: 'Final Thoughts',
      },
      {
        type: 'paragraph',
        text: 'Writing a great proposal is a skill. Like any skill, it improves with practice. Read your proposal out loud before sending — if it sounds like a robot wrote it, rewrite it. Clients are hiring a person, not a template.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. Getting Started Guide  (formerly "Video Tutorial: Getting Started")
  // ---------------------------------------------------------------------------
  {
    slug: 'getting-started',
    title: 'Getting Started Guide',
    description: 'A complete walkthrough of the SkillBridge platform, from signup to your first payout.',
    category: 'Getting Started',
    readTime: '10 min read',
    icon: 'book',
    content: [
      {
        type: 'paragraph',
        text: 'Welcome to SkillBridge. This guide walks you through everything you need to know to get started — whether you are a freelancer looking for work, a client ready to hire, or both.',
      },
      {
        type: 'heading',
        text: 'What You Will Learn',
      },
      {
        type: 'numbered',
        items: [
          'How to create your account and choose your role (client, freelancer, or both).',
          'How to set up your profile so it stands out to the right people.',
          'For freelancers: how to create a gig that sells.',
          'For clients: how to post a project that attracts quality proposals.',
          'How the escrow system protects both sides.',
          'How to use SkillBridge chat to communicate.',
          'How to withdraw your earnings via M-Pesa or bank transfer.',
        ],
      },
      {
        type: 'heading',
        text: 'Step 1 — Create Your Account',
      },
      {
        type: 'paragraph',
        text: 'Sign up with your email or Google account. After you sign up, you will be asked to choose whether you are a client, a freelancer, or both. You can always change this later in Settings. Getting this right from the start makes your dashboard cleaner.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Pro Tip',
        text: 'If you plan to both hire and work, choose "Both". You will get a toggle on your dashboard that switches between the client view and the freelancer view.',
      },
      {
        type: 'heading',
        text: 'Step 2 — Complete Your Profile',
      },
      {
        type: 'paragraph',
        text: 'A complete profile is the single biggest factor in getting hired or getting quality proposals. Add your real name, a clear profile picture, a professional title, and a description of what you do. Freelancers should also list their skills, portfolio links, and hourly rate.',
      },
      {
        type: 'heading',
        text: 'Step 3 — For Freelancers: Create Your First Gig',
      },
      {
        type: 'paragraph',
        text: 'A gig is a fixed service you offer at a fixed price. For example: "I will build a responsive React website for $250." Use a specific, benefit-driven title and a description that speaks to the outcome the client wants, not just the technical work involved.',
      },
      {
        type: 'heading',
        text: 'Step 4 — For Clients: Post a Project',
      },
      {
        type: 'paragraph',
        text: 'A project is a task you need done. Be specific about the outcome, deliverables, and timeline. Projects with clear briefs get 3x more quality proposals than vague ones.',
      },
      {
        type: 'heading',
        text: 'Step 5 — The Escrow System',
      },
      {
        type: 'paragraph',
        text: 'When a client hires a freelancer, they fund the project into escrow. The money is held safely until the work is delivered and approved. This protects both sides — the freelancer knows the money is there, and the client knows they will not lose it if the work is not delivered.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Good to Know',
        text: 'SkillBridge charges 0% to clients. Freelancers pay either 5% (Free plan) or 3% (Pro plan) as a platform fee, deducted automatically from each payout.',
      },
      {
        type: 'heading',
        text: 'Still Have Questions?',
      },
      {
        type: 'paragraph',
        text: 'If anything is unclear, check out the other articles in this section, or reach out to our support team. Welcome aboard!',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. Freelancer Tax Guide
  // ---------------------------------------------------------------------------
  {
    slug: 'freelancer-tax-guide',
    title: 'Freelancer Tax Guide',
    description: 'Understand your tax obligations and avoid nasty surprises.',
    category: 'For Freelancers',
    readTime: '7 min read',
    icon: 'file',
    content: [
      {
        type: 'paragraph',
        text: 'Freelancing comes with a lot of freedom — but also a lot of responsibility. One of the biggest responsibilities is managing your own taxes. Unlike a salaried employee, nobody is withholding tax from your paycheck. That job is entirely up to you.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Disclaimer',
        text: 'This guide is educational only. Tax rules vary widely by country and change frequently. Always consult a licensed accountant in your jurisdiction before making decisions.',
      },
      {
        type: 'heading',
        text: 'Why Freelancers Get in Trouble',
      },
      {
        type: 'paragraph',
        text: 'The most common mistake freelancers make is spending all their income and then being surprised by a tax bill at the end of the year. If you are used to employment where taxes are auto-deducted, this can be a shock.',
      },
      {
        type: 'heading',
        text: 'The 30% Rule',
      },
      {
        type: 'paragraph',
        text: 'A simple and safe rule: whenever you get paid, immediately move 25-30% of the amount into a separate savings account. This is your "tax bucket". You do not spend from it until tax time. If you earn $2,000 in a month, move $600 to the tax bucket.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Set It and Forget It',
        text: 'Open a separate bank account just for taxes. When a payment comes in, transfer 30% immediately. It feels painful at first, but it turns tax season from a crisis into a non-event.',
      },
      {
        type: 'heading',
        text: 'Track Every Expense',
      },
      {
        type: 'paragraph',
        text: 'As a freelancer, many of your personal expenses are actually business expenses. Keeping receipts and records means you pay tax on your profit, not your revenue. This can save you thousands per year.',
      },
      {
        type: 'heading',
        text: 'Common Deductible Expenses',
      },
      {
        type: 'list',
        items: [
          'Internet and phone bills (the work portion)',
          'Laptop, monitor, and other equipment',
          'Software subscriptions (design tools, IDEs, cloud services)',
          'Home office costs (a portion of rent, utilities)',
          'Professional development (courses, books, conferences)',
          'Bank and transaction fees',
          "Platform fees (like SkillBridge's 5% or 3%)",
          'Marketing and advertising costs',
          'Travel for client meetings',
        ],
      },
      {
        type: 'heading',
        text: 'When to Register as a Business',
      },
      {
        type: 'paragraph',
        text: 'In many countries, you can freelance as an individual up to a certain income threshold before you are required to formally register as a business. Check your local rules — in some places it is required from the first dollar earned, while in others you have more flexibility.',
      },
      {
        type: 'heading',
        text: 'Record-Keeping Tips',
      },
      {
        type: 'list',
        items: [
          'Photograph every receipt and store it in the cloud.',
          'Keep a spreadsheet of all income and expenses.',
          'Separate your business bank account from your personal one.',
          'Back up your records — 3 copies: local, cloud, and external drive.',
          'Keep records for at least 5-7 years (varies by jurisdiction).',
        ],
      },
      {
        type: 'heading',
        text: 'When to Hire an Accountant',
      },
      {
        type: 'paragraph',
        text: 'If you are earning more than a few thousand dollars a year as a freelancer, the cost of a good accountant usually pays for itself many times over. They know deductions you would never think of, and they prevent mistakes that cost far more than their fee.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Rule of Thumb',
        text: 'If your annual freelance income exceeds 3 months of your local minimum wage, it is usually worth consulting an accountant at least once.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. Client Handbook: Hiring Right
  // ---------------------------------------------------------------------------
  {
    slug: 'client-hiring-handbook',
    title: 'Client Handbook: Hiring Right',
    description: 'How to evaluate, hire, and manage freelancers effectively.',
    category: 'For Clients',
    readTime: '8 min read',
    icon: 'book',
    content: [
      {
        type: 'paragraph',
        text: 'Hiring a freelancer is not the same as hiring an employee. The relationship is more transactional, more time-bound, and more dependent on clear communication. This handbook gives you a practical framework for hiring well and avoiding the most common pitfalls.',
      },
      {
        type: 'heading',
        text: 'Step 1 — Define the Project Before You Post',
      },
      {
        type: 'paragraph',
        text: 'Before you write a single line of the project brief, spend 20 minutes writing down three things: (1) What is the outcome you want? (2) What are the specific deliverables? (3) What is your realistic deadline and budget? Clarity here saves hours of confusion later.',
      },
      {
        type: 'heading',
        text: 'Step 2 — Write a Brief That Attracts Quality',
      },
      {
        type: 'paragraph',
        text: 'Great briefs get great proposals. Poor briefs get low-effort copy-paste bids. Your brief should include:',
      },
      {
        type: 'list',
        items: [
          'A clear, specific title (not "Need a developer").',
          'A paragraph describing the project and why you need it.',
          'A bulleted list of deliverables.',
          'A timeline with a specific deadline.',
          'A budget range (even a rough one helps).',
          'Any technical requirements or design references.',
          'What success looks like to you.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Pro Tip',
        text: 'Add one line at the end of the brief: "Please mention your favorite [something relevant] in the first line of your proposal." This filters out bots and freelancers who do not read the brief.',
      },
      {
        type: 'heading',
        text: 'Step 3 — How to Evaluate Proposals',
      },
      {
        type: 'paragraph',
        text: 'When proposals start coming in, do not just look at the price. Look at these four signals:',
      },
      {
        type: 'numbered',
        items: [
          'Did they address YOUR specific brief, or is this a template?',
          'Is the plan concrete, or vague ("I will deliver high quality work")?',
          'Are the credentials relevant to YOUR project?',
          'Does the price make sense for the scope?',
        ],
      },
      {
        type: 'heading',
        text: 'Red Flags to Watch For',
      },
      {
        type: 'list',
        items: [
          'Proposals that do not mention your project by name.',
          'Freelancers who try to move the conversation off-platform immediately.',
          "Prices that are dramatically below everyone else's (usually means corner-cutting).",
          'No portfolio or only a suspicious portfolio.',
          'Refusal to agree to milestones or deliverables.',
          'Pressure to pay outside escrow.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Never Pay Outside Escrow',
        text: 'SkillBridge escrow protects you. If a freelancer asks you to pay them directly via bank transfer, PayPal, or any other method, do not do it. Report them instead.',
      },
      {
        type: 'heading',
        text: 'Step 4 — Start With a Small Milestone',
      },
      {
        type: 'paragraph',
        text: 'For larger projects, do not commit the full budget upfront. Break the project into 2-4 milestones. Pay for the first milestone only after it is delivered and approved. This keeps risk low on both sides.',
      },
      {
        type: 'heading',
        text: 'Step 5 — Communicate Like a Pro',
      },
      {
        type: 'paragraph',
        text: 'Most freelance projects fail because of communication, not skill. Check in regularly, but do not micromanage. Use SkillBridge chat for quick updates. If something is wrong, address it early — do not wait until the deadline.',
      },
      {
        type: 'heading',
        text: 'Step 6 — Approve and Review',
      },
      {
        type: 'paragraph',
        text: 'When the work is delivered and meets the brief, approve it. This releases the escrow funds to the freelancer. Then leave an honest review. Reviews help future clients and reward good freelancers with more work.',
      },
      {
        type: 'heading',
        text: 'Final Thought',
      },
      {
        type: 'paragraph',
        text: 'The best client-freelancer relationships are partnerships, not transactions. Be clear, be fair, and communicate openly — and you will build a roster of reliable freelancers you can call on for years.',
      },
    ],
  },
];

export function getResourceBySlug(slug) {
  return RESOURCES_DATA.find((r) => r.slug === slug);
}