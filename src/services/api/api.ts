import { instance } from '@/services/api/instance'

export const authServices = {
  login: async ({ queryString }: { queryString: string }) =>
    await instance.post(`/users/authenticateTerminal`, {
      queryString
    }),
  getUserInfo: async () => await instance.get('/users/getInfo'),
  refreshToken: async ({ refreshToken }: { refreshToken: string }) => await instance.post('/users/refreshToken', { refreshToken })
}
