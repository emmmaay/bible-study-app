import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema.extend({
      confirmPassword: insertUserSchema.shape.password,
    })),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const onSubmit = async (data: InsertUser & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { confirmPassword, ...userData } = data;
      await register(userData);
      toast({
        title: "Welcome to Bible Study Pro!",
        description: "Your account has been created successfully.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-12 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Join our community of learners</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Full name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email address"
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Confirm password"
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Already have an account?</p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border border-primary-500 text-primary-500 py-3 rounded-xl font-medium hover:bg-primary-50 transition-colors"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
