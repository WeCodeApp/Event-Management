<template>
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem;">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-5">
                <h2 class="fw-bold mb-2 text-uppercase">Login</h2>
                <p class="text-white-50 mb-5">Please enter your login and password!</p>

                <!-- Form for login -->
                <form @submit.prevent="handleLogin">
                  <div class="form-outline form-white mb-4">
                    <input
                      type="email"
                      id="typeEmailX"
                      class="form-control form-control-lg"
                      v-model="email"
                      required
                    />
                    <label class="form-label" for="typeEmailX">Email</label>
                  </div>

                  <div class="form-outline form-white mb-4">
                    <input
                      type="password"
                      id="typePasswordX"
                      class="form-control form-control-lg"
                      v-model="password"
                      required
                    />
                    <label class="form-label" for="typePasswordX">Password</label>
                  </div>

                  <p class="small mb-5 pb-lg-2">
                    <RouterLink class="text-white-50" to="/forgot-password">Forgot password?</RouterLink>
                  </p>

                  <!-- Submit button -->
                  <button class="btn btn-outline-light btn-lg px-5" type="submit">
                    Login
                  </button>
                </form>

                <!-- Error message if login fails -->
                <div class="text-danger mt-3 small" v-if="errorMessage">
                  {{ errorMessage }}
                </div>

                <div class="d-flex justify-content-center text-center mt-4 pt-1">
                  <a href="#" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
                  <a href="#" class="text-white"><i class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
                  <a href="#" class="text-white"><i class="fab fa-google fa-lg"></i></a>
                </div>
              </div>

              <div>
                <p class="mb-0">Don't have an account?
                  <RouterLink to="/signup" class="text-white-50 fw-bold">Sign Up</RouterLink>
                </p>
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
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref<string>('')
const password = ref<string>('')
const errorMessage = ref<string>('')

const router = useRouter()

// Handle login process
const handleLogin = async () => {
  errorMessage.value = ''  // Reset the error message

  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      email: email.value,
      password: password.value,
    })

    // If login is successful
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    } else {
      // Handle invalid login
      errorMessage.value = response.data.message
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = error.response?.data?.message || 'Login failed. Please try again later.'
  }
}
</script>

<style scoped>
.gradient-custom {
  background: linear-gradient(to right, rgb(226, 245, 117), #2575fc);
}
</style>
