"use client";
import { useUserContext } from '@/app/context/Userinfo';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Clock, FileText, ArrowRight, BookOpen, Award, BarChart } from 'lucide-react';
import { useRoadmap } from '@/app/context/RoadmapContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Home() {
  const {contextsetinput,contextinput} = useUserContext();
  const { roadmap,setRoadmap } = useRoadmap();
  const [componentData, setComponentData] = useState(null);
  const [total, setTotal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roadmapId, setRoadmapId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(null);
  const router = useRouter();
  const MODEL_API_SERVER = process.env.NEXT_PUBLIC_MODEL_API_SERVER;
  const DJANGO_API_SERVER = process.env.NEXT_PUBLIC_DJANGO_API_SERVER;

  useEffect(() => {
    if (roadmap?.roadmap_id) {
      setRoadmapId(roadmap.roadmap_id);
      fetchRoadmapData(roadmap.roadmap_id);
      console.log("idhar to aaNA HI CHAHIYE ")
    } else {
      router.push('/');
    }
  }, [roadmap]);

  const fetchComponentData = async (roadmapId, componentNumber) => {
    try {
      if (componentNumber == 0) {
        if(roadmap?.first_component){
          console.log("Setting first component data:", roadmap.first_component);
          setComponentData(roadmap.first_component);
        }else{
          console.log("idahr hai ");
          // console.log("id mil rahi hai",roadmapId)
          try{
            const response = await fetch(`${MODEL_API_SERVER}/roadmaps/${roadmapId}/component`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ component_number: componentNumber }),
            });
      
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
      
            const data = await response.json();
            console.log("Fetched component data:", data);
            // contextsetinput(data.name)
            // console.log("so naam ye hai apna".data.name)
            setComponentData(data.component);
          }
          // setError(null);
          catch(error){
            console.error("Error fetching component data:", error);
          }
        

        }
      }
     else {
        const response = await fetch(`${MODEL_API_SERVER}/roadmaps/${roadmapId}/component`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ component_number: componentNumber }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Fetched component data:", data);
        // contextsetinput(data.name)
        // console.log(data.name)
        setComponentData(data.component);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching component data:", error);
       if (componentNumber == total) {
        setRoadmap({
          roadmap_id: roadmapId,
        });
        router.push('/quiz');
      }
      setError("Failed to fetch component data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchRoadmapData = async (roadmapId) => {
    try {
      const response = await fetch(`${MODEL_API_SERVER}/roadmaps/${roadmapId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setIsCompleted(data.is_completed);
      setTotal(data.roadmap_json.total_components);
      console.log("Total components:", data.roadmap_json.total_components);
      fetchComponentData(roadmapId, data.is_completed);
      // json = JSON.stringify(componentData);
      // chatBot(componentData.name, json);
      console.log( data.is_completed ,roadmapId );
    } catch (error) {
      console.error("Error fetching roadmap data:", error);
      setError("Failed to fetch roadmap data. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Updated isCompleted:", isCompleted);
  }, [isCompleted]);

  

  const handleNextComponent = async () => {
    console.log("Totals", total);
    if (isCompleted +1  < total) {
      try {
        const newCompletedIndex = isCompleted + 1;
        const response = await fetch(`${MODEL_API_SERVER}/roadmaps/${roadmapId}/complete`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_completed: newCompletedIndex }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        setRoadmap({
          roadmap_id: roadmapId,
          total_components: total,
          first_component: roadmap.first_component
        });
    
        router.push('/Learning');
  
      } catch (error) {
        console.error("Error updating completion status:", error);
        setError("Failed to update completion status. Please try again.");
      }
    } else {
      setRoadmap({
        roadmap_id: roadmapId,
      });
      router.push('/quiz');
    }
  };

 
  const handleQuizAnswer = (questionIndex, selectedAnswer) => {
    setQuizAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedAnswer,
    }));
  };

  const checkQuizCompletion = () => {
    if (!componentData || !componentData || !componentData.test_series) {
      setQuizCompleted(false);
      return;
    }

    const allQuestionsAnswered = componentData.test_series.every(
      (_, index) => quizAnswers[index] !== undefined
    );
    setQuizCompleted(allQuestionsAnswered);
  };

    
   

  useEffect(() => {
    checkQuizCompletion();
  }, [quizAnswers]);



  if (isLoading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <motion.div
        {...fadeIn}
        className="bg-neutral-900/30 border border-neutral-800/50 p-8 rounded-2xl backdrop-blur-sm text-center max-w-md mx-4"
      >
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-neutral-200 mb-4">Error</h2>
        <p className="text-neutral-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );

  if (!componentData) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <motion.div
        {...fadeIn}
        className="bg-neutral-900/30 border border-neutral-800/50 p-8 rounded-2xl backdrop-blur-sm text-center max-w-md mx-4"
      >
        <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-200 mb-4">No Content Available</h2>
        <p className="text-neutral-400 mb-6">Please select a learning path to begin.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200"
        >
          Go to Dashboard
        </button>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* {isCompleted === 0 ? ( */}
        <div className="bg-neutral-950 text-white min-h-screen pt-20 pb-8 px-4 overflow-hidden">
          <Head>
            {console.log("idhr aagaya hu me")}
            <title>{componentData.name}</title>
          </Head>
  
          <motion.div {...fadeIn} className="w-full max-w-7xl mx-auto bg-neutral-900/30 border border-neutral-800/50 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-bold text-neutral-100 mb-2">{componentData.name}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <BarChart className="w-5 h-5 text-neutral-400" />
                  <div className="w-full bg-neutral-800/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(((currentComponentIndex+1) / total) * 100)}%` }}
                    />
                  </div>
                  <span className="text-neutral-400 text-sm">
                    {Math.round(((currentComponentIndex+1) / total) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-neutral-400">Component</p>
                  <p className="text-xl font-bold text-neutral-200">
                    {currentComponentIndex + 1} <span className="text-neutral-500">/</span> {total}
                  </p>
                </div>
                <Award className="w-8 h-8 text-blue-500" />
              </div>
            </div>
  
            {/* Video Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {componentData.videos.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-neutral-800/30 rounded-xl overflow-hidden border border-neutral-700/50 hover:border-neutral-600/50 transition-all duration-200"
                >
                  <iframe
                    width="100%"
                    height="200"
                    src={video}
                    title={`${componentData.name} Video ${index + 1}`}
                    frameBorder="0"
                    className="transform transition-all hover:scale-[1.02]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
              ))}
            </motion.div>
  
            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-800/30 p-6 rounded-xl border border-neutral-700/50 mb-8"
            >
              <h2 className="text-xl font-bold text-neutral-200 mb-4">Overview</h2>
              <p className="text-neutral-300">{componentData.description}</p>
            </motion.div>
  
            {/* Supplementary Materials Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 mb-8"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-blue-500" />
                <h3 className="text-xl font-semibold text-neutral-200">Learning Materials</h3>
              </div>
              <div className="bg-neutral-800/30 border border-neutral-700/50 p-6 rounded-xl backdrop-blur-sm">
                <iframe
                  src={componentData.document}
                  width="100%"
                  height="600px"
                  className="rounded-lg mb-6 bg-neutral-900"
                  title="PDF Viewer"
                />
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={componentData.document}
                  download
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200"
                >
                  <FileText size={20} className="mr-2" />
                  <span>Download PDF</span>
                </motion.a>
              </div>
            </motion.div>
            
  
            {/* Next Component Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNextComponent}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold"
            >
              <span>Continue to Next Component</span>
              <ArrowRight />
            </motion.button>
          </motion.div>
        </div>
      
    </>
  );
  
}