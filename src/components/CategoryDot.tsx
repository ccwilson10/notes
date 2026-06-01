import { accentClasses } from '../lib/colors'
import type { AccentColor } from '../lib/types'

type Props = {
  color: AccentColor
  size?: number
}

export function CategoryDot({ color, size = 8 }: Props) {
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${accentClasses[color].bg}`}
      style={{ width: size, height: size }}
    />
  )
}
