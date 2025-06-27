import { eq, and, not, inArray, or, asc, desc, sql, like } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { 
  users, 
  sessions, 
  roles, 
  permissions, 
  rolePermissions, 
  organizations,
  userOrganizations,
  organizationPermissions,
  organizationInvitations,
  organizationBranding,
  organizationSettings,
  userOrganizationPreferences,
  // Brand management schema imports
  brands,
  states,
  regions,
  brandRegions,
  kitTemplates,
  kits,
  kitComponentInventory,
  locations,
  brandLocations,
  // Type imports
  User, 
  InsertUser, 
  Role, 
  Permission,
  RolePermission,
  Organization,
  InsertOrganization,
  OrganizationPermission,
  InsertOrganizationPermission,
  UserOrganization,
  InsertUserOrganization,
  OrganizationInvitation,
  OrganizationBranding,
  UserOrganizationPreference,
  // Brand management type imports
  Brand,
  InsertBrand,
  State,
  InsertState,
  Region,
  InsertRegion,
  BrandRegion,
  InsertBrandRegion,
  KitTemplate,
  InsertKitTemplate,
  Kit,
  InsertKit,
  KitComponentInventory,
  InsertKitComponentInventory,
  Location,
  InsertLocation,
  BrandLocation,
  InsertBrandLocation
} from "../shared/schema";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Parameters for organization-aware storage operations
export interface OrganizationContext {
  organizationId: string;
  userRole?: string;  // Optional user role within organization
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Organization operations
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizations(): Promise<Organization[]>;
  createOrganization(organizationData: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, organizationData: Partial<InsertOrganization>): Promise<Organization | undefined>;
  deleteOrganization(id: string): Promise<boolean>;

  // Role and permission operations
  getAllRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(roleData: Partial<Role>): Promise<Role>;
  updateRole(id: string, roleData: Partial<Role>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;

  getAllPermissions(): Promise<Permission[]>;
  getPermission(id: string): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  createPermission(permissionData: Partial<Permission>): Promise<Permission>;
  updatePermission(id: string, permissionData: Partial<Permission>): Promise<Permission | undefined>;
  deletePermission(id: string): Promise<boolean>;

  getRolePermissions(roleId: string): Promise<Permission[]>;
  addPermissionToRole(roleId: string, permissionId: string): Promise<boolean>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean>;

  // Organization-aware User operations
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  getUsersInOrganization(context: OrganizationContext): Promise<User[]>;
  getUserInOrganization(userId: string, context: OrganizationContext): Promise<User | undefined>;
  createUserInOrganization(userData: InsertUser, context: OrganizationContext): Promise<User>;
  updateUserInOrganization(userId: string, userData: Partial<InsertUser>, context: OrganizationContext): Promise<User | undefined>;

  // Organization-aware Role and Permission operations
  getRolesForOrganization(context: OrganizationContext): Promise<Role[]>;
  getOrganizationPermissions(context: OrganizationContext): Promise<OrganizationPermission[]>;
  addOrganizationPermission(permissionData: InsertOrganizationPermission): Promise<OrganizationPermission>; 
  updateOrganizationPermission(id: string, permissionData: Partial<InsertOrganizationPermission>): Promise<OrganizationPermission | undefined>;
  removeOrganizationPermission(id: string): Promise<boolean>;

  // =========================================================
  // Brand Management
  // =========================================================

  // Brand operations
  getBrand(id: string): Promise<Brand | undefined>;
  getBrandsByClient(clientId: string): Promise<Brand[]>;
  getBrandsByName(name: string): Promise<Brand[]>;
  createBrand(brandData: InsertBrand): Promise<Brand>;
  updateBrand(id: string, brandData: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: string): Promise<boolean>;

  // =========================================================
  // Geographic Region Management
  // =========================================================

  // State operations
  getState(id: string): Promise<State | undefined>;
  getStateByAbbreviation(abbreviation: string): Promise<State | undefined>;
  getAllStates(activeOnly?: boolean): Promise<State[]>;
  createState(stateData: InsertState): Promise<State>;
  updateState(id: string, stateData: Partial<InsertState>): Promise<State | undefined>;

  // Region operations
  getRegion(id: string): Promise<Region | undefined>;
  getRegionsByState(stateId: string): Promise<Region[]>;
  getRegionsByZipcode(zipcode: string): Promise<Region[]>;
  createRegion(regionData: InsertRegion): Promise<Region>;
  updateRegion(id: string, regionData: Partial<InsertRegion>): Promise<Region | undefined>;
  deleteRegion(id: string): Promise<boolean>;

  // Brand-Region operations
  getBrandRegion(id: string): Promise<BrandRegion | undefined>;
  getBrandRegionsByBrand(brandId: string): Promise<BrandRegion[]>;
  getBrandRegionsByRegion(regionId: string): Promise<BrandRegion[]>;
  createBrandRegion(brandRegionData: InsertBrandRegion): Promise<BrandRegion>;
  updateBrandRegion(id: string, brandRegionData: Partial<InsertBrandRegion>): Promise<BrandRegion | undefined>;
  deleteBrandRegion(id: string): Promise<boolean>;

  // =========================================================
  // Kit Management
  // =========================================================

  // Kit Template operations
  getKitTemplate(id: string): Promise<KitTemplate | undefined>;
  getKitTemplatesByBrand(brandId: string): Promise<KitTemplate[]>;
  createKitTemplate(templateData: InsertKitTemplate): Promise<KitTemplate>;
  updateKitTemplate(id: string, templateData: Partial<InsertKitTemplate>): Promise<KitTemplate | undefined>;
  deleteKitTemplate(id: string): Promise<boolean>;

  // Kit operations
  getKit(id: string): Promise<Kit | undefined>;
  getKitBySerialNumber(serialNumber: string): Promise<Kit | undefined>;
  getKitsByBrandRegion(brandRegionId: string): Promise<Kit[]>;
  getKitsByTemplate(templateId: string): Promise<Kit[]>;
  createKit(kitData: InsertKit): Promise<Kit>;
  updateKit(id: string, kitData: Partial<InsertKit>): Promise<Kit | undefined>;
  deleteKit(id: string): Promise<boolean>;

  // Kit Component Inventory operations
  getKitComponentInventory(id: string): Promise<KitComponentInventory | undefined>;
  getKitComponentInventoryByKit(kitId: string): Promise<KitComponentInventory[]>;
  updateKitComponentInventory(id: string, inventoryData: Partial<InsertKitComponentInventory>): Promise<KitComponentInventory | undefined>;

  // =========================================================
  // Location Management
  // =========================================================

  // Location operations
  getLocation(id: string): Promise<Location | undefined>;
  getLocationsByState(stateId: string): Promise<Location[]>;
  getLocationsByZipcode(zipcode: string): Promise<Location[]>;
  getLocationsByStatus(status: string): Promise<Location[]>;
  createLocation(locationData: InsertLocation): Promise<Location>;
  updateLocation(id: string, locationData: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;

  // Location approval operations
  getPendingLocations(): Promise<Location[]>;
  approveLocation(id: string, reviewerId: string): Promise<Location | undefined>;
  rejectLocation(id: string, reviewerId: string, reason?: string): Promise<Location | undefined>;

  // Brand-Location operations
  getBrandLocation(id: string): Promise<BrandLocation | undefined>;
  getBrandLocationsByBrand(brandId: string): Promise<BrandLocation[]>;
  getBrandLocationsByLocation(locationId: string): Promise<BrandLocation[]>;
  createBrandLocation(brandLocationData: InsertBrandLocation): Promise<BrandLocation>;
  updateBrandLocation(id: string, brandLocationData: Partial<InsertBrandLocation>): Promise<BrandLocation | undefined>;
  deleteBrandLocation(id: string): Promise<boolean>;

  // Session store
  sessionStore: any; // Use any for now to avoid TypeScript errors
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      tableName: 'sessions',
      createTableIfMissing: true 
    });
  }

  // =========================================================
  // User Operations
  // =========================================================

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create user");
    }
    return result[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  }

  // =========================================================
  // Organization Operations
  // =========================================================

  async getOrganization(id: string): Promise<Organization | undefined> {
    const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getOrganizations(): Promise<Organization[]> {
    return db.select().from(organizations);
  }

  async createOrganization(organizationData: InsertOrganization): Promise<Organization> {
    const result = await db.insert(organizations).values(organizationData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create organization");
    }
    return result[0];
  }

  async updateOrganization(id: string, organizationData: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const result = await db.update(organizations)
      .set(organizationData)
      .where(eq(organizations.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const result = await db.delete(organizations)
      .where(eq(organizations.id, id))
      .returning({ id: organizations.id });
    return result.length > 0;
  }

  // =========================================================
  // Role and Permission Operations
  // =========================================================

  async getAllRoles(): Promise<Role[]> {
    return db.select().from(roles);
  }

  async getRole(id: string): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const result = await db.insert(roles).values(roleData as any).returning();
    if (result.length === 0) {
      throw new Error("Failed to create role");
    }
    return result[0];
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role | undefined> {
    const result = await db.update(roles)
      .set(roleData as any)
      .where(eq(roles.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await db.delete(roles)
      .where(eq(roles.id, id))
      .returning({ id: roles.id });
    return result.length > 0;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return db.select().from(permissions);
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    const result = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    const result = await db.select().from(permissions).where(eq(permissions.name, name)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createPermission(permissionData: Partial<Permission>): Promise<Permission> {
    const result = await db.insert(permissions).values(permissionData as any).returning();
    if (result.length === 0) {
      throw new Error("Failed to create permission");
    }
    return result[0];
  }

  async updatePermission(id: string, permissionData: Partial<Permission>): Promise<Permission | undefined> {
    const result = await db.update(permissions)
      .set(permissionData as any)
      .where(eq(permissions.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deletePermission(id: string): Promise<boolean> {
    const result = await db.delete(permissions)
      .where(eq(permissions.id, id))
      .returning({ id: permissions.id });
    return result.length > 0;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    // Get permission IDs for the role
    const permissionIds = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    // Get the actual permissions
    if (permissionIds.length === 0) {
      return [];
    }

    // Extract just the IDs
    const ids = permissionIds.map(row => row.permissionId);

    // Get the permissions
    return db
      .select()
      .from(permissions)
      .where(inArray(permissions.id, ids));
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<boolean> {
    // Check if the permission is already assigned to the role
    const exists = await db
      .select({ count: sql`count(*)` })
      .from(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));

    if (Number(exists[0].count) > 0) {
      return true; // Already assigned
    }

    // Assign the permission to the role
    const result = await db
      .insert(rolePermissions)
      .values({ roleId, permissionId })
      .returning();

    return result.length > 0;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const result = await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)))
      .returning({ roleId: rolePermissions.roleId });

    return result.length > 0;
  }

  // =========================================================
  // Organization-aware User operations
  // =========================================================

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return this.getUsersInOrganization({ organizationId });
  }

  async getUsersInOrganization(context: OrganizationContext): Promise<User[]> {
    // First get direct users (where organizationId is set)
    const directUsers = await db
      .select()
      .from(users)
      .where(eq(users.organizationId, context.organizationId));

    // Then get users from the user_organizations junction table
    const userOrgsResult = await db
      .select({ userId: userOrganizations.userId })
      .from(userOrganizations)
      .where(eq(userOrganizations.organizationId, context.organizationId));

    if (userOrgsResult.length === 0 && directUsers.length === 0) {
      return [];
    }

    // Extract just the IDs
    const userIds = userOrgsResult.map(row => row.userId);

    // If no related users, just return direct users
    if (userIds.length === 0) {
      return directUsers;
    }

    // Get the related users
    const relatedUsers = await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

    // Combine both sets, removing duplicates
    const allUsers = new Map<string, User>();

    directUsers.forEach(user => {
      allUsers.set(user.id, user);
    });

    relatedUsers.forEach(user => {
      allUsers.set(user.id, user);
    });

    return Array.from(allUsers.values());
  }

  async getUserInOrganization(userId: string, context: OrganizationContext): Promise<User | undefined> {
    // Check direct assignment
    const directUser = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.organizationId, context.organizationId)))
      .limit(1);

    if (directUser.length > 0) {
      return directUser[0];
    }

    // Check user-organization relationship
    const hasRelationship = await db
      .select({ count: sql`count(*)` })
      .from(userOrganizations)
      .where(and(eq(userOrganizations.userId, userId), eq(userOrganizations.organizationId, context.organizationId)));

    if (Number(hasRelationship[0].count) > 0) {
      const user = await this.getUser(userId);
      return user;
    }

    return undefined;
  }

  async createUserInOrganization(userData: InsertUser, context: OrganizationContext): Promise<User> {
    // Create the user with organization ID
    const userWithOrg = {
      ...userData,
      organizationId: context.organizationId
    };

    const user = await this.createUser(userWithOrg);

    // Create the user-organization relationship
    await db
      .insert(userOrganizations)
      .values({
        userId: user.id,
        organizationId: context.organizationId,
        role: userData.role || 'client_user',
        isDefault: true
      });

    return user;
  }

  async updateUserInOrganization(userId: string, userData: Partial<InsertUser>, context: OrganizationContext): Promise<User | undefined> {
    // Verify user belongs to organization
    const existingUser = await this.getUserInOrganization(userId, context);
    if (!existingUser) {
      return undefined;
    }

    // Update the user
    const updatedUser = await this.updateUser(userId, userData);

    // Update the role in user-organization relationship if needed
    if (userData.role && updatedUser) {
      await db
        .update(userOrganizations)
        .set({ role: userData.role })
        .where(and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, context.organizationId)
        ));
    }

    return updatedUser;
  }

  // =========================================================
  // Organization-aware Role and Permission operations
  // =========================================================

  async getRolesForOrganization(context: OrganizationContext): Promise<Role[]> {
    const org = await this.getOrganization(context.organizationId);
    if (!org) {
      return [];
    }

    // Get roles that match the organization type or are available for all types
    return db
      .select()
      .from(roles)
      .where(or(eq(roles.organizationType, org.type), eq(roles.organizationType, 'all')));
  }

  async getOrganizationPermissions(context: OrganizationContext): Promise<OrganizationPermission[]> {
    return db
      .select()
      .from(organizationPermissions)
      .where(eq(organizationPermissions.organizationId, context.organizationId));
  }

  async addOrganizationPermission(permissionData: InsertOrganizationPermission): Promise<OrganizationPermission> {
    const result = await db
      .insert(organizationPermissions)
      .values(permissionData)
      .returning();

    if (result.length === 0) {
      throw new Error("Failed to add organization permission");
    }
    return result[0];
  }

  async updateOrganizationPermission(id: string, permissionData: Partial<InsertOrganizationPermission>): Promise<OrganizationPermission | undefined> {
    const result = await db
      .update(organizationPermissions)
      .set(permissionData)
      .where(eq(organizationPermissions.id, id))
      .returning();

    return result.length > 0 ? result[0] : undefined;
  }

  async removeOrganizationPermission(id: string): Promise<boolean> {
    const result = await db
      .delete(organizationPermissions)
      .where(eq(organizationPermissions.id, id))
      .returning({ id: organizationPermissions.id });

    return result.length > 0;
  }

  // =========================================================
  // Brand Management Implementation
  // =========================================================

  async getBrand(id: string): Promise<Brand | undefined> {
    const result = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getBrandsByClient(clientId: string): Promise<Brand[]> {
    return db.select().from(brands).where(eq(brands.clientId, clientId));
  }

  async getBrandsByName(name: string): Promise<Brand[]> {
    // Using a LIKE query with a wildcard for partial name matching
    const likeName = `%${name}%`;
    return db.select().from(brands).where(sql`${brands.name} ILIKE ${likeName}`);
  }

  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const result = await db.insert(brands).values(brandData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create brand");
    }
    return result[0];
  }

  async updateBrand(id: string, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const result = await db.update(brands).set(brandData).where(eq(brands.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteBrand(id: string): Promise<boolean> {
    const result = await db.delete(brands).where(eq(brands.id, id)).returning({ id: brands.id });
    return result.length > 0;
  }

  // =========================================================
  // Geographic Region Management Implementation
  // =========================================================

  // State operations
  async getState(id: string): Promise<State | undefined> {
    const result = await db.select().from(states).where(eq(states.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getStateByAbbreviation(abbreviation: string): Promise<State | undefined> {
    const result = await db.select().from(states).where(eq(states.abbreviation, abbreviation)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllStates(activeOnly: boolean = true): Promise<State[]> {
    if (activeOnly) {
      return db.select().from(states).where(eq(states.active, true));
    }
    return db.select().from(states);
  }

  async createState(stateData: InsertState): Promise<State> {
    const result = await db.insert(states).values(stateData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create state");
    }
    return result[0];
  }

  async updateState(id: string, stateData: Partial<InsertState>): Promise<State | undefined> {
    const result = await db.update(states).set(stateData).where(eq(states.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // Region operations
  async getRegion(id: string): Promise<Region | undefined> {
    const result = await db.select().from(regions).where(eq(regions.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getRegionsByState(stateId: string): Promise<Region[]> {
    return db.select().from(regions).where(eq(regions.stateId, stateId));
  }

  async getRegionsByZipcode(zipcode: string): Promise<Region[]> {
    // This uses a PostgreSQL array contains operator
    return db.select().from(regions).where(sql`${zipcode} = ANY(${regions.zipcodes})`);
  }

  async createRegion(regionData: InsertRegion): Promise<Region> {
    const result = await db.insert(regions).values(regionData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create region");
    }
    return result[0];
  }

  async updateRegion(id: string, regionData: Partial<InsertRegion>): Promise<Region | undefined> {
    const result = await db.update(regions).set(regionData).where(eq(regions.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteRegion(id: string): Promise<boolean> {
    const result = await db.delete(regions).where(eq(regions.id, id)).returning({ id: regions.id });
    return result.length > 0;
  }

  // Brand-Region operations
  async getBrandRegion(id: string): Promise<BrandRegion | undefined> {
    const result = await db.select().from(brandRegions).where(eq(brandRegions.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getBrandRegionsByBrand(brandId: string): Promise<BrandRegion[]> {
    return db.select().from(brandRegions).where(eq(brandRegions.brandId, brandId));
  }

  async getBrandRegionsByRegion(regionId: string): Promise<BrandRegion[]> {
    return db.select().from(brandRegions).where(eq(brandRegions.regionId, regionId));
  }

  async createBrandRegion(brandRegionData: InsertBrandRegion): Promise<BrandRegion> {
    const result = await db.insert(brandRegions).values(brandRegionData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create brand region relationship");
    }
    return result[0];
  }

  async updateBrandRegion(id: string, brandRegionData: Partial<InsertBrandRegion>): Promise<BrandRegion | undefined> {
    const result = await db.update(brandRegions).set(brandRegionData).where(eq(brandRegions.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteBrandRegion(id: string): Promise<boolean> {
    const result = await db.delete(brandRegions).where(eq(brandRegions.id, id)).returning({ id: brandRegions.id });
    return result.length > 0;
  }

  // =========================================================
  // Kit Management Implementation
  // =========================================================

  // Kit Template operations
  async getKitTemplate(id: string): Promise<KitTemplate | undefined> {
    const result = await db.select().from(kitTemplates).where(eq(kitTemplates.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getKitTemplatesByBrand(brandId: string): Promise<KitTemplate[]> {
    return db.select().from(kitTemplates).where(eq(kitTemplates.brand_id, brandId));
  }

  async createKitTemplate(templateData: InsertKitTemplate): Promise<KitTemplate> {
    const result = await db.insert(kitTemplates).values(templateData).returning();
    return result[0];
  }

  async updateKitTemplate(id: string, templateData: Partial<InsertKitTemplate>): Promise<KitTemplate | undefined> {
    const result = await db.update(kitTemplates).set(templateData).where(eq(kitTemplates.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteKitTemplate(id: string): Promise<boolean> {
    const result = await db.delete(kitTemplates).where(eq(kitTemplates.id, id)).returning({ id: kitTemplates.id });
    return result.length > 0;
  }

  // Kit operations
  async getKit(id: string): Promise<Kit | undefined> {
    const result = await db.select().from(kits).where(eq(kits.id, Number(id))).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getKitBySerialNumber(serialNumber: string): Promise<Kit | undefined> {
    const result = await db.select().from(kits).where(eq(kits.name, serialNumber)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getKitsByBrandRegion(brandRegionId: string): Promise<Kit[]> {
    return db.select().from(kits).where(eq(kits.brandRegionId, brandRegionId));
  }

  async getKitsByTemplate(templateId: string): Promise<Kit[]> {
    return db.select().from(kits).where(eq(kits.templateId, templateId));
  }

  async createKit(kitData: InsertKit): Promise<Kit> {
    const result = await db.insert(kits).values(kitData).returning();
    return result[0];
  }

  async updateKit(id: string, kitData: Partial<InsertKit>): Promise<Kit | undefined> {
    const result = await db.update(kits).set(kitData).where(eq(kits.id, Number(id))).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteKit(id: string): Promise<boolean> {
    const result = await db.delete(kits).where(eq(kits.id, Number(id))).returning({ id: kits.id });
    return result.length > 0;
  }

  // Kit Component Inventory operations
  async getKitComponentInventory(id: string): Promise<KitComponentInventory | undefined> {
    const result = await db.select().from(kitComponentInventory).where(eq(kitComponentInventory.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getKitComponentInventoryByKit(kitId: string): Promise<KitComponentInventory[]> {
    return db.select().from(kitComponentInventory).where(eq(kitComponentInventory.kitId, String(kitId)));
  }

  async updateKitComponentInventory(id: string, inventoryData: Partial<InsertKitComponentInventory>): Promise<KitComponentInventory | undefined> {
    const result = await db.update(kitComponentInventory).set(inventoryData).where(eq(kitComponentInventory.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // =========================================================
  // Location Management Implementation
  // =========================================================

  // Location operations
  async getLocation(id: string): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getLocationsByState(stateId: string): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.stateId, stateId));
  }

  async getLocationsByZipcode(zipcode: string): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.zipcode, zipcode));
  }

  async getLocationsByStatus(status: string): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.status, status));
  }

  async createLocation(locationData: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(locationData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create location");
    }
    return result[0];
  }

  async updateLocation(id: string, locationData: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db.update(locations).set(locationData).where(eq(locations.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id)).returning({ id: locations.id });
    return result.length > 0;
  }

  // Location approval operations
  async getPendingLocations(): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.status, 'pending'));
  }

  async approveLocation(id: string, reviewerId: string): Promise<Location | undefined> {
    const result = await db.update(locations)
      .set({ 
        status: 'approved', 
        reviewedBy: reviewerId, 
        reviewDate: new Date() 
      })
      .where(eq(locations.id, id))
      .returning();

    return result.length > 0 ? result[0] : undefined;
  }

  async rejectLocation(id: string, reviewerId: string, reason?: string): Promise<Location | undefined> {
    const updateData: any = { 
      status: 'rejected', 
      reviewedBy: reviewerId, 
      reviewDate: new Date() 
    };

    if (reason) {
      updateData.notes = reason;
    }

    const result = await db.update(locations)
      .set(updateData)
      .where(eq(locations.id, id))
      .returning();

    return result.length > 0 ? result[0] : undefined;
  }

  // Brand-Location operations
  async getBrandLocation(id: string): Promise<BrandLocation | undefined> {
    const result = await db.select().from(brandLocations).where(eq(brandLocations.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getBrandLocationsByBrand(brandId: string): Promise<BrandLocation[]> {
    return db.select().from(brandLocations).where(eq(brandLocations.brandId, brandId));
  }

  async getBrandLocationsByLocation(locationId: string): Promise<BrandLocation[]> {
    return db.select().from(brandLocations).where(eq(brandLocations.locationId, locationId));
  }

  async createBrandLocation(brandLocationData: InsertBrandLocation): Promise<BrandLocation> {
    const result = await db.insert(brandLocations).values(brandLocationData).returning();
    if (result.length === 0) {
      throw new Error("Failed to create brand location relationship");
    }
    return result[0];
  }

  async updateBrandLocation(id: string, brandLocationData: Partial<InsertBrandLocation>): Promise<BrandLocation | undefined> {
    const result = await db.update(brandLocations).set(brandLocationData).where(eq(brandLocations.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteBrandLocation(id: string): Promise<boolean> {
    const result = await db.delete(brandLocations).where(eq(brandLocations.id, id)).returning({ id: brandLocations.id });
    return result.length > 0;
  }
}

// Create in-memory implementation for development and testing
export class MemStorage implements IStorage {
  private users: User[] = [];
  private organizations: Organization[] = [];
  private roles: Role[] = [];
  private permissions: Permission[] = [];
  private rolePermissions: RolePermission[] = [];
  private userOrganizations: UserOrganization[] = [];
  private orgPermissions: OrganizationPermission[] = [];

  // Client setup entities
  private brands: Brand[] = [];
  private states: State[] = [];
  private regions: Region[] = [];
  private brandRegions: BrandRegion[] = [];
  private kitTemplates: KitTemplate[] = [];
  private kits: Kit[] = [];
  private kitComponentInventory: KitComponentInventory[] = [];
  private locations: Location[] = [];
  private brandLocations: BrandLocation[] = [];

  // ID counters
  private userIdCounter = 1;
  private organizationIdCounter = 1;
  private roleIdCounter = 1;
  private permissionIdCounter = 1;
  private userOrgIdCounter = 1;
  private orgPermissionIdCounter = 1;
  private brandIdCounter = 1;
  private stateIdCounter = 1;
  private regionIdCounter = 1;
  private brandRegionIdCounter = 1;
  private kitTemplateIdCounter = 1;
  private kitIdCounter = 1;
  private kitComponentInventoryIdCounter = 1;
  private locationIdCounter = 1;
  private brandLocationIdCounter = 1;

  sessionStore: any;

  constructor() {
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize with some dev data
    this.initDevData();
  }

  // =========================================================
  // User Operations
  // =========================================================

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date()
    };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  // =========================================================
  // Organization Operations
  // =========================================================

  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.find(org => org.id === id);
  }

  async getOrganizations(): Promise<Organization[]> {
    return [...this.organizations];
  }

  async createOrganization(organizationData: InsertOrganization): Promise<Organization> {
    const organization: Organization = {
      id: this.organizationIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...organizationData
    };
    this.organizations.push(organization);
    return organization;
  }

  async updateOrganization(id: string, organizationData: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const index = this.organizations.findIndex(org => org.id === id);
    if (index === -1) return undefined;

    this.organizations[index] = {
      ...this.organizations[index],
      ...organizationData,
      updatedAt: new Date()
    };
    return this.organizations[index];
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const index = this.organizations.findIndex(org => org.id === id);
    if (index === -1) return false;

    this.organizations.splice(index, 1);
    return true;
  }

  // =========================================================
  // Role and Permission Operations
  // =========================================================

  async getAllRoles(): Promise<Role[]> {
    return [...this.roles];
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.find(role => role.id === id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    return this.roles.find(role => role.name === name);
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role: Role = {
      id: this.roleIdCounter++,
      name: roleData.name || '',
      description: roleData.description || '',
      organizationType: roleData.organizationType || 'all',
      hierarchyLevel: roleData.hierarchyLevel || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.roles.push(role);
    return role;
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role | undefined> {
    const index = this.roles.findIndex(role => role.id === id);
    if (index === -1) return undefined;

    this.roles[index] = {
      ...this.roles[index],
      ...roleData,
      updatedAt: new Date()
    };
    return this.roles[index];
  }

  async deleteRole(id: string): Promise<boolean> {
    const index = this.roles.findIndex(role => role.id === id);
    if (index === -1) return false;

    this.roles.splice(index, 1);
    return true;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return [...this.permissions];
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    return this.permissions.find(permission => permission.id === id);
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    return this.permissions.find(permission => permission.name === name);
  }

  async createPermission(permissionData: Partial<Permission>): Promise<Permission> {
    const permission: Permission = {
      id: this.permissionIdCounter++,
      name: permissionData.name || '',
      description: permissionData.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.permissions.push(permission);
    return permission;
  }

  async updatePermission(id: string, permissionData: Partial<Permission>): Promise<Permission | undefined> {
    const index = this.permissions.findIndex(permission => permission.id === id);
    if (index === -1) return undefined;

    this.permissions[index] = {
      ...this.permissions[index],
      ...permissionData,
      updatedAt: new Date()
    };
    return this.permissions[index];
  }

  async deletePermission(id: string): Promise<boolean> {
    const index = this.permissions.findIndex(permission => permission.id === id);
    if (index === -1) return false;

    this.permissions.splice(index, 1);
    return true;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const permissionIds = this.rolePermissions
      .filter(rp => rp.roleId === roleId)
      .map(rp => rp.permissionId);

    return this.permissions.filter(perm => permissionIds.includes(perm.id));
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<boolean> {
    const exists = this.rolePermissions.some(
      rp => rp.roleId === roleId && rp.permissionId === permissionId
    );

    if (exists) {
      return true; // Already assigned
    }

    this.rolePermissions.push({
      roleId,
      permissionId,
      createdAt: new Date()
    });

    return true;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const initialLength = this.rolePermissions.length;
    this.rolePermissions = this.rolePermissions.filter(
      rp => !(rp.roleId === roleId && rp.permissionId === permissionId)
    );
    return this.rolePermissions.length < initialLength;
  }

  // =========================================================
  // Organization-aware User operations
  // =========================================================

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return this.getUsersInOrganization({ organizationId });
  }

  async getUsersInOrganization(context: OrganizationContext): Promise<User[]> {
    // Get directly assigned users
    const directUsers = this.users.filter(user => user.organizationId === context.organizationId);

    // Get users from user_organizations relationships
    const relatedUserIds = this.userOrganizations
      .filter(uo => uo.organizationId === context.organizationId)
      .map(uo => uo.userId);

    const relatedUsers = this.users.filter(user => relatedUserIds.includes(user.id));

    // Combine both sets, removing duplicates
    const allUsers = new Map<string, User>();

    directUsers.forEach(user => {
      allUsers.set(user.id, user);
    });

    relatedUsers.forEach(user => {
      allUsers.set(user.id, user);
    });

    return Array.from(allUsers.values());
  }

  async getUserInOrganization(userId: string, context: OrganizationContext): Promise<User | undefined> {
    // Check direct assignment
    const directUser = this.users.find(
      user => user.id === userId && user.organizationId === context.organizationId
    );

    if (directUser) {
      return directUser;
    }

    // Check user-organization relationship
    const hasRelationship = this.userOrganizations.some(
      uo => uo.userId === userId && uo.organizationId === context.organizationId
    );

    if (hasRelationship) {
      return this.users.find(user => user.id === userId);
    }

    return undefined;
  }

  async createUserInOrganization(userData: InsertUser, context: OrganizationContext): Promise<User> {
    // Create the user with organization ID
    const user: User = {
      id: this.userIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
      organizationId: context.organizationId
    };

    this.users.push(user);

    // Create the user-organization relationship
    this.userOrganizations.push({
      id: this.userOrgIdCounter++,
      userId: user.id,
      organizationId: context.organizationId,
      role: userData.role,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return user;
  }

  async updateUserInOrganization(userId: string, userData: Partial<InsertUser>, context: OrganizationContext): Promise<User | undefined> {
    // Verify user belongs to organization
    const user = await this.getUserInOrganization(userId, context);
    if (!user) return undefined;

    // Find and update the user
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date()
    };

    // Update the role in user-organization relationship if needed
    if (userData.role) {
      const userOrgIndex = this.userOrganizations.findIndex(
        uo => uo.userId === userId && uo.organizationId === context.organizationId
      );

      if (userOrgIndex >= 0) {
        this.userOrganizations[userOrgIndex] = {
          ...this.userOrganizations[userOrgIndex],
          role: userData.role,
          updatedAt: new Date()
        };
      }
    }

    return this.users[index];
  }

  // =========================================================
  // Organization-aware Role and Permission operations
  // =========================================================

  async getRolesForOrganization(context: OrganizationContext): Promise<Role[]> {
    const org = this.organizations.find(o => o.id === context.organizationId);
    if (!org) return [];

    // Get roles based on organization type
    return this.roles.filter(role => 
      role.organizationType === org.type || role.organizationType === 'all'
    );
  }

  async getOrganizationPermissions(context: OrganizationContext): Promise<OrganizationPermission[]> {
    return this.orgPermissions.filter(p => p.organizationId === context.organizationId);
  }

  async addOrganizationPermission(permissionData: InsertOrganizationPermission): Promise<OrganizationPermission> {
    const orgPermission: OrganizationPermission = {
      id: this.orgPermissionIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...permissionData
    };

    this.orgPermissions.push(orgPermission);
    return orgPermission;
  }

  async updateOrganizationPermission(id: string, permissionData: Partial<InsertOrganizationPermission>): Promise<OrganizationPermission | undefined> {
    const index = this.orgPermissions.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.orgPermissions[index] = {
      ...this.orgPermissions[index],
      ...permissionData,
      updatedAt: new Date()
    };

    return this.orgPermissions[index];
  }

  async removeOrganizationPermission(id: string): Promise<boolean> {
    const index = this.orgPermissions.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.orgPermissions.splice(index, 1);
    return true;
  }

  // =========================================================
  // Brand Management Implementation
  // =========================================================

  async getBrand(id: string): Promise<Brand | undefined> {
    return this.brands.find(brand => brand.id === id);
  }

  async getBrandsByClient(clientId: string): Promise<Brand[]> {
    return this.brands.filter(brand => brand.clientId === clientId);
  }

  async getBrandsByName(name: string): Promise<Brand[]> {
    const nameLower = name.toLowerCase();
    return this.brands.filter(brand => 
      brand.name.toLowerCase().includes(nameLower)
    );
  }

  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const brand: Brand = {
      id: this.brandIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...brandData,
    };
    this.brands.push(brand);
    return brand;
  }

  async updateBrand(id: string, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const index = this.brands.findIndex(brand => brand.id === id);
    if (index === -1) return undefined;

    this.brands[index] = {
      ...this.brands[index],
      ...brandData,
      updatedAt: new Date()
    };
    return this.brands[index];
  }

  async deleteBrand(id: string): Promise<boolean> {
    const index = this.brands.findIndex(brand => brand.id === id);
    if (index === -1) return false;

    this.brands.splice(index, 1);
    return true;
  }

  // =========================================================
  // Geographic Region Management Implementation
  // =========================================================

  async getState(id: string): Promise<State | undefined> {
    return this.states.find(state => state.id === id);
  }

  async getStateByAbbreviation(abbreviation: string): Promise<State | undefined> {
    return this.states.find(state => state.abbreviation === abbreviation);
  }

  async getAllStates(activeOnly: boolean = true): Promise<State[]> {
    if (activeOnly) {
      return this.states.filter(state => state.active);
    }
    return [...this.states];
  }

  async createState(stateData: InsertState): Promise<State> {
    const state: State = {
      id: this.stateIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...stateData,
    };
    this.states.push(state);
    return state;
  }

  async updateState(id: string, stateData: Partial<InsertState>): Promise<State | undefined> {
    const index = this.states.findIndex(state => state.id === id);
    if (index === -1) return undefined;

    this.states[index] = {
      ...this.states[index],
      ...stateData,
      updatedAt: new Date()
    };
    return this.states[index];
  }

  async getRegion(id: string): Promise<Region | undefined> {
    return this.regions.find(region => region.id === id);
  }

  async getRegionsByState(stateId: string): Promise<Region[]> {
    return this.regions.filter(region => region.stateId === stateId);
  }

  async getRegionsByZipcode(zipcode: string): Promise<Region[]> {
    return this.regions.filter(region => 
      Array.isArray(region.zipcodes) && region.zipcodes.includes(zipcode)
    );
  }

  async createRegion(regionData: InsertRegion): Promise<Region> {
    const region: Region = {
      id: this.regionIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...regionData,
    };
    this.regions.push(region);
    return region;
  }

  async updateRegion(id: string, regionData: Partial<InsertRegion>): Promise<Region | undefined> {
    const index = this.regions.findIndex(region => region.id === id);
    if (index === -1) return undefined;

    this.regions[index] = {
      ...this.regions[index],
      ...regionData,
      updatedAt: new Date()
    };
    return this.regions[index];
  }

  async deleteRegion(id: string): Promise<boolean> {
    const index = this.regions.findIndex(region => region.id === id);
    if (index === -1) return false;

    this.regions.splice(index, 1);
    return true;
  }

  async getBrandRegion(id: string): Promise<BrandRegion | undefined> {
    return this.brandRegions.find(br => br.id === id);
  }

  async getBrandRegionsByBrand(brandId: string): Promise<BrandRegion[]> {
    return this.brandRegions.filter(br => br.brandId === brandId);
  }

  async getBrandRegionsByRegion(regionId: string): Promise<BrandRegion[]> {
    return this.brandRegions.filter(br => br.regionId === regionId);
  }

  async createBrandRegion(brandRegionData: InsertBrandRegion): Promise<BrandRegion> {
    const brandRegion: BrandRegion = {
      id: this.brandRegionIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...brandRegionData,
    };
    this.brandRegions.push(brandRegion);
    return brandRegion;
  }

  async updateBrandRegion(id: string, brandRegionData: Partial<InsertBrandRegion>): Promise<BrandRegion | undefined> {
    const index = this.brandRegions.findIndex(br => br.id === id);
    if (index === -1) return undefined;

    this.brandRegions[index] = {
      ...this.brandRegions[index],
      ...brandRegionData,
      updatedAt: new Date()
    };
    return this.brandRegions[index];
  }

  async deleteBrandRegion(id: string): Promise<boolean> {
    const index = this.brandRegions.findIndex(br => br.id === id);
    if (index === -1) return false;

    this.brandRegions.splice(index, 1);
    return true;
  }

  // =========================================================
  // Kit Management Implementation
  // =========================================================

  async getKitTemplate(id: string): Promise<KitTemplate | undefined> {
    return this.kitTemplates.find(template => template.id === id);
  }

  async getKitTemplatesByBrand(brandId: string): Promise<KitTemplate[]> {
    return this.kitTemplates.filter(template => template.brandId === brandId);
  }

  async createKitTemplate(templateData: InsertKitTemplate): Promise<KitTemplate> {
    const template: KitTemplate = {
      id: this.kitTemplateIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...templateData,
    };
    this.kitTemplates.push(template);
    return template;
  }

  async updateKitTemplate(id: string, templateData: Partial<InsertKitTemplate>): Promise<KitTemplate | undefined> {
    const index = this.kitTemplates.findIndex(template => template.id === id);
    if (index === -1) return undefined;

    this.kitTemplates[index] = {
      ...this.kitTemplates[index],
      ...templateData,
      updatedAt: new Date()
    };
    return this.kitTemplates[index];
  }

  async deleteKitTemplate(id: string): Promise<boolean> {
    const index = this.kitTemplates.findIndex(template => template.id === id);
    if (index === -1) return false;

    this.kitTemplates.splice(index, 1);
    return true;
  }

  async getKit(id: string): Promise<Kit | undefined> {
    return this.kits.find(kit => kit.id === id);
  }

  async getKitBySerialNumber(serialNumber: string): Promise<Kit | undefined> {
    return this.kits.find(kit => kit.serialNumber === serialNumber);
  }

  async getKitsByBrandRegion(brandRegionId: string): Promise<Kit[]> {
    return this.kits.filter(kit => kit.brandRegionId === brandRegionId);
  }

  async getKitsByTemplate(templateId: string): Promise<Kit[]> {
    return this.kits.filter(kit => kit.templateId === templateId);
  }

  async createKit(kitData: InsertKit): Promise<Kit> {
    const kit: Kit = {
      id: this.kitIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...kitData,
    };
    this.kits.push(kit);
    return kit;
  }

  async updateKit(id: string, kitData: Partial<InsertKit>): Promise<Kit | undefined> {
    const index = this.kits.findIndex(kit => kit.id === id);
    if (index === -1) return undefined;

    this.kits[index] = {
      ...this.kits[index],
      ...kitData,
      updatedAt: new Date()
    };
    return this.kits[index];
  }

  async deleteKit(id: string): Promise<boolean> {
    const index = this.kits.findIndex(kit => kit.id === id);
    if (index === -1) return false;

    this.kits.splice(index, 1);
    return true;
  }

  async getKitComponentInventory(id: string): Promise<KitComponentInventory | undefined> {
    return this.kitComponentInventory.find(inventory => inventory.id === id);
  }

  async getKitComponentInventoryByKit(kitId: string): Promise<KitComponentInventory[]> {
    return this.kitComponentInventory.filter(inventory => inventory.kitId === kitId);
  }

  async updateKitComponentInventory(id: string, inventoryData: Partial<InsertKitComponentInventory>): Promise<KitComponentInventory | undefined> {
    const index = this.kitComponentInventory.findIndex(inventory => inventory.id === id);
    if (index === -1) return undefined;

    this.kitComponentInventory[index] = {
      ...this.kitComponentInventory[index],
      ...inventoryData,
      updatedAt: new Date()
    };
    return this.kitComponentInventory[index];
  }

  // =========================================================
  // Location Management Implementation
  // =========================================================

  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.find(location => location.id === id);
  }

  async getLocationsByState(stateId: string): Promise<Location[]> {
    return this.locations.filter(location => location.stateId === stateId);
  }

  async getLocationsByZipcode(zipcode: string): Promise<Location[]> {
    return this.locations.filter(location => location.zipcode === zipcode);
  }

  async getLocationsByStatus(status: string): Promise<Location[]> {
    return this.locations.filter(location => location.status === status);
  }

  async createLocation(locationData: InsertLocation): Promise<Location> {
    const location: Location = {
      id: this.locationIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...locationData,
    };
    this.locations.push(location);
    return location;
  }

  async updateLocation(id: string, locationData: Partial<InsertLocation>): Promise<Location | undefined> {
    const index = this.locations.findIndex(location => location.id === id);
    if (index === -1) return undefined;

    this.locations[index] = {
      ...this.locations[index],
      ...locationData,
      updatedAt: new Date()
    };
    return this.locations[index];
  }

  async deleteLocation(id: string): Promise<boolean> {
    const index = this.locations.findIndex(location => location.id === id);
    if (index === -1) return false;

    this.locations.splice(index, 1);
    return true;
  }

  async getPendingLocations(): Promise<Location[]> {
    return this.locations.filter(location => location.status === 'pending');
  }

  async approveLocation(id: string, reviewerId: string): Promise<Location | undefined> {
    const index = this.locations.findIndex(location => location.id === id);
    if (index === -1) return undefined;

    this.locations[index] = {
      ...this.locations[index],
      status: 'approved',
      reviewedBy: reviewerId,
      reviewDate: new Date().toISOString(),
      updatedAt: new Date()
    };
    return this.locations[index];
  }

  async rejectLocation(id: string, reviewerId: string, reason?: string): Promise<Location | undefined> {
    const index = this.locations.findIndex(location => location.id === id);
    if (index === -1) return undefined;

    this.locations[index] = {
      ...this.locations[index],
      status: 'rejected',
      reviewedBy: reviewerId,
      notes: reason || this.locations[index].notes || '',
      reviewDate: new Date().toISOString(),
      updatedAt: new Date()
    };
    return this.locations[index];
  }

  async getBrandLocation(id: string): Promise<BrandLocation | undefined> {
    return this.brandLocations.find(bl => bl.id === id);
  }

  async getBrandLocationsByBrand(brandId: string): Promise<BrandLocation[]> {
    return this.brandLocations.filter(bl => bl.brandId === brandId);
  }

  async getBrandLocationsByLocation(locationId: string): Promise<BrandLocation[]> {
    return this.brandLocations.filter(bl => bl.locationId === locationId);
  }

  async createBrandLocation(brandLocationData: InsertBrandLocation): Promise<BrandLocation> {
    const brandLocation: BrandLocation = {
      id: this.brandLocationIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...brandLocationData,
    };
    this.brandLocations.push(brandLocation);
    return brandLocation;
  }

  async updateBrandLocation(id: string, brandLocationData: Partial<InsertBrandLocation>): Promise<BrandLocation | undefined> {
    const index = this.brandLocations.findIndex(bl => bl.id === id);
    if (index === -1) return undefined;

    this.brandLocations[index] = {
      ...this.brandLocations[index],
      ...brandLocationData,
      updatedAt: new Date()
    };
    return this.brandLocations[index];
  }

  async deleteBrandLocation(id: string): Promise<boolean> {
    const index = this.brandLocations.findIndex(bl => bl.id === id);
    if (index === -1) return false;

    this.brandLocations.splice(index, 1);
    return true;
  }

  // Initialize with dev data for testing
  private initDevData() {
    // Add demo data if needed
    const internalOrg = this.createOrganization({
      name: "Rishi",
      type: "internal",
      tier: null,
      isTest: false,
      environment: "development",
      active: true,
    });

    const clientOrg = this.createOrganization({
      name: "Test Client",
      type: "client",
      tier: "tier_2",
      isTest: true,
      environment: "development",
      active: true,
    });

    // Create some users
    this.createUser({
      username: "admin",
      password: "password",  // In a real app, this would be hashed
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "super_admin",
      organizationId: internalOrg.id
    });

    this.createUser({
      username: "client",
      password: "password",  // In a real app, this would be hashed
      email: "client@example.com",
      firstName: "Client",
      lastName: "User",
      role: "client_user",
      organizationId: clientOrg.id
    });

    // Create test brand
    const testBrand = this.createBrand({
      name: "Test Brand",
      description: "A test brand for development",
      clientId: clientOrg.id,
      active: true
    });

    // Create test states
    const california = this.createState({
      name: "California",
      abbreviation: "CA",
      active: true
    });

    const nevada = this.createState({
      name: "Nevada",
      abbreviation: "NV",
      active: true
    });

    // Create test regions
    const bayArea = this.createRegion({
      name: "Bay Area",
      description: "San Francisco Bay Area",
      stateId: california.id,
      zipcodes: ["94101", "94102", "94103", "94104", "94105"],
      active: true
    });

    const laRegion = this.createRegion({
      name: "Los Angeles",
      description: "Greater Los Angeles Area",
      stateId: california.id,
      zipcodes: ["90001", "90002", "90003", "90004", "90005"],
      active: true
    });

    // Link brand to regions
    this.createBrandRegion({
      brandId: testBrand.id,
      regionId: bayArea.id,
      active: true
    });

    // Create kit template
    const basicKitTemplate = this.createKitTemplate({
      name: "Basic Kit",
      description: "Standard kit with basic components",
      brandId: testBrand.id,
      components: JSON.stringify([
        { id: "tablet", name: "Tablet", quantity: 1, consumable: false },
        { id: "flyers", name: "Promotional Flyers", quantity: 100, consumable: true },
        { id: "pens", name: "Branded Pens", quantity: 50, consumable: true }
      ]),
      active: true
    });

    // Create test locations
    const sfLocation = this.createLocation({
      name: "San Francisco Downtown",
      type: "venue",
      address1: "123 Market St",
      city: "San Francisco",
      stateId: california.id,
      zipcode: "94103",
      status: "approved",
      active: true
    });

    // Link brand to location
    this.createBrandLocation({
      brandId: testBrand.id,
      locationId: sfLocation.id,
      active: true
    });
  }
}

// Export a storage instance based on environment
export const storage = process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_STORAGE === 'true'
  ? new MemStorage()
  : new DatabaseStorage();