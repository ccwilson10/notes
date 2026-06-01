import type { AccentColor } from './types'

export const accentClasses: Record<AccentColor, { bg: string; text: string }> = {
  red: { bg: 'bg-accent-red', text: 'text-accent-red' },
  amber: { bg: 'bg-accent-amber', text: 'text-accent-amber' },
  green: { bg: 'bg-accent-green', text: 'text-accent-green' },
  blue: { bg: 'bg-accent-blue', text: 'text-accent-blue' },
  purple: { bg: 'bg-accent-purple', text: 'text-accent-purple' },
}

export const allColors: AccentColor[] = ['red', 'amber', 'green', 'blue', 'purple']
