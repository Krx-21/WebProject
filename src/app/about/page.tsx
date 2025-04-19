'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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
      image: "/team/Kritchaya.png",
      role: "Full Stack Developer"
    },
    {
      name: "Pokpong Sukjai",
      id: "6733131921",
      discord: "dekdee1653",
      image: "/team/Pokpong.png",
      role: "Full Stack Developer"
    },
    {
      name: "Sohara Mahamad",
      id: "6733053621",
      discord: "60sec._",
      image: "/team/Sohara.png",
      role: "Full Stack Developer"
    },
    {
      name: "Tarmeesee Daoh",
      id: "6733076021",
      discord: "tatada5294",
      image: "/team/Tarmeesee.png",
      role: "Full Stack Developer"
    },
    {
      name: "Thanpisit Naowapradit",
      id: "6733105621",
      discord: "ethanw1nter",
      image: "/team/Thanpisit.png",
      role: "Full Stack Developer"
    },
    {
      name: "Tripob Pongpanich",
      id: "6733077721",
      discord: "taiwmj",
      image: "/team/Tripob.png",
      role: "Full Stack Developer"
    },
    {
      name: "Watchirawit Srisoonthornkasem",
      id: "6733225221",
      discord: "ebuueaelwhwaaneynyaakepnhwaanaic",
      image: "/team/Watchirawit.png",
      role: "Full Stack Developer"
    },
    {
      name: "Wiritpol Poonnak",
      id: "6733244121",
      discord: "n330",
      image: "/team/Wiritpol.png",
      role: "Full Stack Developer"
    },
    {
      name: "Worapob Pongpanich",
      id: "6733228121",
      discord: "sunnnn2428",
      image: "/team/Worapob.png",
      role: "Full Stack Developer"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-teal-900/20"></div>

        <div className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 dark:from-indigo-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent animate-fade-in-up">
              About Rent a Ride
            </h1>

            <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 mx-auto mb-10 rounded-full animate-width-expand"></div>

            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              We are a team of passionate developers creating the best car rental booking platform
              for your convenience. Our mission is to make car rentals simple, accessible, and enjoyable for everyone.
            </p>

            <div className="mt-12 flex justify-center space-x-6 animate-fade-in-up animation-delay-400">
              <a href="#team" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                Meet Our Team
              </a>
              <a href="#contact" className="px-8 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg shadow-md hover:shadow-lg border border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 transform hover:-translate-y-1">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">

        <div id="team" className="max-w-7xl mx-auto py-20">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 dark:from-indigo-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent mb-4">
              Meet Our Team
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our talented team of developers is dedicated to creating the best car rental experience for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className={`bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900/80 rounded-xl shadow-lg overflow-hidden transform
                  transition-all duration-500 hover:-translate-y-2 hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50
                  animate-fade-in-up`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="relative h-[280px] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                <div className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full -mt-12 -mr-12"></div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative">
                    {member.name}
                  </h3>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 mb-4"></div>
                  <p className="text-md font-medium text-indigo-600 dark:text-indigo-400 mb-4 relative">
                    {member.role}
                  </p>
                  <div className="space-y-3 relative">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Student ID</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Discord</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.discord}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="contact" className="py-20 relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600"></div>

            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 dark:from-indigo-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent mb-4">
                  Get in Touch
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 mx-auto mb-6 rounded-full"></div>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Have questions or feedback? We&apos;d love to hear from you!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Address</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Department of Computer Engineering<br />
                        Chulalongkorn University<br />
                        Bangkok, Thailand
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
                      <p className="text-slate-600 dark:text-slate-400">contact@rentaride.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Connect With Us</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">Follow our project on GitHub to stay updated with the latest developments.</p>

                  <div className="flex justify-center space-x-6">
                    <a
                      href="https://github.com/Krx-21/WebProject"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <svg className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub Repository
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}