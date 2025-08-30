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
    to?: string;
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
        title: 'Tickets',
        icon: TicketIcon,
        to: '/admin/tickets',
        external: false
    },
    {
        title: 'Attendee',
        icon: UserIcon,
        to: '/admin/attendees',
        external: false
    },
    {
        title: 'Speakers',
        icon: UserIcon,
        to: '/admin/speakers',
        external: false
    },
    {
        title: 'Sponsors',
        icon: UserIcon,
        to: '/admin/sponsors',
        external: false
    },
    {
        title: 'Vendors',
        icon: UserIcon,
        to: '/admin/vendors',
        external: false
    }
];

// Dynamic Sidebar Menu based on URL
export function useSidebarMenu() {
    const route = useRoute();

    return computed<Menu[]>(() => {
        if (route.path.startsWith('/super-admin')) {
            return superAdminMenu;
        } else if (route.path.startsWith('/admin')) {
            return adminMenu;
        }
        return [];
    });
}
