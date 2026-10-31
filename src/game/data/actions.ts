import type { ActionDef } from '@/types'

// Player actions chosen before advancing the month. Effects are applied in
// engine/simulation.ts (applyAction) so all balancing lives in one place.
export const ACTIONS: ActionDef[] = [
  // EDUCATION
  { id: 'study', label: 'Study', category: 'Education', icon: '📚', energyCost: 12, description: '+Intelligence, +Skills, small happiness dip.' },
  { id: 'college', label: 'Attend College', category: 'Education', icon: '🎓', energyCost: 10, description: '+Intelligence, +Social, +Reputation over time.' },
  { id: 'course', label: 'Take Online Course', category: 'Education', icon: '💡', energyCost: 14, description: 'Strong skill boost toward a focused skill.' },
  { id: 'exam', label: 'Prepare for Exam', category: 'Education', icon: '📝', energyCost: 18, description: 'Big intelligence + discipline, drains energy.' },

  // CAREER
  { id: 'apply', label: 'Apply for Jobs', category: 'Career', icon: '📮', energyCost: 8, description: 'Hunt for a job. Land one if your skills qualify.', available: (s) => !s.career.careerId },
  { id: 'workhard', label: 'Work Hard', category: 'Career', icon: '💼', energyCost: 16, description: '+Performance, +Reputation, -Energy. Requires a job.', available: (s) => !!s.career.careerId },
  { id: 'promotion', label: 'Ask for Promotion', category: 'Career', icon: '📈', energyCost: 8, description: 'Attempt to jump a level if you qualify.', available: (s) => !!s.career.careerId },
  { id: 'freelance', label: 'Freelance', category: 'Career', icon: '🧑‍💻', energyCost: 14, description: 'Extra cash this month based on your skills.' },
  { id: 'network', label: 'Network', category: 'Career', icon: '🌐', energyCost: 8, description: '+Reputation, +Social, chance of opportunity.' },

  // HEALTH
  { id: 'workout', label: 'Workout', category: 'Health', icon: '🏋️', energyCost: 10, description: '+Health, +Fitness, +Discipline.' },
  { id: 'sleep', label: 'Sleep Well', category: 'Health', icon: '😴', energyCost: 0, description: 'Restores energy, small health & happiness.' },
  { id: 'diet', label: 'Healthy Diet', category: 'Health', icon: '🥗', energyCost: 4, description: '+Health, +Energy regen.' },
  { id: 'meditate', label: 'Meditate', category: 'Health', icon: '🧘', energyCost: 4, description: '+Happiness, +Mindfulness, +Energy.' },

  // SOCIAL
  { id: 'friends', label: 'Meet Friends', category: 'Social', icon: '🍻', energyCost: 8, description: '+Happiness, +Social, strengthens bonds.' },
  { id: 'event', label: 'Attend Event', category: 'Social', icon: '🎉', energyCost: 10, description: '+Social, +Reputation, meet new people.' },
  { id: 'travel', label: 'Travel', category: 'Social', icon: '✈️', energyCost: 12, description: 'Big happiness boost, costs cash.' },
  { id: 'date', label: 'Go on a Date', category: 'Social', icon: '💘', energyCost: 8, description: 'Pursue romance, +Happiness.' },

  // SKILLS
  { id: 'learn_python', label: 'Learn Python', category: 'Skills', icon: '🐍', energyCost: 12, description: 'Level up Python.' },
  { id: 'learn_ai', label: 'Learn AI/ML', category: 'Skills', icon: '🤖', energyCost: 14, description: 'Level up AI/ML (needs Python + Algorithms).' },
  { id: 'learn_web', label: 'Learn Web Dev', category: 'Skills', icon: '🌐', energyCost: 12, description: 'Level up Web Development.' },
  { id: 'learn_comm', label: 'Learn Communication', category: 'Skills', icon: '💬', energyCost: 8, description: 'Level up Communication.' },
  { id: 'learn_lead', label: 'Learn Leadership', category: 'Skills', icon: '👑', energyCost: 10, description: 'Level up Leadership.' },

  // FINANCE
  { id: 'save', label: 'Save Aggressively', category: 'Finance', icon: '🏦', energyCost: 2, description: 'Boost savings buffer, +Discipline.' },
  { id: 'invest_index', label: 'Invest in Index Fund', category: 'Finance', icon: '📊', energyCost: 4, description: 'Move ₹20k cash into an index fund.', available: (s) => s.finance.cash >= 20000 },
  { id: 'invest_stocks', label: 'Buy Stocks', category: 'Finance', icon: '📈', energyCost: 5, description: 'Move ₹20k into stocks (higher risk).', available: (s) => s.finance.cash >= 20000 },
  { id: 'invest_crypto', label: 'Buy Crypto', category: 'Finance', icon: '🪙', energyCost: 5, description: 'Move ₹15k into crypto (high risk!).', available: (s) => s.finance.cash >= 15000 },
  { id: 'start_sip', label: 'Start SIP', category: 'Finance', icon: '🔁', energyCost: 3, description: 'Auto-invest ₹5k/month into an index fund.' },
]

export const ACTION_MAP: Record<string, ActionDef> = Object.fromEntries(
  ACTIONS.map((a) => [a.id, a]),
)
