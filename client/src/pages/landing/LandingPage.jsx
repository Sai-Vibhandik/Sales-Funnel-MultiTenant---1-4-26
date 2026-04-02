import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Users,
  Clock,
  Star,
  Play,
  Check,
  X,
  Crown,
  Rocket,
  Palette,
  Video,
  FileText,
  BarChart3
} from 'lucide-react';
import { Spinner } from '@/components/ui';

export default function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect authenticated users with organization to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading && user?.currentOrganization) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  // Fetch public plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/plans/public`);
        const data = await response.json();
        if (data.success && data.data) {
          setPlans(data.data.filter(p => p.isActive && p.isPublic));
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Don't render if loading or if authenticated with organization (will redirect)
  if (authLoading || (isAuthenticated && user?.currentOrganization)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleSelectPlan = (planId) => {
    // If user is authenticated but has no org, go to onboarding
    if (isAuthenticated && !user?.currentOrganization) {
      navigate(`/onboarding?plan=${planId}&cycle=${billingCycle}`);
    } else {
      navigate(`/register?plan=${planId}&cycle=${billingCycle}`);
    }
  };

  // Helper to format features from plan
  const getPlanFeatures = (plan) => {
    const features = [];

    // From features object
    if (plan.features) {
      if (plan.features.analytics) features.push('Advanced Analytics');
      if (plan.features.prioritySupport) features.push('Priority Support');
      if (plan.features.customDomain) features.push('Custom Domain');
      if (plan.features.apiAccess) features.push('API Access');
      if (plan.features.whiteLabel) features.push('White-label Branding');
    }

    // From limits
    if (plan.limits) {
      if (plan.limits.maxUsers === -1) {
        features.push('Unlimited Team Members');
      } else if (plan.limits.maxUsers) {
        features.push(`Up to ${plan.limits.maxUsers} Team Members`);
      }
      if (plan.limits.maxProjects === -1) {
        features.push('Unlimited Projects');
      } else if (plan.limits.maxProjects) {
        features.push(`${plan.limits.maxProjects} Projects`);
      }
    }

    // From featureList array
    if (plan.featureList && plan.featureList.length > 0) {
      plan.featureList.forEach(f => {
        if (f.included !== false) {
          features.push(f.name + (f.limit ? ` (${f.limit === -1 ? 'Unlimited' : f.limit})` : ''));
        }
      });
    }

    return features.slice(0, 8); // Limit to 8 features
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">GV</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Growth Valley</span>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition cursor-pointer">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition cursor-pointer">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition cursor-pointer">Pricing</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Done-For-You Marketing Services
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Complete Marketing Team
              <span className="text-primary-600 block mt-2">Without the Hiring Hassle</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Get expert marketing strategy, landing pages, video editing, graphic design, and content writing —
              all handled by our team while you focus on growing your business.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition shadow-lg shadow-primary-200"
              >
                View Plans
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">500+</div>
              <div className="text-gray-600 mt-2">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">98%</div>
              <div className="text-gray-600 mt-2">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">50+</div>
              <div className="text-gray-600 mt-2">Expert Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">24hr</div>
              <div className="text-gray-600 mt-2">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need for Marketing Success
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              A complete marketing team at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Marketing Strategy"
              description="Complete market research, offer engineering, and traffic strategy tailored to your business goals."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Content Planning"
              description="SEO-optimized content, ad copy, email sequences, and social media content crafted by experts."
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6" />}
              title="Landing Pages"
              description="High-converting landing pages designed and developed by our expert UI/UX team."
            />
            <FeatureCard
              icon={<Video className="w-6 h-6" />}
              title="Video Editing"
              description="Professional video editing for ads, product demos, testimonials, and social media content."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Graphic Design"
              description="Eye-catching ad creatives, social media graphics, brand assets, and marketing materials."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Dedicated Team"
              description="Your own team of performance marketers, content writers, designers, and developers."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Getting started is simple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Choose Your Plan"
              description="Select a plan that fits your needs. Each plan includes a set of marketing services and deliverables."
            />
            <StepCard
              number={2}
              title="Share Your Requirements"
              description="Tell us about your business, goals, target audience, and we'll match you with the right team."
            />
            <StepCard
              number={3}
              title="Get Results"
              description="Our expert team creates your marketing strategy and delivers quality work on time."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Choose the plan that fits your needs. No hidden fees.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="mx-4 relative w-14 h-7 bg-gray-300 rounded-full transition-colors hover:bg-gray-400"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-7' : ''
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
                <span className="ml-1 text-green-600 font-semibold">Save 17%</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Plans available soon. Please contact us for pricing.</p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact Us <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <PricingCard
                  key={plan._id}
                  plan={plan}
                  billingCycle={billingCycle}
                  features={getPlanFeatures(plan)}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="What's included in each plan?"
              answer="Each plan includes marketing strategy, content planning, landing pages, video editing, and graphic design services. The difference is in the number of projects, revisions, and priority level."
            />
            <FAQItem
              question="How does the team assignment work?"
              answer="Based on your plan, we assign a dedicated team consisting of a performance marketer, content writer, UI/UX designer, graphic designer, video editor, developer, and tester."
            />
            <FAQItem
              question="Can I upgrade or downgrade my plan?"
              answer="Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle."
            />
            <FAQItem
              question="How do I get started?"
              answer="Simply choose a plan, create your account, and our team will reach out to understand your requirements and get started on your first project."
            />
            <FAQItem
              question="What if I need more than what's included?"
              answer="You can always upgrade to a higher plan, or contact us for custom enterprise solutions tailored to your specific needs."
            />
            <FAQItem
              question="How long does it take to see results?"
              answer="Most projects start within 24-48 hours of approval. Marketing strategies are typically completed within 5-7 business days, with ongoing deliverables based on your plan."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Grow Your Business?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Get your dedicated marketing team today
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">GV</span>
                </div>
                <span className="text-xl font-bold text-white">Growth Valley</span>
              </div>
              <p className="text-sm">
                Done-for-you marketing services for growing businesses.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Marketing Strategy</a></li>
                <li><a href="#features" className="hover:text-white transition">Content Planning</a></li>
                <li><a href="#features" className="hover:text-white transition">Landing Pages</a></li>
                <li><a href="#features" className="hover:text-white transition">Video Editing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} GrowthValley. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ plan, billingCycle, features, onSelect }) {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const isPopular = plan.tier === 'pro' || plan.tier === 'enterprise';

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg flex flex-col ${
      isPopular ? 'ring-2 ring-primary-600' : 'border border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 flex-1">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
          {plan.description && (
            <p className="text-gray-500 mt-1 text-sm">{plan.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-gray-900">₹{price || 0}</span>
          <span className="text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
          {billingCycle === 'yearly' && plan.monthlyPrice > 0 && plan.yearlyPrice > 0 && (
            <div className="text-sm text-green-600 font-medium mt-1">
              Save ₹{(plan.monthlyPrice * 12) - (plan.yearlyPrice || 0)}/year
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onSelect(plan._id)}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
            isPopular
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <p className="mt-4 text-gray-600">{answer}</p>
      )}
    </div>
  );
}