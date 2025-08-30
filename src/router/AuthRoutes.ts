const AuthRoutes = {
    path: '/auth',
    component: () => import('@/layouts/blank/BlankLayout.vue'),
    meta: {
        requiresAuth: false
    },
    children: [
        {
            name: 'Login',
            path: '/auth/login',
            component: () => import('@/views/auth/Login.vue')
        },
        {
            name: 'Register',
            path: '/auth/register',
            component: () => import('@/views/auth/Register.vue')
        },
        {
            name: 'Forget Password',
            path: '/forget-password',
            component: () => import('@/views/auth/ForgetPassword.vue')
        },
        {
            name: 'Verify OTP',
            path: '/verify-otp',
            component: () => import('@/views/auth/VerifyOtp.vue')
        },
        {
            name: 'Reset Password',
            path: '/reset-password',
            component: () => import('@/views/auth/ResetPassword.vue')
        },
        {
            name: 'Reset Password Success',
            path: '/reset-password/success',
            component: () => import('@/views/auth/ResetPasswordSuccess.vue')
        },
    ]
};

export default AuthRoutes;
