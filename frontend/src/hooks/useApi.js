import axios from 'axios'

const AUTH = 'http://localhost:8081'
const ROOM = 'http://localhost:8082'
const MEETING = 'http://localhost:8083'
const AI = 'http://localhost:8085'

function getHeaders() {
  const token = localStorage.getItem('ms_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  // Auth
  login: (data) => axios.post(`${AUTH}/api/auth/login`, data),
  register: (data) => axios.post(`${AUTH}/api/auth/register`, data),

  // Users (şirket rehberi)
  getUsers: () => axios.get(`${AUTH}/api/auth/users`, { headers: getHeaders() }),
  getMe: () => axios.get(`${AUTH}/api/auth/me`, { headers: getHeaders() }),

  // Rooms
  getRooms: () => axios.get(`${ROOM}/api/rooms`, { headers: getHeaders() }),
  createRoom: (data) => axios.post(`${ROOM}/api/rooms`, data, { headers: getHeaders() }),
  getAvailableRooms: (start, end) => axios.get(`${ROOM}/api/rooms/available`, {
    params: { start, end }, headers: getHeaders()
  }),
  createReservation: (data) => axios.post(`${ROOM}/api/rooms/reservations`, data, { headers: getHeaders() }),
  getMyReservations: () => axios.get(`${ROOM}/api/rooms/reservations/my`, { headers: getHeaders() }),
  cancelReservation: (id) => axios.delete(`${ROOM}/api/rooms/reservations/${id}`, { headers: getHeaders() }),

  // Room Calendar
  getRoomCalendar: (roomId, year, month) =>
    axios.get(`${ROOM}/api/rooms/${roomId}/calendar/${year}/${month}`, { headers: getHeaders() }),
  getRoomDay: (roomId, date) =>
    axios.get(`${ROOM}/api/rooms/${roomId}/day/${date}`, { headers: getHeaders() }),

  // Room Members
  getRoomMembers: (roomId) =>
    axios.get(`${ROOM}/api/rooms/${roomId}/members`, { headers: getHeaders() }),
  addRoomMember: (roomId, data) =>
    axios.post(`${ROOM}/api/rooms/${roomId}/members`, data, { headers: getHeaders() }),
  removeRoomMember: (roomId, userEmail) =>
    axios.delete(`${ROOM}/api/rooms/${roomId}/members/${userEmail}`, { headers: getHeaders() }),
  getMyRooms: () =>
    axios.get(`${ROOM}/api/rooms/my`, { headers: getHeaders() }),

  // Meetings
  createMeeting: (data) => axios.post(`${MEETING}/api/meetings`, data, { headers: getHeaders() }),
  getMyMeetings: () => axios.get(`${MEETING}/api/meetings/my`, { headers: getHeaders() }),
  getMeeting: (id) => axios.get(`${MEETING}/api/meetings/${id}`, { headers: getHeaders() }),
  respondToMeeting: (id, response) => axios.post(`${MEETING}/api/meetings/${id}/respond`,
    { response }, { headers: getHeaders() }),
  createPoll: (meetingId, data) => axios.post(`${MEETING}/api/meetings/${meetingId}/polls`,
    data, { headers: getHeaders() }),
  vote: (optionId) => axios.post(`${MEETING}/api/meetings/polls/${optionId}/vote`, {},
    { headers: getHeaders() }),

  // AI
  summarize: (data) => axios.post(`${AI}/api/ai/summarize`, data, { headers: getHeaders() }),
  getMySummaries: () => axios.get(`${AI}/api/ai/summaries/my`, { headers: getHeaders() }),
}
