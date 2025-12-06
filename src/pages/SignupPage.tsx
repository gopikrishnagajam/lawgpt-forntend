import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import type { SignupRequest } from '../types/api.types';
import { AlertCircle, Loader2, CheckCircle2, Info, Building2, User, ArrowRight, Mail } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  phoneCountry: z.string().min(2, 'Country code is required').max(2).toUpperCase(),
  accountType: z.enum(['individual', 'organization']),
  planType: z.string().min(1, 'Plan type is required'),
  // Optional profile fields
  barNumber: z.string().optional(),
  specialty: z.string().optional(),
  // Organization fields
  organizationName: z.string().optional(),
  organizationPlanType: z.string().optional(),
  organizationDescription: z.string().optional(),
  organizationLicenseNumber: z.string().optional(),
  organizationAddress: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'select' | 'form'>(inviteToken ? 'form' : 'select');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'individual',
      phoneCountry: 'US',
      planType: 'individual',
      organizationPlanType: 'organization',
    },
  });

  // Pre-fill email if it's in the URL (from invitation)
  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setValue('email', email);
    }
  }, [searchParams, setValue]);

  const watchEmail = watch('email');
  const watchPassword = watch('password');
  const watchPhone = watch('phone');
  const accountType = watch('accountType');
  const isOrganization = accountType === 'organization';

  const handleAccountTypeSelect = (type: 'individual' | 'organization') => {
    setValue('accountType', type);
    setValue('planType', type === 'individual' ? 'individual' : 'organization');
    if (type === 'organization') {
      setValue('organizationPlanType', 'organization');
    }
    setStep('form');
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError('');

      // If invitation token, use simplified signup
      if (inviteToken) {
        const payload = {
          email: data.email,
          phone: data.phone,
          phoneCountry: data.phoneCountry,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          planType: 'organization', // Will be overridden by backend
          inviteToken: inviteToken,
        };

        await authService.signup(payload as SignupRequest);
      } else {
        // Regular signup flow
        const payload: Partial<SignupRequest> = {
          email: data.email,
          phone: data.phone,
          phoneCountry: data.phoneCountry,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          planType: isOrganization ? data.organizationPlanType! : data.planType!,
        };

        // Add optional profile fields for individual
        if (!isOrganization) {
          if (data.barNumber || data.specialty) {
            payload.profile = {};
            if (data.barNumber) payload.profile.barNumber = data.barNumber;
            if (data.specialty) payload.profile.specialty = data.specialty;
          }
        }

        // Add organization data if creating organization
        if (isOrganization && data.organizationName) {
          payload.organization = {
            name: data.organizationName,
            planType: data.organizationPlanType!,
          };
          if (data.organizationDescription) {
            payload.organization.description = data.organizationDescription;
          }
          if (data.organizationLicenseNumber) {
            payload.organization.licenseNumber = data.organizationLicenseNumber;
          }
          if (data.organizationAddress) {
            payload.organization.address = data.organizationAddress;
          }
        }

        await authService.signup(payload as SignupRequest);
      }
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation helpers
  const getEmailValidation = () => {
    if (!watchEmail) return null;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchEmail);
    return { isValid, message: isValid ? 'Valid email format' : 'Enter a valid email address' };
  };

  const getPasswordValidation = () => {
    if (!watchPassword) return null;
    const validations = [
      { valid: watchPassword.length >= 8, text: 'At least 8 characters' },
      { valid: /[A-Z]/.test(watchPassword), text: 'One uppercase letter' },
      { valid: /[a-z]/.test(watchPassword), text: 'One lowercase letter' },
      { valid: /[0-9]/.test(watchPassword), text: 'One number' },
    ];
    return validations;
  };

  const getPhoneValidation = () => {
    if (!watchPhone) return null;
    const isValid = watchPhone.length >= 10;
    return { isValid, message: isValid ? 'Valid phone number' : 'Enter at least 10 digits' };
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-2xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h2>
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">L</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LawGBT</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Choose Your Account Type</h2>
            <p className="mt-2 text-gray-600">Select the plan that best fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Individual Plan */}
            <button
              onClick={() => handleAccountTypeSelect('individual')}
              className="group relative bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 text-left"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  For Individuals
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Individual</h3>
              <p className="text-gray-600 mb-6">Perfect for solo practitioners and independent lawyers</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Personal case management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Document storage & AI assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Client communication tools</span>
                </li>
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">Start free</span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Organization Plan */}
            <button
              onClick={() => handleAccountTypeSelect('organization')}
              className="group relative bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 text-left"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  For Teams
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Organization</h3>
              <p className="text-gray-600 mb-6">Ideal for law firms and legal teams</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Team collaboration & role management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Shared case database & resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Advanced analytics & reporting</span>
                </li>
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">For your firm</span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">L</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LawGBT</h1>
          </div>
          
          {inviteToken ? (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg mb-2">
                <Mail className="w-4 h-4" />
                <span className="font-semibold">Invitation Accepted</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Registration</h2>
              <p className="text-gray-600 mt-1">You're joining an organization as a team member</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                {isOrganization ? 'Create Organization Account' : 'Create Individual Account'}
              </h2>
              <button
                onClick={() => setStep('select')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Change account type
              </button>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">{inviteToken && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-900 mb-1">Organization Invitation</p>
                    <p className="text-green-700">
                      You've been invited to join an organization. Just fill in your details below and you'll automatically become a team member!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    id="lastName"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="phoneCountry" className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  {...register('phoneCountry')}
                  type="text"
                  id="phoneCountry"
                  placeholder="US"
                  maxLength={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  placeholder="+1234567890"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Individual Profile Fields */}
            {!isOrganization && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="barNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Bar Number
                    </label>
                    <input
                      {...register('barNumber')}
                      type="text"
                      id="barNumber"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty
                    </label>
                    <input
                      {...register('specialty')}
                      type="text"
                      id="specialty"
                      placeholder="e.g., Criminal Law, Family Law"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Organization Fields */}
            {isOrganization && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      {...register('organizationName')}
                      type="text"
                      id="organizationName"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="organizationDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('organizationDescription')}
                      id="organizationDescription"
                      rows={2}
                      placeholder="Brief description of your law firm"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="organizationLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <input
                      {...register('organizationLicenseNumber')}
                      type="text"
                      id="organizationLicenseNumber"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="organizationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      {...register('organizationAddress')}
                      id="organizationAddress"
                      rows={2}
                      placeholder="Office address"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          {/* Side Panel - Requirements & Tips */}
          <div className="space-y-4">
            {/* Email Validation */}
            {watchEmail && getEmailValidation() && (
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-start gap-2">
                  <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getEmailValidation()?.isValid ? 'text-green-500' : 'text-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
                    <p className={`text-sm ${getEmailValidation()?.isValid ? 'text-green-600' : 'text-gray-600'}`}>
                      {getEmailValidation()?.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {watchPassword && getPasswordValidation() && (
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-gray-900">Password Requirements</p>
                </div>
                <div className="space-y-2 ml-7">
                  {getPasswordValidation()?.map((validation, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${validation.valid ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-sm ${validation.valid ? 'text-green-600' : 'text-gray-600'}`}>
                        {validation.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phone Validation */}
            {watchPhone && getPhoneValidation() && (
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-start gap-2">
                  <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getPhoneValidation()?.isValid ? 'text-green-500' : 'text-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Phone Number</p>
                    <p className={`text-sm ${getPhoneValidation()?.isValid ? 'text-green-600' : 'text-gray-600'}`}>
                      {getPhoneValidation()?.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* General Tips */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Tips</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use a valid email for verification</li>
                    <li>• Choose a strong password</li>
                    <li>• Include country code in phone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
