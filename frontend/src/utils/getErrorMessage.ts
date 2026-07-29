export function getErrorMessage(err: any, fallback = 'Something went wrong'): string {
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string') return message;
  return fallback;
}
