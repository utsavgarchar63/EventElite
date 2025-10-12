<template>
  <v-container fluid>
    <!-- Loader -->
    <div v-if="loading" class="d-flex justify-center" style="height: 200px">
      <v-progress-circular indeterminate color="primary" size="48" class="my-auto"></v-progress-circular>
    </div>

    <!-- Event Details -->
    <div v-else-if="event">
      <div style="position: relative;">
        <!-- Event Banner -->
        <v-img :src="bannerImage" height="300" class="rounded-lg mb-4" cover>
          <template #error>
            <v-img :src="bannerImage || defaultEventImg" @error="onBannerImageError" height="300"
              class="rounded-lg mb-4" cover />
          </template>
        </v-img>

        <!-- Dark Gradient Overlay -->
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0.5rem;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%);
          "></div>

        <!-- Category Chip -->
        <v-chip color="white" size="small" class="text-body-2 font-weight-bold" style="
            position: absolute;
            background-color: rgba(255, 255, 255, 0.3);
            top: 15px;
            left: 15px;
            color: #fff;
          " label>
          {{ event.event_type || "Event" }}
        </v-chip>

        <!-- Event Info (Bottom Overlay) -->
        <div style="
            position: absolute;
            bottom: 15px;
            left: 20px;
            color: white;
          ">
          <h1 class="text-h1 font-weight-bold mb-2">
            {{ event.event_name }}
          </h1>

          <div class="d-flex align-center flex-wrap" style="gap: 15px; font-size: 14px;">
            <div class="d-flex align-center">
              <v-icon size="18" class="me-1" color="white">mdi-calendar-blank-outline</v-icon>
              <span>
                {{ formatDate(event.details?.start_datetime) }} -
                {{ formatDate(event.details?.end_datetime) }}
              </span>
            </div>

            <div class="d-flex align-center">
              <v-icon size="18" class="me-1" color="white">mdi-map-marker-outline</v-icon>
              <span>{{ event.details?.venue_address || "N/A" }}</span>
            </div>
          </div>

          <!-- Add to Calendar Button -->
          <v-btn size="small" color="white" class="mt-3" style="color: #0a0a0a; font-weight: 600;"
            prepend-icon="mdi-calendar-plus-outline">
            Add to Calendar
          </v-btn>
        </div>
      </div>

      <!-- About Section -->
      <div class="border rounded-lg pa-5 mb-5" style="background: white;">
        <h3 class="text-h4 mb-4">About This Event</h3>
        <p class="pt-2" style="line-height: 1.7;">
          {{ event.description || "N/A" }}
        </p>

      </div>

      <!-- What's Included & Schedule Highlights -->
      <div class="border rounded-lg pa-5" style="background: white;">
        <h3 class="text-h4 mb-4">Venue Information</h3>
        <v-row>
          <v-col cols="12" md="6">
            <h4 class="font-weight-bold mb-2">{{ event.details?.venue || "Venue Name" }}</h4>
            <p class="text-body-2 mb-4">
              {{ event.details?.venue_address || "Address not available" }}
            </p>

            <div class="d-flex align-center flex-wrap mb-4" style="gap: 20px;">
              <div class="d-flex align-start">
                <v-icon style="color: grey;" class="me-2">mdi-phone</v-icon>
                <div>
                  <strong>(555) 123-4567</strong><br />
                  <small style="color: grey;">Phone</small>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-icon style="color: grey;" class="me-2">mdi-email-outline</v-icon>
                <div>
                  <strong>info@venue.com</strong><br />
                  <small style="color: grey;">Email</small>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-icon style="color: grey;" class="me-2">mdi-web</v-icon>
                <div>
                  <strong>www.venue.com</strong><br />
                  <small style="color: grey;">Website</small>
                </div>
              </div>
            </div>
            <v-btn class="mt-4 " color="grey-lighten-4" variant="outlined" prepend-icon="mdi-map-marker-outline"
          :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.details?.venue_address || '')}`"
          target="_blank">
          View in Google Maps
        </v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <!-- <div class="d-flex justify-center align-center rounded-lg"
              style="height: 200px; background-color: #f4f5f7;">
              <div class="text-center">
                <v-icon style="color: grey;" size="36">mdi-map-outline</v-icon>
                <p class="mt-2 text-subtitle-2 font-weight-bold" style="color: grey;">Interactive map coming soon</p>
              </div>
            </div> -->

          
          </v-col>
        </v-row>

      </div>
      <!-- Speakers Section -->
      <div v-if="event.speakers?.length" class="border rounded-lg pa-5 mt-5" style="background: white;">
        <!-- Header with Toggle -->
        <div class="d-flex align-center justify-space-between" @click="showSpeakers = !showSpeakers"
          style="cursor: pointer;">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-account-group-outline</v-icon>
            <h3 class="text-h4 font-weight-bold mb-0">Speakers ({{ event.speakers.length }})</h3>
          </div>
          <v-icon :class="{ 'rotate-180': showSpeakers }" transition="rotate-transition">mdi-chevron-up</v-icon>
        </div>

        <v-expand-transition>
          <div v-show="showSpeakers" class="mt-4">
            <v-row>
              <v-col v-for="(speaker, index) in event.speakers" :key="index" cols="12" md="6" class="mb-4">
                <v-card class="pa-4" elevation="0" style="border: 1px solid #e0e0e0; border-radius: 12px;">
                  <v-row no-gutters align="start">
                    <!-- Profile Image -->
                    <v-col cols="3" class="d-flex ">
                      <v-avatar size="70">
                        <v-img :src="speaker.photo || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'"
                          alt="Speaker Image" @error="onImageError"></v-img>
                      </v-avatar>
                    </v-col>

                    <!-- Speaker Details -->
                    <v-col cols="9">
                      <div>
                        <h4 class="text-h6 font-weight-bold mb-1">{{ speaker.name }}</h4>
                        <p class="text-body-2 mb-0" style="color: grey;">
                          {{ speaker.designation || 'Speaker' }}
                        </p>
                        <p class="text-body-2 mb-2" style="color: grey;">
                          {{ speaker.company || 'N/A' }}
                        </p>

                        <a href="#" class="text-body-2 font-weight-medium"
                          style="color: #1976d2; text-decoration: none;">
                          {{ speaker.topic || 'Session Title Coming Soon' }}
                        </a>

                        <div class="d-flex align-center mt-2" style="gap: 8px; font-size: 14px; color: grey;">
                          <v-icon size="16">mdi-clock-outline</v-icon>
                          <span>
                            {{ formatTime(speaker.pivot?.start_datetime) }} -
                            {{ formatTime(speaker.pivot?.end_datetime) }}
                          </span>
                          <v-icon size="16">mdi-map-marker-outline</v-icon>
                          <span>{{ speaker.pivot?.location || 'Main Stage' }}</span>
                        </div>
                      </div>

                      <!-- Social & Icons -->
                      <!-- <div class="d-flex align-center mt-3" style="gap: 12px;">
                        <v-btn icon size="small" variant="outlined" style="border-color: #ccc; color: #000;">
                          <v-icon size="18">mdi-linkedin</v-icon>
                        </v-btn>

                        <v-btn icon size="small" variant="outlined" style="border-color: #ccc; color: #000;">
                          <v-icon size="18">mdi-twitter</v-icon>
                        </v-btn>

                        <v-spacer></v-spacer>

                        <v-btn icon size="small" variant="text" style="color: #000;">
                          <v-icon>mdi-heart-outline</v-icon>
                        </v-btn>

                        <v-btn icon size="small" variant="text" style="color: #000;">
                          <v-icon>mdi-bell-outline</v-icon>
                        </v-btn>
                      </div> -->

                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>


      </div>

      <!-- Sponsors Section -->
      <div v-if="event.sponsors?.length" class="border rounded-lg pa-5 mt-5" style="background: white;">
        <!-- Header -->
        <div class="d-flex align-center justify-space-between" @click="showSponsors = !showSponsors"
          style="cursor: pointer;">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-domain</v-icon>
            <h3 class="text-h4 font-weight-bold mb-0">
              Sponsors ({{ event.sponsors.length }})
            </h3>
          </div>
          <v-icon :class="{ 'rotate-180': showSponsors }" transition="rotate-transition">mdi-chevron-up</v-icon>
        </div>

        <v-expand-transition>
          <div v-show="showSponsors" class="mt-4">

            <!-- Premium Sponsors -->
            <div v-if="groupedSponsors.premium.length" class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon color="amber" class="me-2" style="color: #f2bd26;">mdi-crown-outline</v-icon>
                <h4 class="text-h5 font-weight-bold mb-0">Premium Sponsors</h4>
              </div>
              <v-row>
                <v-col v-for="(sponsor, index) in groupedSponsors.premium" :key="'premium-' + index" cols="12" md="6"
                  lg="4">
                  <v-card elevation="0" class="pa-5 text-center"
                    style="background-color: #fffbea; border: 1px solid #ffecb3; border-radius: 12px;">
                    <v-avatar size="90" class="mb-3">
                      <v-img :src="`https://eventelite-eanm.onrender.com/storage/${sponsor.logo}`"
                        :alt="sponsor.business_name" height="90">
                        <template #error>
                          <v-img :src="picture" alt="Fallback image" height="90" />
                        </template>
                      </v-img>

                    </v-avatar>
                    <h4 class="text-h6 font-weight-bold mb-1">
                      {{ sponsor.business_name }}
                    </h4>
                    <p class="text-body-2 mb-2" style="color: grey;">
                      {{ sponsor.tagline || sponsor.pivot?.tier || 'Sponsor' }}
                    </p>
                    <div class="d-flex align-center justify-center mb-4 gap-2">
                      <v-chip size="small" color="transparent" style="color: oklch(.554 .135 66.442);">
                        {{ sponsor.pivot?.tier || 'Premium Sponsor' }}
                      </v-chip>

                      <v-icon size="20" color="rgb(242, 189, 38)">mdi-crown-outline</v-icon>
                    </div>

                    <v-btn color="grey-darken-2" variant="outlined" size="small" prepend-icon="mdi-open-in-new"
                      :href="sponsor.link" target="_blank" block>
                      Visit Website
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Gold Sponsors -->
            <div v-if="groupedSponsors.gold.length" class="mb-6">
              <div class="d-flex align-center mb-3">
                <!-- <v-icon color="deep-orange" class="me-2">mdi-medal-outline</v-icon> -->
                <v-icon color="rgb(242, 189, 38)" class="me-2">mdi-medal-outline</v-icon>

                <h4 class="text-h5 font-weight-bold mb-0">Gold Sponsors</h4>
              </div>
              <v-row>
                <v-col v-for="(sponsor, index) in groupedSponsors.gold" :key="'gold-' + index" cols="12" md="6" lg="4">
                  <v-card elevation="0" class="pa-5 text-center"
                    style="background-color: #fffbea; border: 1.5px solid #fff085; border-radius: 12px !important;">
                    <v-avatar size="90" class="mb-3">
                      <v-img
                        :src="sponsor.logo ? `https://eventelite-eanm.onrender.com/storage/${sponsor.logo}` : picture"
                        @error="onImageError" height="90">
                        <template #error>
                          <v-img :src="picture" height="90" />
                        </template>
                      </v-img>

                    </v-avatar>
                    <h4 class="text-h6 font-weight-bold mb-1">
                      {{ sponsor.business_name }}
                    </h4>
                    <p class="text-body-2 mb-2" style="color: grey; text-transform: capitalize;">
                      {{ `${sponsor.pivot?.tier} Sponsor` || 'Gold Sponsor' }}
                    </p>
                    <v-btn color="black" variant="outlined" size="small" prepend-icon="mdi-open-in-new"
                      :href="sponsor.link" target="_blank" block>
                      Visit Website
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Other Sponsors -->
            <div v-if="groupedSponsors.others.length">
              <div class="d-flex align-center mb-3">
                <v-icon color="grey" class="me-2">mdi-star-outline</v-icon>
                <h4 class="text-h5 font-weight-bold mb-0">Sponsors</h4>
              </div>
              <v-row>
                <v-col v-for="(sponsor, index) in groupedSponsors.others" :key="'other-' + index" cols="12" md="6"
                  lg="3">
                  <v-card elevation="0" class="pa-4 text-center"
                    style="border: 1px solid #e0e0e0; border-radius: 12px;">
                    <v-avatar size="70" class="mb-3">
                      <v-img :src="`https://eventelite-eanm.onrender.com/storage/${sponsor.logo}`"
                        :alt="sponsor.business_name">
                        <template #error>
                          <v-img :src="picture" alt="Fallback image" />
                        </template>
                      </v-img>

                    </v-avatar>
                    <h4 class="text-h6 font-weight-bold mb-1">
                      {{ sponsor.business_name }}
                    </h4>
                    <v-btn color="grey-darken-2" variant="outlined" size="small" class="mt-4"
                      prepend-icon="mdi-open-in-new" :href="sponsor.link" target="_blank" block>
                      Visit Website
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-expand-transition>
      </div>

      <!-- Vendors Section -->
      <div v-if="event.vendors?.length" class="border rounded-lg pa-5 mt-5" style="background: white;">
        <!-- Header with Toggle -->
        <div class="d-flex align-center justify-space-between" @click="showVendors = !showVendors"
          style="cursor: pointer;">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-store-outline</v-icon>
            <h3 class="text-h4 font-weight-bold mb-0">Vendors ({{ event.vendors.length }})</h3>
          </div>
          <v-icon :class="{ 'rotate-180': showVendors }" transition="rotate-transition">mdi-chevron-up</v-icon>
        </div>

        <v-expand-transition>
          <div v-show="showVendors" class="mt-4">
            <!-- Search bar -->
            <!-- <v-text-field v-model="vendorSearch" variant="outlined" prepend-inner-icon="mdi-magnify"
              placeholder="Search vendors..." class="mb-5" hide-details></v-text-field> -->

            <v-row>
              <v-col v-for="(vendor, index) in filteredVendors" :key="index" cols="12" md="6" lg="4" class="mb-4">
                <v-card class="pa-4" elevation="0" style="border: 1px solid #e0e0e0; border-radius: 12px;">
                  <div class="d-flex align-start">
                    <!-- Vendor Image -->
                    <v-avatar size="60" class="me-3">
                      <v-img
                        :src="vendor.logo ? `https://eventelite-eanm.onrender.com/storage/${vendor.logo}` : picture"
                        :alt="vendor.name" height="60" width="60">
                        <template #error>
                          <v-img :src="picture" height="60" />
                        </template>
                      </v-img>
                    </v-avatar>

                    <!-- Vendor Info -->
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ vendor.name }}</h4>
                      <p class="text-body-2 mb-0" style="color: grey;">
                        {{ vendor.category || vendor.pivot?.location || "Vendor" }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-3 text-body-2" style="color: grey;">
                    <div class="d-flex align-center mb-1">
                      <v-icon size="16" class="me-1">mdi-map-marker-outline</v-icon>
                      Booth {{ vendor.booth || "N/A" }}
                    </div>
                    <div class="d-flex align-center mb-1">
                      <v-icon size="16" class="me-1">mdi-clock-outline</v-icon>
                      {{ vendor.time || "9:00 AM - 5:00 PM" }}
                    </div>

                  </div>

                  <p class="mt-2 text-body-2" style="color: grey;">
                    {{ vendor.description || "No description available." }}
                  </p>

                  <div class="d-flex justify-space-between mt-3">
                    <v-btn size="small" color="grey-darken-2" variant="outlined" prepend-icon="mdi-map-marker-outline">
                      Find
                    </v-btn>
                    <!-- <v-btn size="small" color="grey-darken-2" variant="outlined" prepend-icon="mdi-phone">
                      Call
                    </v-btn> -->
                    <v-btn size="small" color="grey-darken-2" variant="outlined" prepend-icon="mdi-open-in-new"
                      :href="vendor.business_link" target="_blank">
                      Visit Website
                    </v-btn>

                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </div>



    </div>

    <!-- No Event Found -->
    <div v-else class="text-center mt-10">
      <v-icon size="48" color="grey">mdi-alert-circle-outline</v-icon>
      <p class="text-subtitle-1 mt-3">No event details found.</p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import CryptoJS from "crypto-js";
import api from "@/plugins/axios";
import defaultEventImg from "@/assets/images/events/banner.webp";
import picture from "@/assets/images/common/picture.png"
const route = useRoute();
const showSpeakers = ref(true);
const event = ref<any>(null);
const showSponsors = ref(true);
const loading = ref<boolean>(true);
const bannerImage = ref<string>(defaultEventImg);
const showVendors = ref(true);
const vendorSearch = ref("");



// Static "What's Included"
const whatsIncluded = ref([
  "Full conference access",
  "Networking sessions",
  "Welcome reception",
  "Conference materials",
  "Lunch and refreshments",
  "Certificate of attendance",
]);

// Static "Schedule Highlights"
const scheduleHighlights = ref([
  { time: "9:00 AM", activity: "Registration & Welcome Coffee" },
  { time: "10:00 AM", activity: "Keynote: The Future of Technology" },
  { time: "11:30 AM", activity: "Panel: AI in Business" },
  { time: "12:30 PM", activity: "Networking Lunch" },
  { time: "2:00 PM", activity: "Breakout Sessions" },
  { time: "4:00 PM", activity: "Innovation Showcase" },
  { time: "5:30 PM", activity: "Closing Reception" },
]);

// Helper: Format date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const groupedSponsors = computed(() => {
  const sponsors = (event.value?.sponsors || []) as any[];
  return {
    premium: sponsors.filter((s: any) => ['Premium', 'Platinum'].includes(s.pivot?.tier)),
    gold: sponsors.filter((s: any) => s.pivot?.tier === 'Gold'),
    others: sponsors.filter((s: any) => !['Premium', 'Platinum', 'Gold'].includes(s.pivot?.tier)),
  };
});


const formatTime = (datetime?: string) => {
  if (!datetime) return "N/A";
  const date = new Date(datetime);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const filteredVendors = computed(() => {
  const vendors = event.value?.vendors || [];
  if (!vendorSearch.value) return vendors;

  const searchTerm = vendorSearch.value.toLowerCase();
  return vendors.filter((v: any) =>
  (v.contact_name?.toLowerCase().includes(searchTerm) ||
    v.business_name?.toLowerCase().includes(searchTerm))
  );
});



// Common image error handler for all v-img
const getImageUrl = (logo?: string) => {
  if (!logo) return picture;
  return `https://eventelite-eanm.onrender.com/storage/${logo}`;
};

const onImageError = (value?: string) => {
  bannerImage.value = defaultEventImg; // or picture for sponsor images
};


// Handle image load error
const onBannerImageError = () => {
  bannerImage.value = defaultEventImg;
};

onMounted(async () => {
  const encryptedId = route.query.id as string;
  if (encryptedId) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedId,
        import.meta.env.VITE_SECRET_KEY
      );
      const id = parseInt(bytes.toString(CryptoJS.enc.Utf8));

      // Fetch event details from API
      const res = await api.get(`/event-detail/${id}`);

      if (res.data?.status && res.data?.data) {
        event.value = res.data.data;
        console.log(res.data.data, "res.data.data");
        // Use sponsor logo if available, otherwise default banner
        if (event.value.sponsors?.length) {
          bannerImage.value = `https://eventelite-eanm.onrender.com/storage/${event.value.sponsors[0].logo}`;
        }
      } else {
        event.value = null;
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      event.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});



</script>

<style scoped>
.v-img {
  border-radius: 12px;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.v-icon {
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
</style>
