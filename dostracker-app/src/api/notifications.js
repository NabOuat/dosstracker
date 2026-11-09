import axios from './axios'

export async function getNotifications() {
  const response = await axios.get('/api/v1/notifications')
  return response.data
}
