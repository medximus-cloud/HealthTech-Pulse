import React, { useState } from 'react';
import { Platform, ContentType, TrendItem, Source } from '../types';
import { Button } from './Button';
import { getTrendingNews } from '../services/geminiService';

interface InputSectionProps {
  onGenerate: (input: string, platform: Platform, contentType: ContentType) => void;
  isGenerating: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isGenerating }) => {
  const [input, setInput] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.LINKEDIN);
  const [contentType, setContentType] = useState<ContentType>(ContentType.NEWS_ANALYSIS);
  
  const [showTrends, setShowTrends] = useState(false);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [trendSources, setTrendSources] = useState<Source[]>([]);
  const [trendError, setTrendError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGenerate(input, platform, contentType);
    }
  };

  const handleFetchTrends = async () => {
    setIsFetchingTrends(true);
    setTrendError(null);
    setShowTrends(true);
    try {
      const result = await getTrendingNews();
      setTrends(result.trends);
      setTrendSources(result.sources);
    } catch (err: any) {
      setTrendError("Failed to fetch trending news. Please try again.");
      console.error(err);
    } finally {
      setIsFetchingTrends(false);
    }
  };

  const handleSelectTrend = (trend: TrendItem) => {
    const text = `${trend.headline}\n\n${trend.summary}`;
    setInput(text);
    setContentType(ContentType.NEWS_ANALYSIS); // Trends are usually for analysis
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInputPlaceholder = () => {
    switch (contentType) {
      case ContentType.POLL:
        return "e.g., Topic: AI in Radiology vs. Human Radiologists. What do you want to ask?";
      case ContentType.QUESTION:
        return "e.g., Topic: The ethical implications of gene editing. Want to start a debate?";
      case ContentType.VIDEO_SCRIPT:
        return "e.g., Explain mRNA technology like I'm 5, or show the future of robotic surgery.";
      case ContentType.NEWS_ANALYSIS:
      default:
        return "e.g., New startup raises Series A for longevity research or FDA approves AI...";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M8 15l4 3 4-3"/></svg>
          Content Generator
        </h2>
        <Button 
            type="button" 
            variant="outline" 
            onClick={handleFetchTrends}
            disabled={isFetchingTrends || isGenerating}
            className="text-xs sm:text-sm py-1.5 px-3"
        >
          {isFetchingTrends ? (
             'Scanning...' 
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-teal-600"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              Discover Trends
            </>
          )}
        </Button>
      </div>

      {showTrends && (
        <div className="mb-8 bg-slate-50 rounded-xl p-4 border border-slate-200 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-700">Trending in Health Innovation (Last Month)</h3>
            <button onClick={() => setShowTrends(false)} className="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {isFetchingTrends ? (
             <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <svg className="animate-spin h-6 w-6 text-teal-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Scanning latest news & innovations...</span>
             </div>
          ) : trendError ? (
            <p className="text-red-500 text-sm">{trendError}</p>
          ) : trends.length > 0 ? (
            <div className="space-y-3">
              {trends.map((trend, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{trend.headline}</h4>
                  <p className="text-slate-600 text-xs mb-2 line-clamp-2">{trend.summary}</p>
                  <button 
                    onClick={() => handleSelectTrend(trend)}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline flex items-center"
                  >
                    Use this topic
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              ))}
              
              {trendSources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Sources Scanned</p>
                  <div className="flex flex-wrap gap-2">
                    {trendSources.slice(0, 4).map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-500 hover:underline truncate max-w-[150px]"
                        title={source.title}
                      >
                        {source.title || new URL(source.uri).hostname}
                      </a>
                    ))}
                    {trendSources.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{trendSources.length - 4} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
             <p className="text-slate-500 text-sm">No trends found.</p>
          )}
        </div>
      )}

      {/* Content Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {[
          { type: ContentType.NEWS_ANALYSIS, icon: '📰', label: 'News Analysis' },
          { type: ContentType.POLL, icon: '📊', label: 'Poll Idea' },
          { type: ContentType.QUESTION, icon: '💬', label: 'Discussion' },
          { type: ContentType.VIDEO_SCRIPT, icon: '🎬', label: 'Video Script' },
        ].map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => setContentType(item.type)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
              contentType === item.type 
              ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="input-content" className="block text-sm font-semibold text-slate-700 mb-2">
            What is your topic?
          </label>
          <textarea
            id="input-content"
            className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
            placeholder={getInputPlaceholder()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
            required
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-slate-700 mb-2">Target Platform</span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPlatform(Platform.LINKEDIN)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                platform === Platform.LINKEDIN
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn
            </button>
            <button
              type="button"
              onClick={() => setPlatform(Platform.TWITTER)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                platform === Platform.TWITTER
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              X / Twitter
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            isLoading={isGenerating} 
            className="w-full py-3 text-lg"
          >
            {isGenerating ? 'Generating Content...' : `Generate ${contentType}`}
          </Button>
        </div>
      </form>
    </div>
  );
};