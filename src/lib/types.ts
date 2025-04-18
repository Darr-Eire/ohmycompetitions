export interface Competition {
    id: string
    title: string
    imageUrl: string
    slug: string
    endDate: string // or Date, depending on your usage
    ticketsToSell: number
    entryFee: number // 👈 add this
  }
  