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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Input
          placeholder="Ticker (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={addHolding}>Add Holding</Button>
      </div>

      {holdings.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Weight (%)</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calculateWeights().map((holding, index) => (
              <TableRow key={index}>
                <TableCell>{holding.ticker}</TableCell>
                <TableCell>${holding.value.toLocaleString()}</TableCell>
                <TableCell>{holding.weight?.toFixed(2)}%</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHolding(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={holdings.length === 0}
        >
          Analyze Portfolio
        </Button>
      </div>
    </div>
  )
}