import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Award
} from 'lucide-react';
import { CATEGORY_LABELS, ProductCategory } from '@/types/database';

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
  { icon: HeadphonesIcon, title: '24/7 Support', description: 'Round-the-clock technical support for all products' },
  { icon: Award, title: 'Best Prices', description: 'Competitive pricing with bulk order discounts' },
];

export default function Index() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-60" />
        
        <div className="container relative py-20 lg:py-32">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Trusted Partner for{' '}
              <span className="text-accent">Enterprise IT Solutions</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
              Paras Hardwares provides top-quality laptops, desktops, servers, and networking equipment from leading brands like Dell, HP, Lenovo, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 animate-pulse-glow"
              >
                <Link to="/products/laptop/">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground bg-transparent backdrop-blur-sm"
              >
                <Link to="/contact" className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
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

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Paras Hardwares?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're committed to providing the best IT solutions for your business
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

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                About Paras Hardwares
              </h2>
              <p className="text-muted-foreground mb-4">
                Established with a vision to provide top-quality IT infrastructure solutions, Paras Hardwares has become a trusted name in the industry. We specialize in supplying enterprise-grade hardware from globally recognized brands.
              </p>
              <p className="text-muted-foreground mb-6">
                Our commitment to quality, competitive pricing, and exceptional customer service has helped us build long-lasting relationships with businesses across India. Whether you need a single laptop or a complete server infrastructure, we have you covered.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Our Location</h4>
                    <p className="text-sm text-muted-foreground">Mumbai, Maharashtra, India</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Phone</h4>
                    <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <p className="text-sm text-muted-foreground">contact@parashardwares.com</p>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Upgrade Your IT Infrastructure?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Get in touch with us today for competitive quotes and expert guidance on your IT hardware needs.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
          >
            <Link to="/contact">
              Get a Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
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
