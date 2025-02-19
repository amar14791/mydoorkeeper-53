
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MessageSquare, Users, ArrowRight, Loader2 } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Replace this URL with your Zapier webhook URL
      const response = await fetch("YOUR_ZAPIER_WEBHOOK_URL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        mode: "no-cors",
      });

      toast({
        title: "Success!",
        description: "Your message has been sent successfully.",
      });
      
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Welcome to Our Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Transform your experience with our innovative solutions
          </p>
          <Button
            className="group text-lg"
            size="lg"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            Explore Features
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            Our Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mail className="h-8 w-8 text-primary" />,
                title: "Smart Communication",
                description:
                  "Seamless communication tools for better collaboration.",
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Team Management",
                description:
                  "Efficient team organization and resource allocation.",
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-primary" />,
                title: "Real-time Updates",
                description:
                  "Stay informed with instant notifications and updates.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            Get in Touch
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full"
              />
            </div>
            <div>
              <Textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                className="w-full min-h-[150px]"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Message
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Index;
