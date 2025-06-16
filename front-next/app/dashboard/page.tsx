import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Download } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StockChart } from "@/components/dashboard/stock-chart"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { RecentActivitiesTable } from "@/components/dashboard/recent-activities-table"

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory management system"
        actions={
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards />

        {/* Low Stock Alert */}
        <LowStockAlert />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4 border-primary/10 shadow-md">
                <CardHeader>
                  <CardTitle>Inventory Movement</CardTitle>
                  <CardDescription>Stock in and out over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <StockChart />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3 border-primary/10 shadow-md">
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>Distribution of products by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryDistribution />
                </CardContent>
              </Card>
            </div>
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest inventory movements</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/reports">View All</a>
                </Button>
              </CardHeader>
              <CardContent>
                <RecentActivitiesTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card className="border-primary/10 shadow-md">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Insights and analysis of your inventory</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Under Development</h3>
                  <p className="text-sm text-muted-foreground">
                    This feature is currently being developed and will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card className="border-primary/10 shadow-md">
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>System reports and summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="border-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Inventory Report</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Shows all products and their current stock levels
                      </p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href="/reports">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Movement Report</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Shows history of all stock in and out transactions
                      </p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href="/reports">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Low Stock Report</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Shows items that are below minimum stock level
                      </p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href="/inventory?status=low-stock">
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
