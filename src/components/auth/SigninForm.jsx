'use client';

/**
 * Sign-in form with react-hook-form + Yup validation
 * Uses useLoginMutation from RTK Query
 * Premium glassmorphism card design
 */
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signinFormSchema } from '@/validation/auth';
import { useLoginMutation } from '@/services/authApi';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';

export default function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signinFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData) => {
    try {
      const result = await login(formData).unwrap();
      dispatch(
        showSnackbar({
          message: result?.message || 'Login successful!',
          type: 'success',
        })
      );
      // Redirect to the intended page or products
      const redirect = searchParams.get('redirect') || '/products';
      router.push(redirect);
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err?.data?.message || 'Login failed. Please try again.',
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <div className="auth-card__logo">⚡</div>
        <h1 className="auth-card__title">Welcome Back</h1>
        <p className="auth-card__subtitle">Sign in to your QuickBuy account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-card__form" noValidate>
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={<FiMail size={18} />}
          register={register}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          icon={<FiLock size={18} />}
          register={register}
          error={errors.password?.message}
        />

        <div className="auth-card__options">
          <label className="auth-card__remember">
            <input type="checkbox" id="remember-me" />
            <span>Remember me</span>
          </label>
          <a href="#" className="auth-card__forgot">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          size="lg"
        >
          Sign In
        </Button>
      </form>

      <p className="auth-card__footer">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="auth-card__link">
          Create one
        </Link>
      </p>
    </div>
  );
}
