import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Crypto MSR</title>
        <meta name="description" content="Privacy Policy for Crypto MSR application" />
      </Helmet>
      
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">Privacy Policy</CardTitle>
              <p className="text-center text-muted-foreground">Last updated: December 26, 2024</p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Welcome to Crypto MSR. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and safeguard your information when you use our application.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
                <p className="text-muted-foreground">We may collect the following types of information:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Account information (email, name, profile details)</li>
                  <li>Wallet addresses for cryptocurrency transactions</li>
                  <li>Usage data and analytics</li>
                  <li>Device information and IP addresses</li>
                  <li>Pi Network authentication data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
                <p className="text-muted-foreground">We use your information to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Communicate with you about updates and features</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your personal data against unauthorized access, 
                  alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">5. Third-Party Services</h2>
                <p className="text-muted-foreground">
                  Our application may integrate with third-party services including Pi Network, Solana blockchain, 
                  and payment processors. These services have their own privacy policies governing their use of your data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent at any time</li>
                  <li>Export your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                  and provide personalized content. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">8. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting 
                  the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">9. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us through our support channels.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
