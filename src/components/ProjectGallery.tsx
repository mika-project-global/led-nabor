import React, { useState } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Project {
  id: number;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  review: {
    author: string;
    text: string;
    location: string;
  };
}

export function ProjectGallery() {
  const { t } = useTranslation();
  const [currentProject, setCurrentProject] = useState(0);
  const [showBefore, setShowBefore] = useState(false);

  const projects: Project[] = [
    {
      id: 1,
      title: t('gallery.project_1_title'),
      description: t('gallery.project_1_desc'),
      beforeImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800',
      afterImage: 'https://images.unsplash.com/photo-1600607687644-c7171b46ec11?w=800',
      review: {
        author: 'Thomas Weber',
        text: t('gallery.project_1_review'),
        location: 'Berlin'
      }
    },
    {
      id: 2,
      title: t('gallery.project_2_title'),
      description: t('gallery.project_2_desc'),
      beforeImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      afterImage: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800',
      review: {
        author: 'Marie Dubois',
        text: t('gallery.project_2_review'),
        location: 'Paris'
      }
    },
    {
      id: 3,
      title: t('gallery.project_3_title'),
      description: t('gallery.project_3_desc'),
      beforeImage: 'https://images.unsplash.com/photo-1600607689372-6fb886090705?w=800',
      afterImage: 'https://images.unsplash.com/photo-1600607689872-6fb886090705?w=800',
      review: {
        author: 'Jan Novák',
        text: t('gallery.project_3_review'),
        location: 'Prague'
      }
    }
  ];

  const nextProject = () => {
    setCurrentProject((prev) => (prev + 1) % projects.length);
    setShowBefore(false);
  };

  const prevProject = () => {
    setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
    setShowBefore(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ImageIcon className="text-cyan-600" />
        {t('gallery.title')}
      </h2>

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={prevProject}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextProject}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRight size={24} />
        </button>

        {/* Project Content */}
        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-video mb-4">
            <img
              src={showBefore ? projects[currentProject].beforeImage : projects[currentProject].afterImage}
              alt={projects[currentProject].title}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onMouseDown={() => setShowBefore(true)}
              onMouseUp={() => setShowBefore(false)}
              onMouseLeave={() => setShowBefore(false)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              {t('gallery.press_to_see_before')}
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">{projects[currentProject].title}</h3>
            <p className="text-gray-600">{projects[currentProject].description}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-600 font-medium">
                  {projects[currentProject].review.author[0]}
                </span>
              </div>
              <div>
                <p className="text-gray-600 mb-2">"{projects[currentProject].review.text}"</p>
                <div className="text-sm">
                  <span className="font-medium">{projects[currentProject].review.author}</span>
                  <span className="text-gray-500"> · {projects[currentProject].review.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentProject(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentProject ? 'bg-cyan-500 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}