export const formatTime = (date: string | null) => {
  if (!date) return ""

  const target = new Date(date)
  const now = new Date()

  const isToday =
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()

  if (isToday) {
    return target.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const diffDays = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  // 어제
  if (diffDays === 1) {
    return "어제"
  }

  // 올해
  if (target.getFullYear() === now.getFullYear()) {
    return target.toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    })
  }

  // 다른 해
  return target.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
}