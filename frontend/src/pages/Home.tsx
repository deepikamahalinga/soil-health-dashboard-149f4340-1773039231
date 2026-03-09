import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Statistic {
  value: string;
  label: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const Home: FC = () => {
  const stats: Statistic[] = [
    { value: '10M+', label: 'Soil Reports Analyzed' },
    { value: '5M+', label: 'Farmers Helped' },
    { value: '28', label: 'States Covered' },
  ];

  const features: Feature[] = [
    {
      title: 'Visual Insights',
      description: 'Interactive charts and graphs to understand your soil health data',
      icon: '📊'
    },
    {
      title: 'Personalized Recommendations',
      description: 'Get tailored fertilizer and crop suggestions based on your soil analysis',
      icon: '🌱'
    },
    {
      title: 'Regional Analysis',
      description: 'Compare your soil health with regional averages and trends',
      icon: '🗺️'
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Soil Health Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empowering Indian farmers with data-driven insights for better soil management and crop yields
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reports" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
              View Soil Reports
            </Link>
            <Link to="/about" className="bg-white text-green-600 px-8 py-3 rounded-lg border-2 border-green-600 hover:bg-green-50 transition-colors">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-green-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to improve your soil health?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get started today with our comprehensive soil analysis tools and recommendations
          </p>
          <Link
            to="/signup"
            className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;