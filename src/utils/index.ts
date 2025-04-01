export const maskPhoneNumber = (phone: string) => {
  if (phone.length <= 3) return phone
  return phone.slice(0, 1) + '***' + phone.slice(-3)
}
