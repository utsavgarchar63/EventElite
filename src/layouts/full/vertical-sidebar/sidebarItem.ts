import { computed } from 'vue';
import { useRoute } from 'vue-router'; // Import route
import {
    LayoutDashboardIcon,
    DeviceAnalyticsIcon,
    CalendarIcon,
    TicketIcon,
    UserIcon,
} from "vue-tabler-icons";

export interface Menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string | string[];
    chip?: string;
    chipColor?: string;
    chipBgColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: Menu[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
    external?: boolean;
}

// Sidebar menus
const superAdminMenu: Menu[] = [
    {
        title: 'Overview',
        icon: LayoutDashboardIcon,
        to: '/super-admin/dashboard',
        external: false
    },
    {
        title: 'Reports',
        icon: DeviceAnalyticsIcon,
        to: '/super-admin/reports',
        external: false
    }
];

const userMenu: Menu[] = [
    {
        title: 'My Events',
        icon: CalendarIcon,
        to: '/user/events',
        external: false
    },
    {
        title: 'My Tickets',
        icon: TicketIcon,
        to: '/user/tickets',
        external: false
    }
];

const adminMenu: Menu[] = [
    {
        title: 'Overview',
        icon: LayoutDashboardIcon,
        to: '/admin/dashboard',
        external: false
    },
    {
        title: 'Events',
        icon: CalendarIcon,
        to: '/admin/events',
        external: false
    },
    {
        title: 'Attendee',
        icon: UserIcon,
        to: ['/admin/attendees', '/admin/attendee'],
        external: false
    },
    {
        title: 'Speakers',
        icon: UserIcon,
        to: ['/admin/speakers', '/admin/speaker'],
        external: false
    },
    {
        title: 'Sponsors',
        icon: UserIcon,
        to: ['/admin/sponsors', '/admin/sponsor'],
        external: false
    },
    {
        title: 'Vendors',
        icon: UserIcon,
        to: ['/admin/vendors', '/admin/vendor'],
        external: false
    }
];


export function useSidebarMenu() {
    const route = useRoute();

    const menus = computed<Menu[]>(() => {
        if (route.path.startsWith('/super-admin')) {
            return superAdminMenu;
        } else if (route.path.startsWith('/admin')) {
            return adminMenu;
        } else if (route.path.startsWith('/user')) {
            return userMenu;
        }
        return [];
    });

    // helper to mark active item
    function isActive(item: Menu) {
        if (!item.to) return false;
        const paths = Array.isArray(item.to) ? item.to : [item.to];
        return paths.some((p) => route.path.startsWith(p));
    }

    return { menus, isActive };
}
