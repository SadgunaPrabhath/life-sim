import type { SkillDef } from '@/types'

// The RPG skill tree. Skills level 1..100. Some require prerequisites.
export const SKILLS: SkillDef[] = [
  // TECHNOLOGY
  { id: 'python', name: 'Python', category: 'TECHNOLOGY', icon: '🐍', description: 'Foundational programming language.' },
  { id: 'webdev', name: 'Web Development', category: 'TECHNOLOGY', icon: '🌐', description: 'Build web apps & interfaces.', prerequisites: [{ skillId: 'python', level: 20 }] },
  { id: 'algorithms', name: 'Algorithms', category: 'INTELLIGENCE', icon: '🧮', description: 'Data structures & problem solving.', prerequisites: [{ skillId: 'python', level: 30 }] },
  { id: 'aiml', name: 'AI / ML', category: 'TECHNOLOGY', icon: '🤖', description: 'Machine learning & neural nets.', prerequisites: [{ skillId: 'python', level: 40 }, { skillId: 'algorithms', level: 30 }] },
  { id: 'security', name: 'Cybersecurity', category: 'TECHNOLOGY', icon: '🛡️', description: 'Defensive security & systems.', prerequisites: [{ skillId: 'algorithms', level: 25 }] },
  { id: 'data', name: 'Data Science', category: 'INTELLIGENCE', icon: '📊', description: 'Statistics & data analysis.', prerequisites: [{ skillId: 'python', level: 30 }] },

  // COMMUNICATION
  { id: 'communication', name: 'Communication', category: 'COMMUNICATION', icon: '💬', description: 'Everyday expression & clarity.' },
  { id: 'speaking', name: 'Public Speaking', category: 'COMMUNICATION', icon: '🎤', description: 'Command a room.', prerequisites: [{ skillId: 'communication', level: 30 }] },
  { id: 'negotiation', name: 'Negotiation', category: 'COMMUNICATION', icon: '🤝', description: 'Get better deals.', prerequisites: [{ skillId: 'communication', level: 40 }] },

  // CREATIVITY
  { id: 'design', name: 'Design', category: 'CREATIVITY', icon: '🎨', description: 'Visual & product design.' },
  { id: 'writing', name: 'Writing', category: 'CREATIVITY', icon: '✍️', description: 'Craft compelling stories.' },
  { id: 'content', name: 'Content Creation', category: 'CREATIVITY', icon: '🎬', description: 'Build an audience.', prerequisites: [{ skillId: 'writing', level: 25 }] },

  // FINANCE
  { id: 'investing', name: 'Investing', category: 'FINANCE', icon: '📈', description: 'Grow your wealth wisely.' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', category: 'FINANCE', icon: '🚀', description: 'Build businesses.', prerequisites: [{ skillId: 'investing', level: 20 }] },

  // LEADERSHIP
  { id: 'leadership', name: 'Leadership', category: 'LEADERSHIP', icon: '👑', description: 'Lead teams & inspire.', prerequisites: [{ skillId: 'communication', level: 35 }] },
  { id: 'management', name: 'Management', category: 'LEADERSHIP', icon: '📋', description: 'Run projects & people.', prerequisites: [{ skillId: 'leadership', level: 30 }] },

  // LIFE
  { id: 'fitness', name: 'Fitness', category: 'LIFE', icon: '🏋️', description: 'Physical conditioning.' },
  { id: 'mindfulness', name: 'Mindfulness', category: 'LIFE', icon: '🧘', description: 'Mental resilience & calm.' },
  { id: 'cooking', name: 'Cooking', category: 'LIFE', icon: '🍳', description: 'Feed yourself well.' },
]

export const SKILL_MAP: Record<string, SkillDef> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
)

export const SKILL_CATEGORIES = [
  'TECHNOLOGY',
  'INTELLIGENCE',
  'COMMUNICATION',
  'CREATIVITY',
  'FINANCE',
  'LEADERSHIP',
  'LIFE',
] as const

export function prereqsMet(skillId: string, levels: Record<string, number>): boolean {
  const def = SKILL_MAP[skillId]
  if (!def?.prerequisites) return true
  return def.prerequisites.every((p) => (levels[p.skillId] ?? 0) >= p.level)
}
