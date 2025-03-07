"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '@/app/context/RoadmapContext';
import { Timeline } from "@/components/ui/timeline";
import { buttons } from "@/components/Button";
import { motion } from "framer-motion";

const RoadmapCard = ({ title, content, index, total }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="relative group"
  >
    {/* Timeline connector */}
    {index < total - 1 && (
      <div className="absolute left-6 top-[4rem] w-px h-[calc(100%+2rem)] bg-neutral-800 z-0 group-hover:bg-neutral-700 transition-colors" />
    )}

    <div className="flex gap-4 items-start relative z-10">
      {/* Timeline node */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 transition-colors flex items-center justify-center">
        <span className="text-neutral-400 group-hover:text-neutral-200 transition-colors font-medium">
          {index + 1}
        </span>
      </div>

      {/* Content card */}
      <div className="flex-1 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-5 group-hover:bg-neutral-800/50 transition-all duration-300">
        <h3 className="text-lg font-medium text-neutral-200 mb-3">{title}</h3>
        <div className="text-neutral-400">{content}</div>
      </div>
    </div>
  </motion.div>
);

function Timeline_roadmap_function({ roadmapData }) {
  const router = useRouter();
  const { setRoadmap } = useRoadmap();

  console.log("Timeline", roadmapData.first_component);

  if (!roadmapData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="border border-neutral-800 p-8 rounded-xl">
          <p className="text-neutral-400 text-lg">
            No roadmap data available. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const timelineData = roadmapData.roadmap.map((component, index) => ({
    id: index + 1,
    title: component.name,
    content: (
      <div className="space-y-2">
        <p className="text-neutral-400 leading-relaxed">
          {component.description}
        </p>
        {component.skills && (
          <div className="flex flex-wrap gap-2 mt-2">
            {component.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-neutral-800/50 rounded-full text-xs text-neutral-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    ),
  }));

  const playlistButton = buttons.find(button => button.name === "Playlist");

  const handleButtonClick = () => {
    setRoadmap({
      roadmap_id: roadmapData.roadmap_id,
      total_components: roadmapData.total_components,
      first_component: roadmapData.first_component
    });

    router.push('/Learning');
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-6"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-200 mb-4">
            Learning Roadmap
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-neutral-400" />
            <p className="text-neutral-400">
              Total Components: {roadmapData.total_components}
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="space-y-8">
            {timelineData.map((item, index) => (
              <RoadmapCard
                key={item.id}
                title={item.title}
                content={item.content}
                index={index}
                total={timelineData.length}
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        {timelineData.length > 0 && playlistButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md">
              {React.cloneElement(playlistButton.component, {
                onClick: handleButtonClick,
                className: "w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium py-4 px-6 rounded-lg transition-all duration-300 border border-neutral-700 hover:border-neutral-600"
              }, "START LEARNING")}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Timeline_roadmap_function;
