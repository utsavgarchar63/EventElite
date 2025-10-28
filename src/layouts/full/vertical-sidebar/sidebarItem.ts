import { IconCreditCard } from '@tabler/icons-vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
    LayoutDashboardIcon,
    DeviceAnalyticsIcon,
    CalendarIcon,
    TicketIcon,
    UserIcon,
    HeartHandshakeIcon,
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

// Base menus
const superAdminMenu: Menu[] = [
    {
        title: 'Overview',
        icon: LayoutDashboardIcon,
        to: '/super-admin/dashboard',
    },
    {
        title: 'Reports',
        icon: DeviceAnalyticsIcon,
        to: '/super-admin/reports',
    },
    {
        title: 'Supports',
        icon: HeartHandshakeIcon,
        to: '/super-admin/supports',
    },
    {
        title: 'Subscriptions',
        icon: IconCreditCard,
        to: '/super-admin/subscriptions',
    },
];

const adminMenu: Menu[] = [
    {
        title: 'Overview',
        icon: LayoutDashboardIcon,
        to: '/admin/dashboard',
    },
    {
        title: 'Events',
        icon: CalendarIcon,
        to: '/admin/events',
    },
    {
        title: 'Attendee',
        icon: UserIcon,
        to: ['/admin/attendees', '/admin/attendee'],
    },
    {
        title: 'Speakers',
        icon: UserIcon,
        to: ['/admin/speakers', '/admin/speaker'],
    },
    {
        title: 'Sponsors',
        icon: UserIcon,
        to: ['/admin/sponsors', '/admin/sponsor'],
    },
    {
        title: 'Vendors',
        icon: UserIcon,
        to: ['/admin/vendors', '/admin/vendor'],
    },
    {
        title: 'Coordinator',
        icon: UserIcon,
        to: ['/admin/coordinator', '/admin/coordinator'],
    }
];

const userMenu: Menu[] = [
    {
        title: 'My Events',
        icon: CalendarIcon,
        to: '/user/events',
    },
    {
        title: 'My Tickets',
        icon: TicketIcon,
        to: '/user/tickets',
    }
];



export function useSidebarMenu() {
    const route = useRoute();

    const menus = computed<Menu[]>(() => {
        if (route.path.startsWith('/super-admin')) {
            return [...superAdminMenu];
        } else if (route.path.startsWith('/admin')) {
            return [...adminMenu];
        } else if (route.path.startsWith('/user')) {
            return [...userMenu];
        }
        return [];
    });

    // Active menu logic
    function isActive(item: Menu) {
        if (!item.to) return false;
        const paths = Array.isArray(item.to) ? item.to : [item.to];
        return paths.some((p) => route.path.startsWith(p));
    }

    return { menus, isActive };
}
