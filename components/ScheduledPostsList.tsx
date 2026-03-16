import React from 'react';
import { ScheduledPost, Platform } from '../types';

interface ScheduledPostsListProps {
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
}

export const ScheduledPostsList: React.FC<ScheduledPostsListProps> = ({ posts, onDelete }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p className="text-lg font-medium text-slate-500">No posts scheduled yet</p>
        <p className="text-sm mt-2">Generate content and pick a date to add it to your queue.</p>
      </div>
    );
  }

  // Sort posts by date
  const sortedPosts = [...posts].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  return (
    <div className="space-y-4 p-6 overflow-y-auto h-full max-h-[600px]">
      {sortedPosts.map((post) => {
        const date = new Date(post.scheduledDate);
        return (
          <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${post.platform === Platform.LINKEDIN ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  {post.platform}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button 
                onClick={() => onDelete(post.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Remove from queue"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-slate-700 line-clamp-3 whitespace-pre-wrap">{post.content.postText}</p>
              </div>
              {post.imageUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                  <img src={post.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};