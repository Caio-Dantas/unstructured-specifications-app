export async function retryRequest(
  fn: () => Promise<any>,
  retries = 3,
  delay = 1000
) {
  for (let i = 0; i < retries; i++) {
    try {
      await fn()
      return { success: true }
    } catch (error) {
      if (i === retries - 1) {
        const errorMessage = error.response?.data ?? error.message ?? error
        return { success: false, error: errorMessage }
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  return { success: false, error: '408' }
}
