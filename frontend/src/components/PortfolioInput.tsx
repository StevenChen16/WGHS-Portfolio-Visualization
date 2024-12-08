// src/components/PortfolioInput.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { X } from 'lucide-react'

interface Holding {
  ticker: string
  value: number
  weight?: number
}

interface PortfolioInputProps {
  onSubmit: (holdings: Holding[]) => void
}

export function PortfolioInput({ onSubmit }: PortfolioInputProps) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [ticker, setTicker] = useState('')
  const [value, setValue] = useState('')

  const addHolding = () => {
    if (!ticker || !value) return

    const newHolding = {
      ticker: ticker.toUpperCase(),
      value: parseFloat(value)
    }

    setHoldings([...holdings, newHolding])
    setTicker('')
    setValue('')
  }

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index))
  }

  const calculateWeights = () => {
    const total = holdings.reduce((sum, h) => sum + h.value, 0)
    return holdings.map(h => ({
      ...h,
      weight: (h.value / total) * 100
    }))
  }

  const handleSubmit = () => {
    if (holdings.length === 0) return
    onSubmit(calculateWeights())
  }

  return (
    <Card className="w-full bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Portfolio Analytics</CardTitle>
        <CardDescription>
          Add your portfolio holdings to analyze performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Ticker (e.g. AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full"
            />
            <Button 
              onClick={addHolding}
              className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Holding
            </Button>
          </div>

          {holdings.length > 0 && (
            <div className="mt-6">
              <Table className="w-full border rounded-lg">
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="font-semibold">Ticker</TableHead>
                    <TableHead className="font-semibold text-right">Value</TableHead>
                    <TableHead className="font-semibold text-right">Weight (%)</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculateWeights().map((holding, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{holding.ticker}</TableCell>
                      <TableCell className="text-right">${holding.value.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{holding.weight?.toFixed(2)}%</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHolding(index)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSubmit}
              disabled={holdings.length === 0}
              className="px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Analyze Portfolio
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}