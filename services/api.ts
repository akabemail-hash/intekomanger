import { supabase } from './supabaseClient';
import { User, Role, Sale, Product, Purchase, Package, Tenant } from '../types';
import { MOCK_SALES, MOCK_PRODUCTS, MOCK_PURCHASES, DEFAULT_ROLES } from '../constants';

// For demo purposes, we are mixing Mock Data (for reports) with Real Supabase Data (for Users/Tenants/Packages)
// In a full production app, Sales/Products would also be in Supabase tables.

const parseResponse = (result: any) => {
    // Handle { ok: true, count: 1, data: [...] } structure
    if (result && result.data && Array.isArray(result.data)) {
        return result.data;
    }
    // Handle direct array [...]
    if (Array.isArray(result)) {
        return result;
    }
    return [];
};

// Helper to ensure YYYY-MM-DD format (strips time if present)
const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Take the date part if it contains 'T' (ISO format)
    return dateStr.split('T')[0];
};

export const api = {
    auth: {
        login: async (voen: string, username: string, password?: string): Promise<User | null> => {
            // Real DB check
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    tenants (
                        status,
                        customer_type
                    )
                `)
                .eq('voen', voen)
                .eq('username', username)
                .eq('password', password) // Note: IN PROD, USE HASHING or SUPABASE AUTH
                .single();

            if (error || !data) return null;
            
            // Check Tenant Status if tenant_id exists
            let customerType: 'normal' | 'clinic' = 'normal';

            if (data.tenant_id) {
                // Supabase joins: "tenants" property could be an object (if one-to-one/many-to-one) or array
                const tenantData: any = data.tenants;
                
                // Usually returns an object for belongs_to relationship, or array for has_many.
                // Since users.tenant_id references tenants.id, it should return an object if defined as a single relation
                // But safer to handle both.
                const status = Array.isArray(tenantData) 
                    ? tenantData[0]?.status 
                    : tenantData?.status;
                
                const cType = Array.isArray(tenantData)
                    ? tenantData[0]?.customer_type
                    : tenantData?.customer_type;
                
                if (cType) customerType = cType;

                // If status is specifically inactive, throw distinct error
                if (status === 'inactive') {
                    throw new Error("account_inactive");
                }
            }

            return {
                id: data.id,
                username: data.username,
                voen: data.voen,
                role: data.role,
                tenant_id: data.tenant_id,
                customer_type: customerType
            };
        }
    },
    
    // Super Admin Services
    packages: {
        list: async (): Promise<Package[]> => {
            const { data } = await supabase.from('packages').select('*').order('created_at');
            return data || [];
        },
        create: async (pkg: Omit<Package, 'id'>) => {
            const { data, error } = await supabase.from('packages').insert(pkg).select().single();
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: Partial<Package>) => {
            const { data, error } = await supabase.from('packages').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            await supabase.from('packages').delete().eq('id', id);
        }
    },

    tenants: {
        list: async (): Promise<Tenant[]> => {
            const { data } = await supabase.from('tenants').select('*, package:packages(*)').order('created_at');
            return data || [];
        },
        create: async (tenant: { voen: string; name: string; package_id: string; customer_type?: string }, adminUser: { username: string; password: string }) => {
            // 1. Create Tenant
            const { data: newTenant, error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    voen: tenant.voen,
                    name: tenant.name,
                    package_id: tenant.package_id,
                    customer_type: tenant.customer_type || 'normal',
                    status: 'active'
                })
                .select()
                .single();
            
            if (tenantError) throw tenantError;

            // 2. Create Initial Admin User for Tenant
            const { error: userError } = await supabase.from('users').insert({
                username: adminUser.username,
                password: adminUser.password,
                role: 'Administrator',
                tenant_id: newTenant.id,
                voen: newTenant.voen
            });

            if (userError) throw userError;
            return newTenant;
        },
        updatePackage: async (tenantId: string, packageId: string) => {
            await supabase.from('tenants').update({ package_id: packageId }).eq('id', tenantId);
        },
        update: async (id: string, updates: Partial<Tenant>) => {
            const { data, error } = await supabase.from('tenants').update(updates).eq('id', id).select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Update failed - row not found or permission denied");
        },
        updateStatus: async (id: string, status: 'active' | 'inactive') => {
            const { data, error } = await supabase.from('tenants').update({ status }).eq('id', id).select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Status update failed - row not found or permission denied");
        }
    },

    // Tenant Services
    users: {
        list: async (tenantId?: string): Promise<User[]> => {
            if (!tenantId) return [];
            const { data } = await supabase.from('users').select('*').eq('tenant_id', tenantId);
            return data || [];
        },
        create: async (user: User): Promise<User> => {
            // 1. Check Package Limits
            const { data: tenant } = await supabase
                .from('tenants')
                .select('package:packages(max_users)')
                .eq('id', user.tenant_id)
                .single();
            
            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', user.tenant_id);

            // Cast to any to handle potential array return from Supabase join
            const pkg: any = tenant?.package;
            const limit = (Array.isArray(pkg) ? pkg[0]?.max_users : pkg?.max_users) || 0;
            
            if ((count || 0) >= limit) {
                throw new Error(`Package limit reached. Max users: ${limit}`);
            }

            // 2. Create User
            const { data, error } = await supabase.from('users').insert({
                username: user.username,
                password: user.password, // In real app, hash this
                role: user.role,
                tenant_id: user.tenant_id,
                voen: user.voen
            }).select().single();

            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: Partial<User>) => {
             const { error } = await supabase.from('users').update(updates).eq('id', id);
             if (error) throw error;
        }
    },
    roles: {
        list: async (): Promise<Role[]> => {
            // For this demo, roles are static. In a complex app, these could be in DB too.
            return DEFAULT_ROLES;
        },
        create: async (role: Role): Promise<Role> => {
             // Mock persistence
             return role;
        },
        update: async (role: Role): Promise<Role> => {
             // Mock persistence
             return role;
        }
    },
    reports: {
        // Fetch Real Sales Data from External API (Direct Connection)
        fetchExternalSales: async (voen: string, startDate: string, endDate: string): Promise<any[]> => {
            const targetUrl = '/view/payment';
            // Ensure YYYY-MM-DD
            const payload = { 
                voen, 
                StartDate: formatDate(startDate), 
                EndDate: formatDate(endDate) 
            };
            
            try {
                console.log(`[API] Fetching directly: ${targetUrl}`, payload);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                return parseResponse(result);

            } catch (error) {
                console.error("Direct fetch failed:", error);
                // Return empty array to prevent UI crash
                return [];
            }
        },

        // Fetch Sales Details for Product Analysis
        fetchSalesDetails: async (voen: string, startDate: string, endDate: string): Promise<any[]> => {
            const targetUrl = '/view/salesdetail';
            const cleanStart = formatDate(startDate);
            const cleanEnd = formatDate(endDate);

            // MSSQL/Backends often require strict YYYY-MM-DD
            // Including PascalCase variants to robustly handle API expectations
            const payload = { 
                voen, 
               
                startDate: cleanStart,
                endDate: cleanEnd
            };
            
            try {
                console.log(`[API] Fetching Sales Details: ${targetUrl}`, payload);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                return parseResponse(result);

            } catch (error) {
                console.error("Sales details fetch failed:", error);
                return [];
            }
        },

        // Fetch Purchase Details
        fetchPurchaseDetails: async (voen: string, startDate: string, endDate: string): Promise<any[]> => {
            const targetUrl = '/view/productpurchase';
            const cleanStart = formatDate(startDate);
            const cleanEnd = formatDate(endDate);
            
            const payload = { 
                voen, 
               
                startDate: cleanStart,
                endDate: cleanEnd
            };
            
            try {
                console.log(`[API] Fetching Purchase Details: ${targetUrl}`, payload);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                return parseResponse(result);

            } catch (error) {
                console.error("Purchase details fetch failed:", error);
                return [];
            }
        },

        // Fetch Profit Details
        fetchProfit: async (voen: string, startDate: string, endDate: string): Promise<any[]> => {
            const targetUrl = '/view/profit';
            const cleanStart = formatDate(startDate);
            const cleanEnd = formatDate(endDate);
            
            const payload = { 
                voen, 
                 
                startDate: cleanStart,
                endDate: cleanEnd
            };
            
            try {
                console.log(`[API] Fetching Profit: ${targetUrl}`, payload);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                return parseResponse(result);

            } catch (error) {
                console.error("Profit fetch failed:", error);
                return [];
            }
        },

        // Fetch Stock Details
        fetchStock: async (voen: string): Promise<any[]> => {
            const targetUrl = '/view/warehousestock';
            const payload = { voen };
            
            try {
                console.log(`[API] Fetching Stock: ${targetUrl}`, payload);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                return parseResponse(result);

            } catch (error) {
                console.error("Stock fetch failed:", error);
                return [];
            }
        },

        // Fetch Payment Details
        fetchPayments: async (voen: string, startDate: string, endDate: string): Promise<any[]> => {
            const targetUrl = '/view/payment';
            const cleanStart = formatDate(startDate);
            const cleanEnd = formatDate(endDate);
            
            const payload = { 
                voen, 
                
                startDate: cleanStart,
                endDate: cleanEnd
            };
            
            try {
                console.log(`[API] Fetching Payments: ${targetUrl}`, payload);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                return parseResponse(result);

            } catch (error) {
                console.error("Payment fetch failed:", error);
                return [];
            }
        },

        // Fetch Sale Refund Details
        fetchSaleRefunds: async (voen: string, startDate: string, endDate: string): Promise<any[]> => {
            const targetUrl = '/view/salerefund';
            const cleanStart = formatDate(startDate);
            const cleanEnd = formatDate(endDate);
            
            const payload = { 
                voen, 
                
                startDate: cleanStart,
                endDate: cleanEnd
            };
            
            try {
                console.log(`[API] Fetching Sale Refunds: ${targetUrl}`, payload);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                return parseResponse(result);

            } catch (error) {
                console.error("Sale refund fetch failed:", error);
                return [];
            }
        },
        
        // Mock data fallbacks for other reports if needed
        getSales: async (voen: string): Promise<Sale[]> => {
             return MOCK_SALES;
        },
        getPurchases: async (voen: string): Promise<Purchase[]> => {
             return MOCK_PURCHASES;
        },
        getStock: async (voen: string): Promise<Product[]> => {
             return MOCK_PRODUCTS;
        }
    },
    notifications: {
        list: async (userId: string, role: string): Promise<Notification[]> => {
            return [];
        }
    }
};
