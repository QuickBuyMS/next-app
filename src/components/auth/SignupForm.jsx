'use client';

/**
 * Sign-up form with react-hook-form + Yup validation
 * Uses useSignupMutation from RTK Query
 */
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupFormOneSchema } from '@/validation/auth';
import { useSignupMutation } from '@/services/authApi';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function SignupForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupFormOneSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData) => {
    try {
      const { confirmPassword, ...submitData } = formData;
      const result = await signup(submitData).unwrap();
      dispatch(
        showSnackbar({
          message: result?.message || 'Account created successfully!',
          type: 'success',
        })
      );
      router.push('/products');
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err?.data?.message || 'Signup failed. Please try again.',
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <div className="auth-card__logo">⚡</div>
        <h1 className="auth-card__title">Create Account</h1>
        <p className="auth-card__subtitle">Join QuickBuy and start shopping</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-card__form" noValidate>
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="John Doe"
          icon={<FiUser size={18} />}
          register={register}
          error={errors.name?.message}
        />

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
          placeholder="Create a password"
          icon={<FiLock size={18} />}
          register={register}
          error={errors.password?.message}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          icon={<FiLock size={18} />}
          register={register}
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          size="lg"
        >
          Create Account
        </Button>
      </form>

      <p className="auth-card__footer">
        Already have an account?{' '}
        <Link href="/signin" className="auth-card__link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
