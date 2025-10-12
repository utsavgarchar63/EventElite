const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'UserDashboard',
            path: '/user/events',
            component: () => import('@/views/dashboard/EventsDashboard.vue'),
            meta: { requiresAuth: true, roles: ['user'] }
        },
        {
            name: 'EventDetail',
            path: '/user/events/detail',
            component: () => import('@/views/pages/UserEventDetail.vue'),
            meta: { requiresAuth: true, roles: ['user'] }
        },
        {
            name: 'MyTickets',
            path: '/user/tickets',
            component: () => import('@/views/pages/UserTickets.vue'),
            meta: { requiresAuth: true, roles: ['user'] }
        },
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
            path: '/admin/event/success',
            name: 'EventSuccess', // make name unique to avoid conflict
            component: () => import('@/views/pages/EventSuccess.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/speakers',
            name: 'Speakers', // make name unique to avoid conflict
            component: () => import('@/views/pages/Speakers.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/speaker/:id',
            name: 'SpeakerDetail', // make name unique to avoid conflict
            component: () => import('@/views/pages/SpeakerDetail.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/sponsor/:id',
            name: 'SponsorDetail', // make name unique to avoid conflict
            component: () => import('@/views/pages/SponsorDetail.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/attendee/:id',
            name: 'AttendeeDetail', // make name unique to avoid conflict
            component: () => import('@/views/pages/AttendeeDetail.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/vendor/:id',
            name: 'VendorDetail', // make name unique to avoid conflict
            component: () => import('@/views/pages/VendorDetail.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/vendors',
            name: 'Vendors', // make name unique to avoid conflict
            component: () => import('@/views/pages/Vendors.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/coordinator/:id',
            name: 'CoordinatorDetail',
            component: () => import('@/views/pages/CoordinatorDetail.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/coordinator',
            name: 'Coordinator', // make name unique to avoid conflict
            component: () => import('@/views/pages/Coordinator.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/admin/sponsors',
            name: 'Sponsors', // make name unique to avoid conflict
            component: () => import('@/views/pages/Sponsors.vue'),
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
