// composables/useSidebarVisibility.ts
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

export function useSidebarVisibility() {
  const route = useRoute();

  // reactive role from localStorage
  const role = ref(localStorage.getItem('role'));

  // update role when localStorage changes
  window.addEventListener('storage', () => {
    role.value = localStorage.getItem('role');
  });

  // computed boolean for sidebar visibility
  const showSidebar = computed(() => {
    const restrictedRoutes = ['/user/events/detail', '/user/book-event'];
    const isRestrictedRoute = restrictedRoutes.includes(route.path);

    // ✅ On restricted routes → only show if role is 'user'
    if (isRestrictedRoute) {
      return role.value === 'user';
    }

    // ✅ On all other routes → always show
    return true;
  });

  return { showSidebar };
}
