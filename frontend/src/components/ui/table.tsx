// src/components/ui/table.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef((
  { className, ...props }: React.HTMLAttributes<HTMLTableElement>,
  ref: React.ForwardedRef<HTMLTableElement>
) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef((
  { className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>,
  ref: React.ForwardedRef<HTMLTableSectionElement>
) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef((
  { className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>,
  ref: React.ForwardedRef<HTMLTableSectionElement>
) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef((
  { className, ...props }: React.HTMLAttributes<HTMLTableRowElement>,
  ref: React.ForwardedRef<HTMLTableRowElement>
) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef((
  { className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>,
  ref: React.ForwardedRef<HTMLTableCellElement>
) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef((
  { className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>,
  ref: React.ForwardedRef<HTMLTableCellElement>
) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }