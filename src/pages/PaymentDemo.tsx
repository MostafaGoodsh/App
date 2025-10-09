import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Lock,
  Globe
} from 'lucide-react';

const PaymentDemo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Payment Integration Demo
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Digital Points Payment System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure payment integration for digital experience points (XP) purchase
          </p>
        </div>

        {/* Integration Status */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Paymob Connected</div>
                  <div className="text-xs text-muted-foreground">Test Mode Active</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Webhook Verified</div>
                  <div className="text-xs text-muted-foreground">HMAC Secured</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Encryption Active</div>
                  <div className="text-xs text-muted-foreground">SSL/TLS Enabled</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Flow */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Payment Flow
            </CardTitle>
            <CardDescription>
              How the payment integration works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  1
                </div>
                <div className="font-medium mb-1">Select Amount</div>
                <div className="text-xs text-muted-foreground">User chooses amount in EGP</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  2
                </div>
                <div className="font-medium mb-1">Payment Method</div>
                <div className="text-xs text-muted-foreground">Choose local payment option</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  3
                </div>
                <div className="font-medium mb-1">Secure Payment</div>
                <div className="text-xs text-muted-foreground">Process via Paymob</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  4
                </div>
                <div className="font-medium mb-1">Credit Points</div>
                <div className="text-xs text-muted-foreground">XP added to account</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Supported Payment Methods
            </CardTitle>
            <CardDescription>
              Local Egyptian payment options integrated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="font-medium mb-2">Credit/Debit Cards</div>
                <div className="text-sm text-muted-foreground">Visa, Mastercard</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="font-medium mb-2">Mobile Wallets</div>
                <div className="text-sm text-muted-foreground">Vodafone Cash, Orange Cash</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="font-medium mb-2">E-Wallets</div>
                <div className="text-sm text-muted-foreground">Fawry, E-Cash</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">HMAC Signature Verification</div>
                  <div className="text-sm text-muted-foreground">Webhook authenticity validated on every request</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">No Sensitive Data Storage</div>
                  <div className="text-sm text-muted-foreground">Card details never stored on our servers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Transaction Reconciliation</div>
                  <div className="text-sm text-muted-foreground">Automatic status tracking and validation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Error Handling & Notifications</div>
                  <div className="text-sm text-muted-foreground">User-friendly error messages and status updates</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Ready to Review Payment Flow?</h2>
            <p className="text-muted-foreground">
              Click below to access the payment integration page
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/recharge')}
              className="gap-2"
            >
              View Payment Integration
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="pt-6 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Test Environment - Sandbox Mode Active</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Full platform access requires authentication</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <Card className="mt-12 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ℹ️ For Review Team
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This is a limited demonstration environment. The complete application is behind 
                authentication and not publicly accessible during closed beta testing.
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                For technical documentation or additional information, please contact the development team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentDemo;