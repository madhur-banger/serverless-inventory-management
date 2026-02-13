import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Package,
  ExternalLink,
  Database,
  Cloud,
  Workflow,
  Zap,
  Lock,
  GitBranch,
  CheckCircle,
  ArrowRight,
  Server,
  Globe,
  Code,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes drawLine {
          from { height: 0; }
          to { height: 100%; }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }

        .opacity-0 { opacity: 0; }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
        }

        .flow-line {
          animation: drawLine 1.5s ease-out forwards;
        }

        .badge-hover {
          transition: all 0.2s ease;
        }

        .badge-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base sm:text-lg text-foreground">
              Serverless Inventory
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
            >
              <Button variant="outline" size="sm">
                API Docs
              </Button>
            </a>

            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>

            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT - Hero Content */}
          <div className={`${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium mb-6 border">
              <Zap className="h-3 w-3" />
              Production-Ready AWS Serverless
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground">
              Enterprise Inventory
              <br />
              <span className="text-muted-foreground">Built on AWS Cloud</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl leading-relaxed">
              Full-stack serverless application with REST API, authentication, async processing, and automated CI/CD. Built with AWS Lambda, API Gateway, and DynamoDB.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-base px-8 py-6">
                  Launch Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <a
                href="https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-base px-8 py-6"
                >
                  View API Docs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-2">
              {['AWS Lambda', 'API Gateway', 'DynamoDB', 'React', 'Cognito', 'CI/CD'].map((tech, idx) => (
                <span
                  key={tech}
                  className={`px-3 py-1.5 bg-card border rounded-full text-xs font-medium text-card-foreground badge-hover ${isVisible ? 'animate-fadeIn' : 'opacity-0'} delay-${(idx + 3) * 100}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT - Architecture Flow */}
          <div className={`${isVisible ? 'animate-slideInRight delay-300' : 'opacity-0'}`}>
            <div className="relative bg-card border rounded-2xl p-6 sm:p-8 shadow-lg card-hover">
              <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-md">
                Live System
              </div>

              <h3 className="text-foreground font-semibold text-lg mb-6 flex items-center gap-2">
                <Server className="h-5 w-5" />
                Architecture Flow
              </h3>

              <div className="space-y-3 relative">
                {/* Flow Steps */}
                {[
                  { icon: Globe, label: 'API Gateway' },
                  { icon: Zap, label: 'Lambda Functions' },
                  { icon: Database, label: 'DynamoDB' },
                  { icon: Workflow, label: 'SQS Queue' },
                  { icon: Server, label: 'Async Processing' },
                  { icon: CheckCircle, label: 'SNS Notifications' },
                ].map((step, idx) => (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 ${isVisible ? 'animate-slideInLeft' : 'opacity-0'} delay-${(idx + 4) * 100}`}
                  >
                    <div className="p-2 bg-secondary rounded-lg">
                      <step.icon className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{step.label}</span>
                    {idx < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />}
                  </div>
                ))}

                {/* Connecting Line */}
                {/* <div className="absolute left-5 top-0 w-0.5 h-full bg-border overflow-hidden">
                  <div className="w-full bg-muted-foreground flow-line"></div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built with Best Practices
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Production-grade implementation with enterprise patterns and AWS services
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Cloud,
              title: 'Serverless Architecture',
              description: 'AWS Lambda functions with API Gateway for scalable, cost-effective REST API',
            },
            {
              icon: Database,
              title: 'DynamoDB Design',
              description: 'Single-table design with GSIs for optimized queries and data access patterns',
            },
            {
              icon: Lock,
              title: 'AWS Cognito Auth',
              description: 'Secure authentication and authorization with JWT tokens and user pools',
            },
            {
              icon: Workflow,
              title: 'Async Processing',
              description: 'SQS queues for reliable background jobs with retry logic and dead-letter queues',
            },
            {
              icon: GitBranch,
              title: 'CI/CD Pipeline',
              description: 'Automated deployments with GitHub Actions supporting multi-stage environments',
            },
            {
              icon: Code,
              title: 'React Frontend',
              description: 'Modern responsive UI with Tailwind CSS and shadcn/ui components',
            },
          ].map((feature, idx) => (
            <div
              key={feature.title}
              className={`bg-card border rounded-xl p-6 card-hover ${isVisible ? 'animate-scaleIn' : 'opacity-0'} delay-${(idx + 2) * 100}`}
            >
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20 border-t">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 sm:p-12 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Infrastructure as Code
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-6">
                Fully automated AWS infrastructure using Serverless Framework with modular, maintainable architecture
              </p>
              <ul className="space-y-3">
                {[
                  'Multi-stage deployments (dev, prod)',
                  'Lambda layers for shared dependencies',
                  'Custom domain with Route53',
                  'CloudWatch logs and monitoring',
                  'SNS topics for notifications',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-80" />
                    <span className="text-primary-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-auto text-xs text-primary-foreground/60">serverless.yml</span>
              </div>
              <div className="space-y-2 text-primary-foreground/90">
                <div>service: inventory-api</div>
                <div className="pl-4">provider:</div>
                <div className="pl-8">name: aws</div>
                <div className="pl-8">runtime: nodejs18.x</div>
                <div className="pl-4">functions:</div>
                <div className="pl-8">createProduct:</div>
                <div className="pl-12 text-primary-foreground/60">handler: src/handlers</div>
                <div className="pl-8">listProducts:</div>
                <div className="pl-12 text-primary-foreground/60">handler: src/handlers</div>
                <div className="animate-pulse text-primary-foreground/60">▊</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20 border-t">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Explore?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Test the complete CRUD functionality through the UI or interact directly with the REST API
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <Button className="text-base px-8 py-6">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <a
              href="https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="text-base px-8 py-6">
                Explore API
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Serverless Inventory System
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Cloud className="h-4 w-4" />
                AWS
              </span>
              <span className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                React
              </span>
              <span className="flex items-center gap-1">
                <Server className="h-4 w-4" />
                Serverless
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
            Built with AWS Lambda · API Gateway · DynamoDB · Cognito · React · Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}