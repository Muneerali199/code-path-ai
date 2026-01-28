import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Code2, GraduationCap, Briefcase, Loader2, Chrome } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { user, signUp, signIn, signInWithGoogle, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPostAuthRoute = useCallback(() => {
    try {
      return localStorage.getItem('currentProject') ? '/app' : '/create-project';
    } catch {
      return '/create-project';
    }
  }, []);
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpRole, setSignUpRole] = useState<'learner' | 'employer'>('learner');

  useEffect(() => {
    if (user && !loading) {
      navigate(getPostAuthRoute());
    }
  }, [user, loading, navigate, getPostAuthRoute]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signInEmail);
      passwordSchema.parse(signInPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
      navigate(getPostAuthRoute());
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithGoogle(signUpRole);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in with Google!');
      navigate(getPostAuthRoute());
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signUpEmail);
      passwordSchema.parse(signUpPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signUp(signUpEmail, signUpPassword, signUpRole, signUpFullName || undefined);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists. Please sign in.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created! You can now start coding.');
      navigate(getPostAuthRoute());
    }
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono">CodePath AI</h1>
            <p className="text-xs text-muted-foreground">Learn • Code • Get Hired</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to CodePath AI</CardTitle>
            <CardDescription>
              The AI-powered platform to learn coding and validate your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Sign in with Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        className="bg-secondary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        className="bg-secondary"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Sign up with Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signUpFullName}
                        onChange={(e) => setSignUpFullName(e.target.value)}
                        className="bg-secondary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className="bg-secondary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        className="bg-secondary"
                      />
                    </div>
                    
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label>I am a...</Label>
                      <RadioGroup
                        value={signUpRole}
                        onValueChange={(value) => setSignUpRole(value as 'learner' | 'employer')}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value="learner"
                            id="learner"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="learner"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-secondary p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <GraduationCap className="mb-2 h-6 w-6" />
                            <span className="font-medium">Learner</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              Learn & practice coding
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="employer"
                            id="employer"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="employer"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-secondary p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <Briefcase className="mb-2 h-6 w-6" />
                            <span className="font-medium">Employer</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              Assess candidates
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        <p>Dual-agent AI: <span className="text-info">Coder-AI</span> executes • <span className="text-success">Guide-AI</span> explains</p>
      </footer>
    </div>
  );
}
