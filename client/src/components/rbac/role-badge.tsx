import React from "react";
import { Badge } from "@/components/ui/badge";
import { ROLE_DISPLAY_NAMES, UserRole } from "@shared/rbac-roles";
import { 
  Crown, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  User,
  Building,
  UserCircle
} from "lucide-react";

export interface RoleBadgeProps {
  role: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Component that renders a badge with appropriate styling for a user role
 * Optionally includes an icon representing the role
 */
export function RoleBadge({ role, className, showIcon = false }: RoleBadgeProps) {
  // Map role to display name, variant and icon
  const getRoleInfo = (role: string) => {
    const roleKey = role.toLowerCase() as UserRole;
    let displayName = ROLE_DISPLAY_NAMES[roleKey] || role;
    let variant: "default" | "admin" | "manager" | "staff" | "client" | "secondary" = "secondary";
    let Icon = User;
    
    switch (roleKey) {
      case "super_admin":
        variant = "admin";
        Icon = Crown;
        break;
      case "internal_admin":
      case "admin":
        variant = "admin";
        Icon = ShieldCheck;
        break;
      case "internal_field_manager":
        variant = "manager";
        Icon = Briefcase;
        break;
      case "field_coordinator":
        variant = "manager";
        Icon = Users;
        break;
      case "brand_agent":
        variant = "staff";
        Icon = UserCircle;
        break;
      case "client_manager":
        variant = "client";
        Icon = Building;
        break;
      case "client_user":
      case "user":
        variant = "client";
        Icon = User;
        break;
    }
    
    return { label: displayName, variant, Icon };
  };

  const { label, variant, Icon } = getRoleInfo(role);

  return (
    <Badge variant={variant} className={className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}