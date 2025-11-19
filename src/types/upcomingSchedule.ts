// src/types/upcomingSchedule.ts


export interface UpcomingApiEvent {
  id: number
  date: string
  name: string
  shortName?: string
  status: string
  seasonYear: number
  seasonType: number
  week: number
}

export interface UpcomingApiResponse {
  year: number
  seasonType: number
  week: number
  events: UpcomingApiEvent[]
}

// Frontend friendly format
export interface UpcomingGame {
  id: number
  dateFormatted: string
  homeTeamName: string
  awayTeamName: string
  homeLogo: string
  awayLogo: string
  status: string
}
