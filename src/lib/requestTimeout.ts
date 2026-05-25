const DEFAULT_TIMEOUT_MS = 8000

export function withTimeout<T>(
  request: PromiseLike<T>,
  label: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>

  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} 요청 시간이 초과되었습니다.`))
    }, timeoutMs)
  })

  return Promise.race([Promise.resolve(request), timeout]).finally(() => clearTimeout(timer))
}
