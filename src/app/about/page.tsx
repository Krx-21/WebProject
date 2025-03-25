'use client';

import { useEffect, useState } from 'react';

interface TeamMember {
  name: string;
  id: string;
  discord: string;
  image: string;
  role: string;
}

export default function About() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const teamMembers: TeamMember[] = [
    {
      name: "Kritchaya Chaowajareun",
      id: "6733007821",
      discord: "_snezh21",
      image: "/team/member1.png", // ถ้ามีรูป ให้ใส่path ที่ถูกต้อง
      role: "Frontend Developer"
    },
    {
      name: "Wiritpol Poonnak",
      id: "6733244121",
      discord: "n330",
      image: "/team/member2.png",
      role: "Backend Developer"
    },
    {
      name: "Watchirawit Srisoonthornkasem",
      id: "6733225221",
      discord: "ebuueaelwhwaaneynyaakepnhwaanaic",
      image: "/team/member3.png",
      role: "Full Stack Developer"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About DriveEasy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We are a team of passionate developers creating the best car rental booking platform
            for your convenience.
          </p>
        </div>

        {/* Team Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-12">
            Meet Our Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-r from-blue-500 to-purple-600">
                  <div className="flex items-center justify-center h-48">
                    {/* ถ้าไม่มีรูป ใช้ตัวอักษรย่อแทน */}
                    <span className="text-4xl font-bold text-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {member.role}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Student ID: </span>
                      <span className="text-gray-600 dark:text-gray-400">{member.id}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Discord: </span>
                      <span className="text-gray-600 dark:text-gray-400">{member.discord}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Get in Touch
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Department of Computer Engineering<br />
            Chulalongkorn University<br />
            Bangkok, Thailand
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}