import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowRight, 
  Loader2, 
  Mail, 
  UserPlus, 
  Bell, 
  Users, 
  Fingerprint, 
  Phone, 
  CreditCard 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    societyName: "",
    numberOfFlats: "",
    query: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Submitting form data:", formData);
      
      const { data, error } = await supabase.functions.invoke('send-contact-form', {
        body: formData
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      console.log("Form submission response:", data);

      toast({
        title: "Success!",
        description: "Your message has been sent successfully.",
      });
      
      setFormData({ 
        name: "", 
        email: "", 
        societyName: "", 
        numberOfFlats: "", 
        query: "", 
        message: "" 
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="bg-white py-4 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <img 
              src="/lovable-uploads/538e7a91-aee2-4bde-841a-77872de23b28.png" 
              alt="MyDoorKeeper Logo" 
              className="h-12 w-auto object-contain max-w-[200px]"
            />
          </div>
        </div>
      </header>

      <div className="pt-[3rem] md:pt-16">
        <section className="relative min-h-0 md:min-h-screen flex items-start md:items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5 pb-16">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(249,115,22,0.07)'/%3E%3C/svg%3E\")",
            opacity: 0.5
          }}></div>
          <div className="container mx-auto px-4 text-center relative animate-fade-up">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/cbf485a7-35d8-4e37-8630-e9c333b06cd1.png" 
                alt="Person relaxing at home" 
                className="w-full md:w-[800px] h-auto object-contain"
              />
            </div>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
              Secure your space with confidence and convenience
            </p>
            <Button
              className="group text-lg bg-viking-teal hover:bg-viking-teal/90"
              size="lg"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Book a Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>

        <section id="features" className="py-12 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-primary">
              Why you should choose My Door Keeper?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <UserPlus className="h-8 w-8 text-primary" />,
                  title: "Seamless Visitor Management",
                  description: "Streamline guest access with digital registration and automated notifications for a smooth, secure entry process."
                },
                {
                  icon: <Bell className="h-8 w-8 text-primary" />,
                  title: "Real-time Notifications",
                  description: "Stay informed with instant alerts about visitors, deliveries, and important community updates."
                },
                {
                  icon: <Users className="h-8 w-8 text-primary" />,
                  title: "Keep Connected to Your Community",
                  description: "Foster stronger relationships through our integrated communication platform and community forums."
                },
                {
                  icon: <Fingerprint className="h-8 w-8 text-primary" />,
                  title: "Approvals at Fingertips",
                  description: "Quick and secure approval process for visitor access and community requests from your mobile device."
                },
                {
                  icon: <Phone className="h-8 w-8 text-primary" />,
                  title: "Emergency Assistance",
                  description: "Instant access to emergency services and community support when you need it most."
                },
                {
                  icon: <CreditCard className="h-8 w-8 text-primary" />,
                  title: "Dues and Bill Management",
                  description: "Effortlessly manage and track community payments, dues, and billing all in one place."
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-up border border-gray-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-24 bg-gradient-to-t from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-md">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary">
              Get Started with MyDoorKeeper
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Society Name"
                    value={formData.societyName}
                    onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Number of Flats"
                    value={formData.numberOfFlats}
                    onChange={(e) => setFormData({ ...formData, numberOfFlats: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Query Type"
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full min-h-[150px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-viking-teal hover:bg-viking-teal/90"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Contact Us
                </Button>
              </form>
            </div>
          </div>
        </section>

        <footer className="bg-primary text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@mydoorkeeper.com" className="hover:text-white/90 transition-colors">
                  info@mydoorkeeper.com
                </a>
              </div>
              <div className="text-sm text-white/80">
                © {new Date().getFullYear()} MyDoorKeeper. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
