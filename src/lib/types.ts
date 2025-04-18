export interface Competition {
  id: string
  title: string
  slug: string
  imageUrl: string
  endDate: string | Date
  ticketsToSell: number
  ticketsSold: number
  entryFee: number
  description: string // ✅ this is important
}
