<template>
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem;">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-5">
                <h2 class="fw-bold mb-2 text-uppercase">Sign Up</h2>
                <p class="text-white-50 mb-5">Create your account</p>

                <!-- Name -->
                <div class="form-outline form-white mb-4">
                  <input
                    type="text"
                    id="typeName"
                    class="form-control form-control-lg"
                    v-model="name"
                    :class="{ 'is-invalid': nameTouched && !isNameValid }"
                    @input="nameTouched = true"
                  />
                  <label class="form-label" for="typeName">Name</label>
                  <div v-if="nameTouched && !isNameValid" class="invalid-feedback">Name is required.</div>
                </div>

                <!-- Email -->
                <div class="form-outline form-white mb-4">
                  <input
                    type="email"
                    id="typeEmail"
                    class="form-control form-control-lg"
                    v-model="email"
                    :class="{ 'is-invalid': emailTouched && !isEmailValid }"
                    @input="emailTouched = true"
                  />
                  <label class="form-label" for="typeEmail">Email</label>
                  <div v-if="emailTouched && !isEmailValid" class="invalid-feedback">Please enter a valid email.</div>
                </div>

                <!-- Password -->
                <div class="form-outline form-white mb-4 position-relative">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="typePassword"
                    class="form-control form-control-lg"
                    v-model="password"
                    :class="{ 'is-invalid': passwordTouched && !isPasswordValid }"
                    @input="passwordTouched = true"
                  />
                  <label class="form-label" for="typePassword">Password</label>
                  <i class="toggle-password-icon" @click="showPassword = !showPassword">
                    <!-- {{ showPassword ? '🙈' : '👁️' }} -->
                  </i>
                  <div v-if="passwordTouched && !isPasswordValid" class="invalid-feedback">Password must be at least 6 characters.</div>
                </div>

                <!-- Confirm Password -->
                <div class="form-outline form-white mb-4">
                  <input
                    type="password"
                    id="typeConfirmPassword"
                    class="form-control form-control-lg"
                    v-model="confirmPassword"
                    :class="{ 'is-invalid': confirmTouched && !isConfirmPasswordValid }"
                    @input="confirmTouched = true"
                  />
                  <label class="form-label" for="typeConfirmPassword">Confirm Password</label>
                  <div v-if="confirmTouched && !isConfirmPasswordValid" class="invalid-feedback">Passwords must match.</div>
                </div>

              <!-- Submit Button -->
<div class="d-flex justify-content-center">
  <button
    class="btn btn-outline-light btn-lg px-5 d-flex align-items-center justify-content-center"
    type="button"
    @click="handleSignUp"
    :disabled="loading || !isFormValid"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    {{ loading ? 'Signing Up...' : 'Sign Up' }}
  </button>
</div>
                <!-- Error Message -->
                <div v-if="serverError" class="mt-3 text-danger small">
                  {{ serverError }}
                </div>
              </div>

              <!-- Login Link -->
              <div>
                <p class="mb-0">Already have an account?
                  <RouterLink to="/login" class="text-white-50 fw-bold">Login</RouterLink>
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
import { ref, computed } from 'vue'
import axios from 'axios'

// Form fields
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// UI state
const loading = ref(false)
const serverError = ref('')
const showPassword = ref(false)

// Touched flags for real-time validation
const nameTouched = ref(false)
const emailTouched = ref(false)
const passwordTouched = ref(false)
const confirmTouched = ref(false)

// Validation logic
const isNameValid = computed(() => name.value.trim().length > 0)
const isEmailValid = computed(() => /^\S+@\S+\.\S+$/.test(email.value))
const isPasswordValid = computed(() => password.value.length >= 6)
const isConfirmPasswordValid = computed(() => password.value === confirmPassword.value)

const isFormValid = computed(() =>
  isNameValid.value && isEmailValid.value && isPasswordValid.value && isConfirmPasswordValid.value
)

const handleSignUp = async () => {
  nameTouched.value = true
  emailTouched.value = true
  passwordTouched.value = true
  confirmTouched.value = true
  serverError.value = ''

  if (!isFormValid.value) {
    serverError.value = 'Please fix the errors in the form.'
    return
  }

  loading.value = true

  try {
    const response = await axios.post('http://localhost:3000/api/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    })

    if (response.status === 200) {
      alert('Registration successful!')
      // Clear fields
      name.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      nameTouched.value = false
      emailTouched.value = false
      passwordTouched.value = false
      confirmTouched.value = false
      serverError.value = ''
      // Redirect to login
      window.location.href = '/login'
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error?.response?.data?.message) {
      serverError.value = error.response.data.message
    } else {
      serverError.value = 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gradient-custom {
  background: linear-gradient(to right, #e5f394, #2575fc);
}

.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
}

.toggle-password-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
}
</style>
