export interface Competition {
  id?: string
  title: string
  slug: string
  imageUrl: string
  ticketsToSell: number
  ticketsSold: number
  entryFee: number
  endDate: Date  // ✅ This must be `Date`, not `string`
  description?: string
}
