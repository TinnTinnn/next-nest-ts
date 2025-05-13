import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3,
  Download,
  FileSpreadsheet,
  Package,
  PackagePlus,
  ShoppingCart,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { RecentActivitiesTable } from "@/components/recent-activities-table"
import { StockChart } from "@/components/stock-chart"
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248 items</div>
              <p className="text-xs text-muted-foreground">+12 items from last month</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock In</CardTitle>
              <PackagePlus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145 items</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                <span>+23% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98 items</div>
              <div className="flex items-center text-xs text-red-600">
                <ArrowDownIcon className="h-3 w-3 mr-1" />
                <span>-5% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,245,890</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                <span>+18% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert variant="destructive" className="border-red-600/20 bg-red-600/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            5 items are below minimum stock level{" "}
            <Button variant="link" className="p-0 h-auto">
              View Items
            </Button>
          </AlertDescription>
        </Alert>

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
                  <CardDescription>Stock in and out over the last 30 days</CardDescription>
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                        <span className="text-sm">Stationery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">42%</span>
                        <Badge variant="outline">524 items</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">IT Equipment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">28%</span>
                        <Badge variant="outline">349 items</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Office Supplies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">18%</span>
                        <Badge variant="outline">225 items</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Electronics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">12%</span>
                        <Badge variant="outline">150 items</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest inventory movements</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
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
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
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
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
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
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
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
    </ProtectedRoute>
  )
}
