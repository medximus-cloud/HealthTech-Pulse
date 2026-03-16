import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { ResultCard } from './components/ResultCard';
import { ScheduledPostsList } from './components/ScheduledPostsList';
import { GenerationResult, Platform, GenerationStep, ScheduledPost, ContentType } from './types';
import { generateHealthTechContent, findRelatedImage } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'schedule'>('generate');
  
  const [result, setResult] = useState<GenerationResult>({
    content: null,
    imageUrl: null,
    isLoading: false,
    error: null,
  });
  
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [currentResultPlatform, setCurrentResultPlatform] = useState<Platform>(Platform.LINKEDIN);

  const handleGenerate = async (input: string, selectedPlatform: Platform, contentType: ContentType) => {
    // Switch to generate tab automatically
    setActiveTab('generate');
    setCurrentResultPlatform(selectedPlatform);
    
    setResult({ content: null, imageUrl: null, isLoading: true, error: null });

    try {
      // Step 1: Generate Text and Search Query based on Content Type
      const generatedContent = await generateHealthTechContent(input, selectedPlatform, contentType);
      
      setResult(prev => ({
        ...prev,
        content: generatedContent,
      }));

      // Step 2: Find Related Image (Search for a Thumbnail or contextual image)
      const imageUrl = await findRelatedImage(generatedContent.imagePrompt);

      setResult(prev => ({
        ...prev,
        imageUrl: imageUrl || null, // Handle empty string
        isLoading: false,
      }));

    } catch (error: any) {
      console.error("Generation failed:", error);
      setResult(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "An unexpected error occurred. Please try again.",
      }));
    }
  };

  const handleSchedulePost = (date: string, updatedText: string) => {
    if (!result.content || !result.imageUrl) return;

    // Use the updated text from the editor
    const contentToSchedule = {
      ...result.content,
      postText: updatedText
    };

    const newPost: ScheduledPost = {
      id: crypto.randomUUID(),
      content: contentToSchedule,
      imageUrl: result.imageUrl,
      platform: currentResultPlatform,
      scheduledDate: date,
      createdAt: Date.now(),
    };

    setScheduledPosts(prev => [...prev, newPost]);
    alert(`Post scheduled for ${new Date(date).toLocaleString()}`);
    setActiveTab('schedule'); // Switch to schedule tab to show it
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Are you sure you want to remove this scheduled post?')) {
      setScheduledPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
              H
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
              HealthTech Pulse
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Powered by Gemini 2.5 & 3.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Create Engaging <br/>
                <span className="text-teal-600">Health Content</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Generate thought leadership, polls, discussion questions, or video scripts backed by real-world imagery for LinkedIn and X.
              </p>
            </div>
            <InputSection 
              onGenerate={handleGenerate} 
              isGenerating={result.isLoading} 
            />
            
             <div className="mt-8 text-center text-xs text-slate-400">
                <p>Generates content and searches for images using <strong>Gemini 3 Flash</strong>.</p>
             </div>
          </div>

          {/* Right Column: Output & Schedule */}
          <div className="h-full min-h-[500px] flex flex-col">
            {/* Tabs */}
            <div className="flex bg-slate-200 p-1 rounded-t-2xl rounded-b-none w-fit self-start ml-1 lg:ml-0">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors ${activeTab === 'generate' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Current Draft
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Scheduled Queue
                {scheduledPosts.length > 0 && (
                  <span className="bg-teal-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{scheduledPosts.length}</span>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-xl border border-slate-100 flex-1 overflow-hidden">
               {activeTab === 'generate' ? (
                 <ResultCard 
                   result={result} 
                   currentPlatform={currentResultPlatform}
                   onSchedule={handleSchedulePost}
                 />
               ) : (
                 <ScheduledPostsList 
                   posts={scheduledPosts} 
                   onDelete={handleDeletePost} 
                 />
               )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;