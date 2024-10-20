import React from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">KSS Woodshop Safety</CardTitle>
          <CardDescription>Empowering safe and skilled woodworking practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold mb-2">Welcome the KSS Woodshop Safety Hub</h2>
              <p className="mb-4">Enhance your skills, stay safe, and track your progress in woodworking.</p>
              <div className="space-x-4">
                <Button onClick={onLoginClick} className="bg-blue-500 hover:bg-blue-600">Login</Button>
                <Button onClick={onRegisterClick} variant="outline">Register</Button>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src="/kss_logo.png" 
                alt="Woodworking Safety" 
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Safety First", description: "Access comprehensive safety guides for all tools" },
              { title: "Skill Tracking", description: "Monitor your progress" },
              { title: "Interactive Learning", description: "Engage with quizzes, review incorrect questions and more..." }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-gray-500">
        <p>© 2024 @baughtnet IT Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
