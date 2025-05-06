import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PackagePlus, ShoppingCart } from "lucide-react"

export function RecentActivitiesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Quantity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="bg-green-500/20 p-1.5 rounded-full">
                <PackagePlus className="h-4 w-4 text-green-600" />
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                Stock In
              </Badge>
            </div>
          </TableCell>
          <TableCell className="font-medium">A4 Paper Double A</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="@user1" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm">John Doe</span>
            </div>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">May 15, 2024, 10:30</TableCell>
          <TableCell className="text-right">50 reams</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="bg-red-500/20 p-1.5 rounded-full">
                <ShoppingCart className="h-4 w-4 text-red-600" />
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                Stock Out
              </Badge>
            </div>
          </TableCell>
          <TableCell className="font-medium">HP 678 Black Ink Cartridge</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="@user2" />
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
              <span className="text-sm">Patricia Smith</span>
            </div>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">May 15, 2024, 09:45</TableCell>
          <TableCell className="text-right">5 cartridges</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="bg-green-500/20 p-1.5 rounded-full">
                <PackagePlus className="h-4 w-4 text-green-600" />
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                Stock In
              </Badge>
            </div>
          </TableCell>
          <TableCell className="font-medium">A4 Blue File Folders</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="@user3" />
                <AvatarFallback>TS</AvatarFallback>
              </Avatar>
              <span className="text-sm">Thomas Scott</span>
            </div>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">May 14, 2024, 15:20</TableCell>
          <TableCell className="text-right">20 folders</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="bg-red-500/20 p-1.5 rounded-full">
                <ShoppingCart className="h-4 w-4 text-red-600" />
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                Stock Out
              </Badge>
            </div>
          </TableCell>
          <TableCell className="font-medium">Stapler No.10</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="@user4" />
                <AvatarFallback>WP</AvatarFallback>
              </Avatar>
              <span className="text-sm">Wendy Parker</span>
            </div>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">May 14, 2024, 13:10</TableCell>
          <TableCell className="text-right">3 units</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="bg-red-500/20 p-1.5 rounded-full">
                <ShoppingCart className="h-4 w-4 text-red-600" />
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                Stock Out
              </Badge>
            </div>
          </TableCell>
          <TableCell className="font-medium">Yellow Post-it Notes</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="@user5" />
                <AvatarFallback>SR</AvatarFallback>
              </Avatar>
              <span className="text-sm">Sarah Robinson</span>
            </div>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">May 14, 2024, 11:30</TableCell>
          <TableCell className="text-right">10 packs</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
