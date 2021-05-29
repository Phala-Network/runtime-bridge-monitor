export type ApiResponse<T> = {
  data: T
  status: 200
} | {
  error: string
  status: 500
}
