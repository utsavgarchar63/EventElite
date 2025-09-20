import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/store/authStore';


declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean;
        roles?: string[]; // This tells TS that roles is an array of strings
    }
}

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        MainRoutes,
        AuthRoutes,
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/pages/Error404.vue')
        }
    ]
});

    
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = !!authStore.token;
    const userRole = authStore.role || localStorage.getItem('role');

    // Remove organization_id when leaving admin dashboard, only for admin
    if (userRole === 'admin' && from.path.startsWith('/admin/dashboard') && !to.path.startsWith('/admin/dashboard')) {
        localStorage.removeItem('organization_id');
    }

    // If NOT authenticated
    if (!isAuthenticated) {
        if (to.path === '/' || to.meta.requiresAuth) {
            return next('/auth/login');
        }
        return next();
    }

    // If authenticated
    if (isAuthenticated) {
        // Redirect root `/` or login to role-based dashboard
        if (to.path === '/' || to.path === '/auth/login') {
            if (userRole === 'super_admin') {
                return next('/super-admin/dashboard');
            } else if (userRole === 'admin') {
                return next('/admin/dashboard');
            } else {
                return next('/');
            }
        }

        // Role-based restrictions
        if (Array.isArray(to.meta.roles)) {
            // If user role is NOT in allowed roles
            if (!to.meta.roles.includes(userRole!) && userRole !== 'super_admin') {
                if (userRole === 'admin') {
                    return next('/admin/dashboard');
                } else {
                    return next('/auth/login');
                }
            }
        }

        // Special case: super_admin accessing /admin/dashboard
        if (userRole === 'super_admin' && to.path === '/admin/dashboard') {
            return next('/super-admin/dashboard'); // redirect to super admin dashboard
        }

        // Super admin can access /admin/dashboard/:id but NOT /admin/dashboard
        if (userRole === 'super_admin' && to.path.startsWith('/admin/dashboard') && !/^\/admin\/dashboard\/\d+/.test(to.path)) {
            return next('/super-admin/dashboard');
        }
    }

    return next();
});
