"use client"
import { useUserContext } from '@/app/context/Userinfo';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import PrevCources from '@/components/PrevCources';
import { Calendar, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { useRouter, useParams } from 'next/navigation';
import Webcam from 'react-webcam';

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-neutral-950" />
    <div className="absolute inset-0 bg-grid-small-white/[0.05] -z-10" />
    <div className="absolute inset-0 bg-dot-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
    <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent" />
  </div>
);

const FriendCard = ({ friend }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl flex items-center space-x-4 hover:bg-neutral-800/50 transition-colors backdrop-blur-sm"
  >
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200">
      {friend.name.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-neutral-200 font-medium truncate">{friend.name}</h4>
      <p className="text-sm text-neutral-400 truncate">{friend.status}</p>
    </div>
    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-neutral-600'}`} />
  </motion.div>
);

const InterviewSlotCard = ({ slot, onJoinMeet }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="border border-neutral-700 p-4 rounded-lg bg-neutral-800/50 backdrop-blur-sm hover:bg-neutral-800 transition-all"
  >
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="space-y-1">
        <h4 className="text-neutral-200 font-semibold text-lg">{slot.internship_name}</h4>
        <p className="text-neutral-400 text-sm">{slot.company_name}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <p className="text-neutral-400 text-sm">{new Date(slot.interviw_time).toLocaleString()}</p>
        {slot.is_selected && (
          <button
            onClick={() => onJoinMeet(slot)}
            className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 rounded-full text-white text-sm font-medium hover:from-green-500 hover:to-green-600 transition-all"
          >
            Join Meet
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

const UserInfoPage = () => {
  const { email, name, isLoggedIn } = useAuth();
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    role: '',
    joinDate: '',
    lastActive: '',
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en',
    }
  });
  const [interviewSlots, setInterviewSlots] = useState([]);
  const [interviewreview, setInterviewreview] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);
  const { data: session } = useSession();
  const { contextsetIsLoggedIn, contextsetEmail, contextsetName, contextisLoggedIn, setcontextInterviewdeets, contextInterviewdeets } = useUserContext(); // Updated hook

  const Getuserinfo = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.log("no token")
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/user', {
        method: 'GET',
        headers: {
          "Authorization": token,
          'Content-Type': "application/json",
        },
        credentials: 'include',
      });

      // Log the response status and status text
      console.log('Response Status:', response.status, response.statusText);

      // Check if the response is not OK (status code 200-299)
      if (!response.ok) {
        // Log more detailed error information
        const errorText = await response.text();
        console.error('Error Response:', errorText);

        // Handle specific HTTP error codes
        if (response.status === 401) {
          console.error('Unauthorized: Check your token and permissions.');
        } else if (response.status === 404) {
          console.error('Not Found: The requested resource does not exist.');
        } else {
          console.error(`HTTP Error: ${response.statusText}`);
        }

        // Optionally, throw an error to be caught by the catch block
        throw new Error(`HTTP Error: ${response.statusText}`);
      }

      // Parse the JSON response if the request was successful
      const result = await response.json();

      setInterviewSlots(result.interview_selected);
      setInterviewreview(result.internship_under_review);

      // Proceed with handling the successful response
      // ...
      // Update context with user information
      contextsetIsLoggedIn(true);
      contextsetEmail(result.email);
      contextsetName(result.name);

    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    Getuserinfo();
  }, [contextisLoggedIn]);

  const router = useRouter();

  const handleUpdatePreferences = async (key, value) => {
    setUserDetails(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
    // Add API call to update preferences here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const friends = [
    { id: 1, name: 'Sarah Chen', status: 'Working on Web Development', isOnline: true },
    { id: 2, name: 'Mike Johnson', status: 'Learning React', isOnline: false },
    { id: 3, name: 'Emily Davis', status: 'Studying Data Structures', isOnline: true },
    { id: 4, name: 'Alex Thompson', status: 'Practicing Algorithms', isOnline: true },
    { id: 5, name: 'Jessica Lee', status: 'Taking a break', isOnline: false },
  ];

  const handleJoinMeet = (slot) => {
    // Set the context with the interview details
    setcontextInterviewdeets(slot);
    router.push('/AiInterview');
    console.log(contextInterviewdeets);
    // Optionally, you can navigate to another page or perform additional actions here
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log(imageSrc); // Log the captured image to the console
    setCapturedImage(imageSrc);
    setIsCameraOpen(false); // Close the camera preview after taking the picture
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-12 px-4 bg-neutral-950">
      <HeroBackground />

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-200 mb-2">User Profile</h1>
          <p className="text-neutral-400">Manage your account settings and preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900/50 border border-neutral-800 p-4 sm:p-6 rounded-2xl backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="m-2">
                <AnimatedTooltip
                  items={[{
                    id: 1,
                    name: session?.user?.name || "User",
                    designation: "Member",
                    image: session?.user?.image || "/default-avatar.png",
                  }]}
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-200">{session?.user?.name}</h2>
                <p className="text-sm text-neutral-400">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-neutral-800/50 px-4 py-2 rounded-full">
                <h1 className="text-neutral-200 text-sm sm:text-base">Points: 100</h1>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-900/50 border border-neutral-800 p-4 sm:p-6 rounded-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-neutral-200" />
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-200">Friends</h3>
              </div>
              <span className="text-sm text-neutral-400">{friends.length} friends</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900/50 border border-neutral-800 p-4 sm:p-6 rounded-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-neutral-200" />
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-200">Interview Slots</h3>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {interviewSlots.length > 0 ? (
                interviewSlots.map((slot) => (
                  <InterviewSlotCard
                    key={slot.id}
                    slot={slot}
                    onJoinMeet={handleJoinMeet}
                  />
                ))
              ) : (
                <p className="text-neutral-400 text-center py-4">No interview slots scheduled</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900/50 border border-neutral-800 p-4 sm:p-6 rounded-2xl backdrop-blur-sm lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-neutral-200" />
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-200">Interviews under Review</h3>
              </div>
              <span className="text-sm text-neutral-400">{interviewreview.length} interviews</span>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {interviewreview.length > 0 ? (
                interviewreview.map((slot) => (
                  <InterviewSlotCard
                    key={slot.id}
                    slot={slot}
                    onJoinMeet={handleJoinMeet}
                  />
                ))
              ) : (
                <p className="text-neutral-400 text-center py-4 sm:col-span-2">No interviews under review</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-neutral-900/50 border border-neutral-800 p-4 sm:p-6 rounded-2xl backdrop-blur-sm lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-200">Capture Photo</h3>
              <button
                onClick={() => setIsCameraOpen(!isCameraOpen)}
                className="bg-neutral-800/50 px-4 py-2 rounded-full text-neutral-200 text-sm sm:text-base"
              >
                {isCameraOpen ? 'Close Camera' : 'Open Camera'}
              </button>
            </div>
            {isCameraOpen && (
              <div className="flex flex-col items-center">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full max-w-md rounded-lg"
                />
                <button
                  onClick={capture}
                  className="bg-neutral-800/50 px-4 py-2 rounded-full text-neutral-200 text-sm sm:text-base mt-4"
                >
                  Capture Photo
                </button>
              </div>
            )}
            {capturedImage && (
              <div className="flex flex-col items-center mt-4">
                <img src={capturedImage} alt="Captured" className="w-full max-w-md rounded-lg" />
                <p className="text-neutral-400 text-center py-4">You have captured a photo!</p>
              </div>
            )}
          </motion.div>
        </div>

        <PrevCources />
      </div>
    </div>
  );
};

export default UserInfoPage;
