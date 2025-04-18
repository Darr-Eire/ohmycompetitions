export interface Competition {
    id: string
    title: string
    slug: string
    imageUrl: string
    ticketsToSell: number
    entryFee: number
    endDate: string | Date  // ← Fix red underline by allowing both string and Date
    createdAt: string | Date
    updatedAt: string | Date
  }
  