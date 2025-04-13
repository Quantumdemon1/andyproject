
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import MainLayout from "@/components/MainLayout";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Get session_id from URL query params
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

  useEffect(() => {
    // Auto redirect after countdown
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/home");
    }
  }, [countdown, navigate]);

  return (
    <MainLayout title="PAYMENT SUCCESS" backButton>
      <div className="flex justify-center items-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
            <CardDescription className="text-center">
              Thank you for your purchase. Your transaction has been completed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center">
                {sessionId ? (
                  <>Your transaction ID: <span className="font-mono text-xs">{sessionId}</span></>
                ) : (
                  "Your purchase has been confirmed."
                )}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                A confirmation email has been sent to your registered email address.
              </p>
              <p className="text-center text-sm">
                Redirecting to home page in {countdown} seconds...
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/home")}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;
