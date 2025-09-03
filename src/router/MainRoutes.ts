const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'AdminDashboard',
            path: '/admin/dashboard',
            component: () => import('@/views/dashboard/AdminDashboard.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/dashboard/:id',
            name: 'AdminDashboardDetail', // make name unique to avoid conflict
            component: () => import('@/views/dashboard/AdminDashboard.vue'),
            meta: { requiresAuth: true, roles: ['super_admin'] }
        },
        {
            path: '/admin/events',
            name: 'Events', // make name unique to avoid conflict
            component: () => import('@/views/pages/Events.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/events/create',
            name: 'Add Events', // make name unique to avoid conflict
            component: () => import('@/views/pages/CreateEvents.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/attendees',
            name: 'Attendees', // make name unique to avoid conflict
            component: () => import('@/views/pages/Attendees.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/speakers',
            name: 'Speakers', // make name unique to avoid conflict
            component: () => import('@/views/pages/Speakers.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            name: 'SuperAdminDashboard',
            path: '/super-admin/dashboard',
            component: () => import('@/views/dashboard/SuperAdminDashboard.vue'),
            meta: { requiresAuth: true, roles: ['super_admin'] }
        },
        {
            name: 'Reports',
            path: '/super-admin/reports',
            component: () => import('@/views/pages/Reports.vue'),
            meta: { roles: ['admin', 'super_admin'] }
        }
    ]
};

export default MainRoutes;
