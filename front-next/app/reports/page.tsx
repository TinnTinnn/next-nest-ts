import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CalendarIcon, Download, FileSpreadsheet, FileText, Printer } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Reports" description="Reports and analytics for inventory management" />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex bg-muted/80 backdrop-blur-sm">
              <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
              <TabsTrigger value="movement">Movement Reports</TabsTrigger>
              <TabsTrigger value="analysis">Analysis Reports</TabsTrigger>
            </TabsList>
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-[300px] justify-start text-left font-normal border-primary/20"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(), "MMMM dd, yyyy")} - {format(new Date(), "MMMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" numberOfMonths={2} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <TabsContent value="inventory" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Current Inventory Report</CardTitle>
                    <CardDescription>Shows all products and their current stock levels</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Current Inventory Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Low Stock Report</CardTitle>
                    <CardDescription>Shows items that are below minimum stock level</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Low Stock Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Inventory Value Report</CardTitle>
                    <CardDescription>Shows the value of all inventory items</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Inventory Value Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="movement" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Stock In Report</CardTitle>
                    <CardDescription>Shows history of all stock in transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Stock In Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Stock Out Report</CardTitle>
                    <CardDescription>Shows history of all stock out transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Stock Out Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Inventory Movement Report</CardTitle>
                    <CardDescription>Shows all inventory movement history</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Inventory Movement Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analysis" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Department Usage Report</CardTitle>
                    <CardDescription>Shows product usage by department</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Department Usage Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Most Used Items Report</CardTitle>
                    <CardDescription>Shows most frequently used inventory items</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Most Used Items Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-base">Usage Trend Report</CardTitle>
                    <CardDescription>Shows usage trends over time</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Usage Trend Report</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        <Button size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
      </ProtectedRoute>
  )
}
