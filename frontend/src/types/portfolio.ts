// src/types/portfolio.ts
export interface Portfolio {
    holdings: {
      ticker: string
      value: number
      weight?: number
    }[]
  }