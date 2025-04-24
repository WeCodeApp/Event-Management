<template>
  <!-- Top Navigation Bar -->
  <nav class="navbar navbar-dark bg-dark justify-content-end px-4 fixed-top">
    <span v-if="user" class="navbar-text me-3 text-white">
      Hello, {{ user.name }}
    </span>
    <button v-if="user" @click="logout" class="btn btn-outline-light btn-sm">Logout</button>
  </nav>

  <!-- Main Content -->
  <div class="container mt-5 pt-4 text-center">
    <div v-if="user">
      <h1>Welcome, {{ user.name }}</h1>
      <p>Email: {{ user.email }}</p>
    </div>
    <div v-else>
      <p>You must log in first.</p>
    </div>
  </div>

  <div class="container mt-4">
    <!-- Filter Section -->
    <div class="d-flex mb-4">
      <input
        type="text"
        class="form-control me-2"
        v-model="filterName"
        placeholder="Filter by Event Name"
        @input="applyFilters"
      />
      <input
        type="date"
        class="form-control"
        v-model="filterDate"
        @change="applyFilters"
      />
    </div>

    <!-- Add Event Button -->
    <button class="btn btn-primary mb-3" @click="showAddModal = true">Add Event</button>

    <!-- i use Fullcalendar instead of simple CRUD-->
    <FullCalendar :options="calendarOptions" />
  </div>

  <!-- Add Event Modal -->
  <div v-if="showAddModal" class="modal-backdrop">
    <div class="modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Event</h5>
          <button type="button" class="btn-close" @click="showAddModal = false"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control mb-2" v-model="newEventTitle" placeholder="Event Name" />
          <input type="date" class="form-control mb-2" v-model="newEventDate" />
          <input type="text" class="form-control" v-model="newEventParticipants" placeholder="Participants (comma separated)" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">Cancel</button>
          <button class="btn btn-success" @click="addEvent">Add</button>
        </div>
      </div>
    </div>
  </div>

  <!-- View Event Modal -->
  <div v-if="showDetailModal" class="modal-backdrop">
    <div class="modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ selectedEvent?.title }}</h5>
          <button type="button" class="btn-close" @click="showDetailModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="event-detail-box p-3">
            <p><strong>Event Date:</strong> {{ selectedEvent?.start?.toLocaleDateString() }}</p>
            <p><strong>Participants:</strong> {{ selectedEvent?.extendedProps?.participants?.join(', ') }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetailModal = false">Close</button>
          <button class="btn btn-primary" @click="openUpdateModal">Update</button>
          <button class="btn btn-danger" @click="deleteEvent">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Update Event Modal -->
  <div v-if="showUpdateModal" class="modal-backdrop">
    <div class="modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Update Event</h5>
          <button type="button" class="btn-close" @click="showUpdateModal = false"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control mb-2" v-model="updatedEventTitle" placeholder="Event Name" />
          <input type="date" class="form-control mb-2" v-model="updatedEventDate" />
          <input type="text" class="form-control mb-2" v-model="updatedEventParticipants" placeholder="Participants (comma separated)" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showUpdateModal = false">Cancel</button>
          <button class="btn btn-success" @click="saveUpdatedEvent">Save Changes</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Filtered Events by Date -->
<div v-if="showDateFilterModal" class="modal-backdrop">
  <div class="modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Events on {{ filterDate }}</h5>
        <button type="button" class="btn-close" @click="showDateFilterModal = false"></button>
      </div>
      <div class="modal-body">
        <ul class="list-group">
          <!--Filter Name of the Even or the Date-->
          <li v-for="(event, index) in filteredEventsByDate" :key="index" class="list-group-item">
            <strong>{{ event.title }}</strong><br />
            Participants: {{ event.extendedProps?.participants?.join(', ') || 'N/A' }}
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="showDateFilterModal = false">Close</button>
      </div>
    </div>
  </div>
</div>

</template>
<!-- Static only no backend -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'vue-router'
import type { EventInput } from '@fullcalendar/core'

interface User {
  name: string
  email: string
}

const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
const router = useRouter()

const events = ref<EventInput[]>([])

// Variables for modal visibility and event details
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showUpdateModal = ref(false)
const showDateFilterModal = ref(false)

const newEventTitle = ref('')
const newEventDate = ref('')
const newEventParticipants = ref('')
const updatedEventTitle = ref('')
const updatedEventDate = ref('')
const updatedEventParticipants = ref('')
const selectedEvent = ref<FullCalendar.Event | null>(null)

const filterName = ref('')
const filterDate = ref('')
const filteredEventsByDate = ref<EventInput[]>([])

// Event handling methods
const addEvent = () => {
  if (newEventTitle.value && newEventDate.value) {
    events.value.push({
      title: newEventTitle.value,
      date: newEventDate.value,
      extendedProps: {
        participants: newEventParticipants.value.split(',').map((p) => p.trim())
      }
    })
    newEventTitle.value = ''
    newEventDate.value = ''
    newEventParticipants.value = ''
    showAddModal.value = false
  }
}

const handleEventClick = (info: { event: FullCalendar.Event }) => {
  selectedEvent.value = info.event
  showDetailModal.value = true
}

const openUpdateModal = () => {
  if (selectedEvent.value) {
    updatedEventTitle.value = selectedEvent.value.title
    updatedEventDate.value = selectedEvent.value.startStr
    updatedEventParticipants.value = selectedEvent.value.extendedProps?.participants.join(', ') || ''
    showUpdateModal.value = true
  }
}

const saveUpdatedEvent = () => {
  if (selectedEvent.value) {
    const newDate = new Date(updatedEventDate.value)

    if (isNaN(newDate.getTime())) {
      alert("Invalid date. Please select a valid date.")
      return
    }

    selectedEvent.value.setProp('title', updatedEventTitle.value)
    selectedEvent.value.setStart(newDate)
    selectedEvent.value.setExtendedProp('participants', updatedEventParticipants.value.split(',').map(p => p.trim()))
    showUpdateModal.value = false
  }
}

const deleteEvent = () => {
  if (selectedEvent.value) {
    selectedEvent.value.remove()
    selectedEvent.value = null
    showDetailModal.value = false
  }
}

const applyFilters = () => {
  const nameMatch = (event: EventInput) =>
    event.title && event.title.toLowerCase().includes(filterName.value.toLowerCase())

  const dateMatch = (event: EventInput) =>
    !filterDate.value || event.date === filterDate.value

  const filtered = events.value.filter(event => nameMatch(event) && dateMatch(event))

  if (filterDate.value && filtered.length > 0) {
    filteredEventsByDate.value = filtered
    showDateFilterModal.value = true
  }
}


// Compute calendar events
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  events: events.value.filter(event =>
    event.title.toLowerCase().includes(filterName.value.toLowerCase()) &&
    (!filterDate.value || event.date === filterDate.value)
  ),
  eventClick: handleEventClick,
}))

// Logout function
const logout = () => {
  // Clear local storage and reset state
  localStorage.removeItem('user')
  user.value = null

  // Reset modal states to avoid showing old event data
  showAddModal.value = false
  showDetailModal.value = false
  showUpdateModal.value = false
  showDateFilterModal.value = false

  // Redirect to login page
  router.push('/login')
}
</script>



<style scoped>

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog-centered {
  max-width: 500px;
  width: 100%;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
}
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1055;
}
body {
  padding-top: 56px;
}
.event-detail-box {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
