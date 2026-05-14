export type OpenAnswerItem = {
  id: string
  theme: string
  text: string
}

export function buildOpenAnswersViewModel(items: OpenAnswerItem[]) {
  const grouped = new Map<string, OpenAnswerItem[]>()

  for (const item of items) {
    const key = item.theme.trim() || 'Overig'
    const bucket = grouped.get(key) ?? []
    bucket.push(item)
    grouped.set(key, bucket)
  }

  const groups = Array.from(grouped.entries()).map(([title, answers]) => ({
    title,
    answers,
  }))

  return {
    isEmpty: groups.length === 0,
    themes: groups.map((group) => ({ title: group.title, count: group.answers.length })),
    groups,
  }
}
