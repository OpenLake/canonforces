import Header from "../common/components/Header/Header";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Footer from "../common/components/Footer/Footer";
import {
  BsArrowRightCircle,
  BsTrophy,
  BsGraphUp,
  BsCalendar3,
  BsAward,
  BsController,
  BsGithub
} from "react-icons/bs";
import dynamic from "next/dynamic";
import Loading from "../common/components/Loading/Loading";

const DynamicHeader = dynamic(() => import("../common/components/Header/Header"), {
  loading: () => <Loading />
});

const DynamicFooter = dynamic(() => import("../common/components/Footer/Footer"), {
  loading: () => <Loading />
});

export default function Home() {
  return (
    <div className="flex flex-col w-full items-center">
      <DynamicHeader />
      <hr className="flex w-9/12 h-px fc-hr border-0" />
      <main className="flex flex-col w-full items-center p-0">
        {/* Hero Section - Centered */}
        <div className="flex flex-col items-center justify-center w-full mt-12 mb-8">
          {/* CanonForces Logo */}
          <div className="mb-8">
            <Image
              src="/images/logo.png"
              width={120}
              height={120}
              alt="CanonForces Logo"
              className="transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>

          {/* Main Heading */}
          <h1 className={`font-bold fc-black ${styles.fs_big} tracking-tight text-center mb-4`}>
            CanonForces
          </h1>

          {/* Tagline */}
          <p className="text-2xl text-gray-600 font-medium mb-8">Learn and code.</p>

          <hr className="flex w-9/12 h-px fc-hr border-0 mb-8" />

          {/* Hero Content - Centered Layout */}
          <div className="flex flex-col lg:flex-row w-9/12 justify-center items-center gap-8">
            {/* Description Box */}
            <div className="flex flex-col items-start bg-black bg-opacity-95 rounded-xl border border-gray-800 shadow-lg px-8 py-7 max-w-xl w-full">
              <p className="text-white text-lg leading-relaxed">
                A <span className="font-medium text-blue-300">coding platform</span> where you can compete with
                fellow coders, friends and random people to learn and improve your coding skills.
                You can showcase your Codeforces profile in an amazing dashboard powered by
                <span className="font-medium text-yellow-300"> CanonForces</span>.
              </p>
            </div>

            {/* Mascot Image */}
            <div className="flex justify-center items-center w-full lg:w-1/2">
              <Image
                className="object-contain transition-transform duration-300 hover:scale-105"
                src="/images/mascot.png"
                width={420}
                height={420}
                alt="CanonForces Mascot"
                priority
              />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section - moved up closer */}
      <div className="w-full mt-10 lg:mt-14 bg-gray-50 py-10 lg:py-12">
        <div className="w-9/12 mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-center fc-black mb-3">
            Why Choose CanonForces?
          </h2>
          {/* Thin divider below title */}
          <div className="flex justify-center mb-8 lg:mb-12">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature Cards with enhanced animations */}
            <div className={`${styles.feature_card} bg-white rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BsController className="text-blue-600" size="1.5em" />
                </div>
                <h3 className="text-lg font-semibold fc-black">1v1 Matches</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Challenge friends or random coders in real-time competitive programming battles.
              </p>
            </div>

            <div className={`${styles.feature_card} bg-white rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BsGraphUp className="text-green-600" size="1.5em" />
                </div>
                <h3 className="text-lg font-semibold fc-black">Track Your CF Rating</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Monitor your Codeforces progress with detailed analytics and beautiful visualizations.
              </p>
            </div>

            <div className={`${styles.feature_card} bg-white rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BsCalendar3 className="text-purple-600" size="1.5em" />
                </div>
                <h3 className="text-lg font-semibold fc-black">Daily Challenges</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Solve curated problems every day to maintain your coding streak and skills.
              </p>
            </div>

            <div className={`${styles.feature_card} bg-white rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BsTrophy className="text-yellow-600" size="1.5em" />
                </div>
                <h3 className="text-lg font-semibold fc-black">Leaderboards</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Compete for the top spots in monthly and weekly competitive programming rankings.
              </p>
            </div>

            <div className={`${styles.feature_card} bg-white rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BsAward className="text-red-600" size="1.5em" />
                </div>
                <h3 className="text-lg font-semibold fc-black">Practice Rooms</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Join topic-specific practice sessions with other coders to improve together.
              </p>
            </div>

            <div className={`${styles.feature_card} bg-white rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BsGraphUp className="text-indigo-600" size="1.5em" />
                </div>
                <h3 className="text-lg font-semibold fc-black">Progress Analytics</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Detailed insights into your coding patterns, strengths, and areas for improvement.
              </p>
            </div>
          </div>

          {/* GitHub Repository Link */}
          <div className="flex justify-center mt-8">
            <a
              href="https://github.com/OpenLake/canonforces"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              <BsGithub size="1.5em" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      <DynamicFooter />
    </div>
  );
}
