import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Laptop,
  Monitor,
  Network,
  Server,
  Cable,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Shield,
  Truck,
  HeadphonesIcon,
  Award,
  Package,
  Wrench,
  Cloud,
  Settings,
  Cpu
} from 'lucide-react';
import { CATEGORY_LABELS, ProductCategory } from '@/types/database';
import { useServicesByCategory } from '@/hooks/useServices';

const SERVICE_ICON_MAP: Record<string, React.ElementType> = {
  Package,
  Wrench,
  Server,
  Cloud,
  Settings,
  Cpu,
  Laptop,
  Monitor,
  Network,
  Cable,
};

const categoryData: { category: ProductCategory; icon: React.ElementType; description: string }[] = [
  { category: 'laptop', icon: Laptop, description: 'Business & Enterprise Laptops' },
  { category: 'desktop', icon: Monitor, description: 'Workstations & PCs' },
  { category: 'network_module', icon: Network, description: 'Switches, Routers & Modules' },
  { category: 'server', icon: Server, description: 'Enterprise Server Solutions' },
  { category: 'accessories', icon: Cable, description: 'Peripherals & Accessories' },
];

const features = [
  { icon: Shield, title: 'Genuine Products', description: 'All products sourced from authorized distributors' },
  { icon: Truck, title: 'Fast Delivery', description: 'Quick delivery across India with proper packaging' },
  { icon: HeadphonesIcon, title: '24/7 Technical Care', description: 'Round-the-clock technical support for all products' },
  { icon: Award, title: 'Best Prices', description: 'Competitive pricing with bulk order discounts' },
];

export default function Index() {
  const { data: services, isLoading: servicesLoading } = useServicesByCategory();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white bg-[#0b0f14]">

{/* Circuit Glow Layer */}
<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,140,255,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,120,0,0.12),transparent_40%)]" />

{/* Grid Lines */}
<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

<div className="relative container py-24 lg:py-32">

  <div className="max-w-3xl">

    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
      Enterprise IT Solutions <br />
      <span className="text-orange-500">Built to Scale</span>
    </h1>

    <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl">
      Delivering reliable IT hardware, services, and scalable technology solutions for modern businesses.
    </p>

  </div>

</div>

</section>
      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Product Categories
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse through our extensive range of IT hardware solutions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categoryData.map(({ category, icon: Icon, description }, index) => (
              <Link
                key={category}
                to={`/products/${category}/dell`}
                className="group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-fade-in">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our range of IT infrastructure and professional services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {servicesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))
            ) : (services ?? []).length > 0 ? (
              (services ?? []).map((service, index) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-fade-in">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Wrench className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors capitalize">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description || 'Get in touch for details'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No services available yet. Add services in Admin to display them here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Paras Hardwares?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Integrity: We uphold transparency, ethics and accountability in all engagements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* <div className="flex justify-center">

</div> */}


      {/* About Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
PARAS ENTERPRISES              </h2>
              <p className="text-muted-foreground mb-4">
                We are a team filled with Passionate and dedicated spirits & hold our strengths in
                IT Hardware Supply, Infrastructure services, Server, Storage & Network Management,
                Data Migrations across different platforms,              </p>
              <p className="text-muted-foreground mb-6">
                Creation of Virtualisation Environments
                as per requirements, Datacenter Management & Co-Location Services & Consultation
                for Your IT/ Digitalization & Automation Requirements & Needs.

                Moving towards Excellence and Growth Since 2017.              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Our Location</h4>
                    <p className="text-sm text-muted-foreground">
                      SH NO B8 BUILDING C,
                      SWAMIPURAM 2161/B, NEAR S P M SCHOOL, SADASHIV PETH, Pune,
                      Maharashtra, 411030</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Phone</h4>
                    <p className="text-sm text-muted-foreground">+91 9922336222  </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <p className="text-sm text-muted-foreground">info@parasenterprises.store</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
                    <span className="font-display font-bold text-primary-foreground text-4xl">PH</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">10+ Years</p>
                  <p className="text-muted-foreground">of Industry Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
<section className="py-16 lg:py-24 bg-primary text-primary-foreground">
  <div className="container text-center">

    <div className="overflow-hidden">
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 inline-block whitespace-nowrap animate-marquee">
        Ready to Upgrade Your IT Infrastructure?
      </h2>
    </div>

    <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
      Get in touch with us today for competitive quotes and expert guidance on your IT hardware needs.
    </p>

  </div>
</section>



      {/* Footer */}
      <footer className="py-8 bg-foreground text-background/80">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="font-display font-bold text-accent-foreground text-lg">PH</span>
              </div>
              <span className="font-display font-semibold">Paras Hardwares</span>
            </div>
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} Paras Hardwares. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}
