import type { Task } from './types'

export type TaskGroup = {
  label: string
  tasks: Task[]
}

function startOfToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function groupTasksByDueDate(tasks: Task[]): TaskGroup[] {
  const today = startOfToday()
  const tomorrow = addDays(today, 1)
  const weekEnd = addDays(today, 7)

  const overdue: Task[] = []
  const todayTasks: Task[] = []
  const tomorrowTasks: Task[] = []
  const thisWeek: Task[] = []
  const upcoming: Task[] = []
  const someday: Task[] = []

  for (const task of tasks) {
    if (!task.dueDate) {
      someday.push(task)
    } else if (task.dueDate < today) {
      overdue.push(task)
    } else if (task.dueDate === today) {
      todayTasks.push(task)
    } else if (task.dueDate === tomorrow) {
      tomorrowTasks.push(task)
    } else if (task.dueDate < weekEnd) {
      thisWeek.push(task)
    } else {
      upcoming.push(task)
    }
  }

  const groups: TaskGroup[] = []
  if (overdue.length) groups.push({ label: 'Overdue', tasks: overdue })
  if (todayTasks.length) groups.push({ label: 'Today', tasks: todayTasks })
  if (tomorrowTasks.length) groups.push({ label: 'Tomorrow', tasks: tomorrowTasks })
  if (thisWeek.length) groups.push({ label: 'This week', tasks: thisWeek })
  if (upcoming.length) groups.push({ label: 'Upcoming', tasks: upcoming })
  if (someday.length) groups.push({ label: 'Someday', tasks: someday })

  return groups
}
