import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import AdminRoute from '@/components/AdminRoute';

export default function SettingsPage() {
  return (
    <AdminRoute>
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Settings" description="Manage system settings" />

      <main className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="bg-muted/80 backdrop-blur-sm">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4">
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="bg-muted/30 rounded-t-lg">
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Set company information for reports and documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Example Company Ltd." className="border-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID</Label>
                    <Input id="tax-id" defaultValue="0123456789012" className="border-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="(123) 456-7890" className="border-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    defaultValue="123 Example Street, Example City, 12345"
                    className="border-primary/20"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="bg-muted/30 rounded-t-lg">
                <CardTitle>Product Settings</CardTitle>
                <CardDescription>Configure product parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                    <Input id="low-stock-threshold" type="number" defaultValue="10" className="border-primary/20" />
                    <p className="text-sm text-muted-foreground">Minimum quantity before system alerts for low stock</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-unit">Default Unit</Label>
                    <Select defaultValue="piece">
                      <SelectTrigger id="default-unit" className="border-primary/20">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="ream">Ream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="bg-muted/30 rounded-t-lg">
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-stock-notification">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when items fall below minimum threshold</p>
                  </div>
                  <Switch id="low-stock-notification" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stock-in-notification">Stock In Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify when new items are added to inventory</p>
                  </div>
                  <Switch id="stock-in-notification" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stock-out-notification">Stock Out Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify when items are removed from inventory</p>
                  </div>
                  <Switch id="stock-out-notification" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notification">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications to admin email</p>
                  </div>
                  <Switch id="email-notification" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="backup" className="space-y-4">
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="bg-muted/30 rounded-t-lg">
                <CardTitle>Data Backup</CardTitle>
                <CardDescription>Configure automatic and manual data backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup">Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup data on schedule</p>
                  </div>
                  <Switch id="auto-backup" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="backup-frequency" className="border-primary/20">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-retention">Backup Retention</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="backup-retention" className="border-primary/20">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    Backup Now
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="system" className="space-y-4">
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="bg-muted/30 rounded-t-lg">
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system parameters and connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input id="api-url" defaultValue="https://api.example.com/v1" className="border-primary/20" />
                  <p className="text-sm text-muted-foreground">URL for connecting to the backend API</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" defaultValue="••••••••••••••••" className="border-primary/20" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable debug mode for troubleshooting</p>
                  </div>
                  <Switch id="debug-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to temporarily disable system
                    </p>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </AdminRoute>
  )
}
