import Header from "../common/components/Header/Header";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Footer from "../common/components/Footer/Footer";
import {
  BsArrowRightCircle,
  BsGraphUp,
  BsCalendar3,
  BsAward,
  BsController,
  BsTrophy
} from "react-icons/bs";
import dynamic from "next/dynamic";
import Loading from "../common/components/Loading/Loading";

const DynamicHeader = dynamic(() => import("../common/components/Header/Header"), {
  loading: () => <Loading />
});

const DynamicFooter = dynamic(() => import("../common/components/Footer/Footer"), {
  loading: () => <Loading />
});

const ContestsSidebar = dynamic<{}>(
  () => import("../common/components/ContestsSidebar/ContestsSidebar").then(mod => mod.ContestsSidebar),
  { 
    loading: () => <div className="w-80"><Loading /></div>,
    ssr: false
  }
);

export default function Home() {
  return (
    <div className="flex flex-col w-full items-center">
      <DynamicHeader />
      <hr className="flex w-9/12 h-px fc-hr border-0" />
      <div className="flex w-full max-w-7xl px-4">
        <main className="flex-1 max-w-4xl mx-auto">
        <h1 className={`f-100 font-bold fc-black ${styles.fs_big} tracking-tight`}>
          LEARN & CODE
        </h1>
        <hr className="flex w-9/12 h-px fc-hr border-0" />

        {/* Hero Section with Black Box and Image */}
        <div className="flex flex-col lg:flex-row w-9/12 justify-center items-center gap-8 mt-8">
          {/* Black Box Side Text */}
          <div className="flex flex-col items-start bg-black bg-opacity-95 rounded-xl border border-gray-800 shadow-lg px-8 py-7 max-w-xl w-full mb-4 lg:mb-0">
            <p className="text-white text-lg leading-relaxed mb-6">
              A <span className="font-medium text-blue-300">coding platform</span> where you can compete with
              fellow coders, friends and random people to learn and improve your coding skills.
              You can showcase your Codeforces profile in an amazing dashboard powered by
              <span className="font-medium text-yellow-300"> canonforces</span>.
            </p>
            <div className="flex flex-row gap-4 w-full">
              {/* Explore Button (Blue) */}
             <button className={`${styles.button_blue}`}>Explore</button>  

              {/* Dashboard Button (Black) */}
              <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200 hover:scale-105 flex items-center gap-2 w-1/2">
                Dashboard
                <BsArrowRightCircle size={"1.3em"} className="transition-transform duration-200 hover:translate-x-1" />
              </button>
            </div>
          </div>
          {/* Image Section */}
          <div className="flex justify-center items-center w-full lg:w-1/2">
            <Image
              className="w-85 h-85 object-contain transition-transform duration-300 hover:scale-105"
              src="/images/image.png"
              width={420}
              height={420}
              alt="CanonForces Platform"
              priority
            />
          </div>
        </div>
        </main>
        
        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 ml-8 space-y-6">
          <ContestsSidebar />
        </aside>
      </div>

      {/* Mobile Contests Section */}
      <div className="lg:hidden w-full px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ContestsSidebar />
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full mt-10 lg:mt-14 bg-gray-50 py-10 lg:py-12">
        <div className="w-full max-w-4xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center fc-black mb-8 lg:mb-12">
            Why Choose CanonForces?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature Cards */}
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
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
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
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
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
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
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
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
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
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
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
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
        </div>
      </div>

      {/* Call to Action Buttons */}
      <div className="w-full flex justify-center py-8 bg-white px-4">
        <div className="w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Start Competing Now Button (Blue) */}
           <button className={`${styles.button_blue} hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg shadow transition-all duration-200 hover:scale-105`}>
            Start Competing Now
          </button>
          {/* View Demo Button (Black) */}
          <button className="bg-black hover:bg-gray-900 text-white font-semibold px-8 py-3 rounded-lg shadow transition-all duration-200 hover:scale-105 flex items-center gap-2">
            View Demo
            <BsArrowRightCircle size={"1.3em"} />
          </button>
        </div>
        </div>
      </div>

      <DynamicFooter />
    </div>
  );
}
