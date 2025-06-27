import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/rbac/role-badge";
import { PermissionGuard } from "@/components/rbac/permission-guard";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { permissions } = usePermissions();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Rishi Workforce Management Platform</h1>
        
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Welcome, {user?.firstName || user?.username}!</CardTitle>
            <CardDescription className="flex items-center gap-2">
              You are logged in as <RoleBadge role={user?.role || 'client_user'} showIcon />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="font-medium">Your Information:</p>
              <ul className="mt-2 space-y-1">
                <li><span className="font-medium">Username:</span> {user?.username}</li>
                <li><span className="font-medium">Email:</span> {user?.email}</li>
                <li><span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}</li>
                <li><span className="font-medium">Organization ID:</span> {user?.organizationId}</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium">Role-Based Access Control:</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your access to features is determined by your role in the system.
                As a {user?.role}, you have access to specific permissions.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              disabled={logoutMutation.isPending}
              className="w-full"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </CardFooter>
        </Card>

        {/* Permissions Card - Only shown if user has permissions */}
        {permissions.length > 0 && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Your Permissions</CardTitle>
              <CardDescription>
                Based on your role, you have the following permissions:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <Badge key={permission} className="bg-secondary">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role-Specific Content */}
        <div className="w-full max-w-2xl mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Admin Panel Access */}
          <PermissionGuard
            permissions="view:admin"
            hideIfNoAccess={true}
          >
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage system settings and users</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Access administrative features to manage the platform.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Go to Admin Panel</Button>
              </CardFooter>
            </Card>
          </PermissionGuard>

          {/* User Management */}
          <PermissionGuard
            permissions={["view:users", "create:users"]}
            requireAll={false}
          >
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and access</CardDescription>
              </CardHeader>
              <CardContent>
                <p>View and manage users within your organization.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Manage Users</Button>
              </CardFooter>
            </Card>
          </PermissionGuard>

          {/* Event Management */}
          <PermissionGuard
            permissions="view:events"
          >
            <Card>
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>View and manage events</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Access event scheduling and management features.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Events</Button>
              </CardFooter>
            </Card>
          </PermissionGuard>

          {/* Booking Management */}
          <PermissionGuard
            permissions="view:bookings"
          >
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>View and manage bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Access booking and scheduling features.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Bookings</Button>
              </CardFooter>
            </Card>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}