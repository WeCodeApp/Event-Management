<template>
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem;">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-5">
                <h2 class="fw-bold mb-2 text-uppercase">Reset Password</h2>
                <p class="text-white-50 mb-5">Enter your email and new password</p>

                <form @submit.prevent="handleReset">
                  <div class="form-outline form-white mb-4 text-start">
                    <label class="form-label" for="email">Your Email</label>
                    <input
                      v-model="email"
                      type="email"
                      id="email"
                      class="form-control form-control-lg"
                      required
                    />
                  </div>

                  <div class="form-outline form-white mb-4 text-start">
                    <label class="form-label" for="newPassword">Your Preferred Password</label>
                    <input
                      v-model="newPassword"
                      type="password"
                      id="newPassword"
                      class="form-control form-control-lg"
                      required
                    />
                  </div>

                  <div class="form-outline form-white mb-4 text-start">
                    <label class="form-label" for="confirmPassword">Confirm Password</label>
                    <input
                      v-model="confirmPassword"
                      type="password"
                      id="confirmPassword"
                      class="form-control form-control-lg"
                      required
                    />
                  </div>

                  <div v-if="errorMessage" class="text-danger mt-2 small">{{ errorMessage }}</div>
                  <div v-if="successMessage" class="text-success mt-2 small">{{ successMessage }}</div>

                  <button class="btn btn-outline-light btn-lg px-5 mt-4" type="submit">
                    Reset Password
                  </button>
                </form>

                <div class="mt-4">
                  <p class="mb-0">Go back to
                    <RouterLink to="/login" class="text-white-50 fw-bold">Login</RouterLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<!-- with backend;mysql -->
<script setup lang="ts">
import { ref } from 'vue'
import axios, { AxiosError } from 'axios'

const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const handleReset = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match!"
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters."
    return
  }

  try {
    const response = await axios.post('http://localhost:3000/api/reset-password', {
      email: email.value,
      newPassword: newPassword.value,
    })

    if (response.data.success) {
      successMessage.value = "Password has been successfully reset!"
      email.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      errorMessage.value = response.data.message || "Something went wrong."
    }
  } catch (error: AxiosError) {
    console.error('❌ Reset error:', error)
    if (error.response?.status === 404) {
      errorMessage.value = 'No email records found in our database.'
    } else {
      errorMessage.value = 'Failed to reset password. Please try again later.'
    }
  }
}
</script>

<style scoped>
.gradient-custom {
  background: linear-gradient(to right, rgb(226, 245, 117), #2575fc);
}
</style>
