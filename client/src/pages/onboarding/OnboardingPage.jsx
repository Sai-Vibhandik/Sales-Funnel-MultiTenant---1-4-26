import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import organizationService from '@/services/organizationService';
import { Button, Input, Card, CardBody, Spinner } from '@/components/ui';
import { Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100, 'Organization name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    // Check if a plan was passed from registration (via navigate state)
    if (location.state?.selectedPlan) {
      setSelectedPlan(location.state.selectedPlan);
      setPlanLoading(false);
      return;
    }

    // Check if plan is passed via URL params (for authenticated users without org)
    const planIdFromUrl = searchParams.get('plan');
    const cycleFromUrl = searchParams.get('cycle');

    if (planIdFromUrl) {
      // Fetch plan details from API
      const fetchPlan = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/plans/public/${planIdFromUrl}`);
          const data = await response.json();
          if (data.success && data.data) {
            const plan = data.data;
            setSelectedPlan({
              id: plan._id,
              name: plan.name,
              price: cycleFromUrl === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
              billingCycle: cycleFromUrl || 'monthly',
            });
          }
        } catch (error) {
          console.error('Failed to fetch plan:', error);
        } finally {
          setPlanLoading(false);
        }
      };
      fetchPlan();
    } else {
      setPlanLoading(false);
    }
  }, [location.state, searchParams]);

  const handleCreateOrganization = async (data) => {
    setLoading(true);
    try {
      console.log('Creating organization with plan:', selectedPlan);
      const response = await organizationService.createOrganization({
        name: data.name,
        description: data.description,
        planId: selectedPlan?.id || selectedPlan?._id,
        planName: selectedPlan?.name || 'Free Plan',
      });

      if (response && response.success) {
        toast.success('Organization created successfully! Redirecting...');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        toast.error(response?.message || 'Failed to create organization');
        setLoading(false);
      }
    } catch (error) {
      console.error('Organization creation error:', error);
      // The api interceptor returns error.response?.data or { message }
      // So error is either { success: false, message: '...' } or { message: '...' }
      const errorMessage = error?.message || 'Failed to create organization';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GV</span>
            </div>
            <span className="font-semibold text-gray-900">Growth Valley</span>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardBody className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Organization</h2>
                <p className="text-gray-600">This will be your agency's workspace name</p>
              </div>

              {/* Selected Plan Summary */}
              {selectedPlan && (
                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Selected Plan</p>
                      <p className="font-semibold text-primary-600">{selectedPlan.name}</p>
                      <p className="text-sm text-gray-500">
                        ₹{selectedPlan.price}/{selectedPlan.billingCycle === 'monthly' ? 'month' : 'year'}
                      </p>
                    </div>
                    <Link
                      to="/"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Change Plan
                    </Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(handleCreateOrganization)} className="space-y-4">
                <Input
                  label="Organization Name"
                  placeholder="e.g., Acme Marketing Agency"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Brief description of your organization"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={loading}
                >
                  Create Organization
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}