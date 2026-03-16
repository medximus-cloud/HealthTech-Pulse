import React, { useState, useEffect, useRef } from 'react';
import { GenerationResult, Platform } from '../types';
import { Button } from './Button';
import { toSocialBold, toSocialItalic, HEALTHCARE_EMOJIS } from '../utils/textFormatting';
import { naturalizeText } from '../services/geminiService';

interface ResultCardProps {
  result: GenerationResult;
  currentPlatform: Platform;
  onSchedule: (date: string, contentText: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, currentPlatform, onSchedule }) => {
  const { content, imageUrl, isLoading, error } = result;
  const [scheduleDate, setScheduleDate] = useState('');
  const [editedText, setEditedText] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isNaturalizing, setIsNaturalizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync editedText when new content is generated
  useEffect(() => {
    if (content?.postText) {
      setEditedText(content.postText);
    }
  }, [content]);

  // Reset image error when new image URL arrives
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleCopy = () => {
    if (editedText) {
      navigator.clipboard.writeText(editedText);
      alert('Content copied to clipboard!');
    }
  };

  const handleNaturalize = async () => {
    if (!editedText) return;
    setIsNaturalizing(true);
    try {
      const naturalized = await naturalizeText(editedText, currentPlatform);
      setEditedText(naturalized);
    } catch (err) {
      console.error("Failed to naturalize text", err);
      alert("Failed to naturalize text. Please try again.");
    } finally {
      setIsNaturalizing(false);
    }
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'related-image.jpg';
      link.target = "_blank"; // Open in new tab if download is blocked by CORS
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleScheduleClick = () => {
    if (!scheduleDate || !editedText) return;
    onSchedule(scheduleDate, editedText);
    setScheduleDate('');
  };

  const applyFormatting = (formatFn: (s: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editedText;

    if (start === end) return; // No selection

    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const formattedSelection = formatFn(selection);
    const newText = before + formattedSelection + after;

    setEditedText(newText);
    
    // Restore selection / focus needs a small timeout or re-render handling
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedSelection.length);
    }, 0);
  };

  const insertAtCursor = (insertion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editedText;

    const newText = text.substring(0, start) + insertion + text.substring(end);
    setEditedText(newText);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  const toggleBulletList = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editedText;
      
      // Find start of line for selection start
      let lineStart = text.lastIndexOf('\n', start - 1) + 1;
      
      // Find end of line for selection end
      let lineEnd = text.indexOf('\n', end);
      if (lineEnd === -1) lineEnd = text.length;
      
      const selectedBlock = text.substring(lineStart, lineEnd);
      const lines = selectedBlock.split('\n');
      
      const newLines = lines.map(line => {
          if (line.trim().startsWith('• ')) {
              return line.replace('• ', '');
          } else {
              return `• ${line}`;
          }
      });
      
      const newBlock = newLines.join('\n');
      const newText = text.substring(0, lineStart) + newBlock + text.substring(lineEnd);
      
      setEditedText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
      }, 0);
  };

  if (!content && !isLoading && !error) return null;

  return (
    <div className="bg-white rounded-b-2xl shadow-none flex flex-col h-full">
      <div className="p-6 md:p-8 flex-1 space-y-8 overflow-y-auto">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Text Content Section */}
        {content && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Post Editor</label>
              <div className="flex gap-2">
                 <Button 
                    variant="outline" 
                    onClick={handleNaturalize} 
                    className="text-xs py-1 px-3 text-teal-600 border-teal-200 hover:bg-teal-50"
                    disabled={isNaturalizing}
                 >
                    {isNaturalizing ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Refining...
                        </>
                    ) : (
                        <>
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                           Naturalize
                        </>
                    )}
                 </Button>
                 <Button variant="outline" onClick={handleCopy} className="text-xs py-1 px-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy Text
                 </Button>
              </div>
            </div>
            
            <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative ${isNaturalizing ? 'opacity-70 pointer-events-none' : ''}`}>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
                    <button onClick={() => applyFormatting(toSocialBold)} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold w-8" title="Bold (Unicode)">B</button>
                    <button onClick={() => applyFormatting(toSocialItalic)} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic w-8" title="Italic (Unicode)">I</button>
                    <div className="w-px h-5 bg-slate-300 mx-1"></div>
                    <button onClick={toggleBulletList} className="p-1.5 rounded hover:bg-slate-200 text-slate-700" title="Bullet List">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                    <div className="w-px h-5 bg-slate-300 mx-1"></div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                        {HEALTHCARE_EMOJIS.map(emoji => (
                            <button 
                                key={emoji} 
                                onClick={() => insertAtCursor(emoji)}
                                className="hover:bg-slate-200 rounded px-1 text-lg transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <textarea
                    ref={textareaRef}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-48 p-4 bg-white text-slate-700 focus:outline-none resize-y font-medium leading-relaxed"
                    placeholder="Edit your post here..."
                />
            </div>
          </div>
        )}
        
        {/* Loading State for Image */}
        {isLoading && content && !imageUrl && (
             <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Searching for Imagery...</label>
                <div className="aspect-square w-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
                   <div className="flex flex-col items-center">
                     <svg className="animate-spin h-8 w-8 text-teal-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Finding relevant image...</span>
                   </div>
                </div>
             </div>
        )}

        {/* Image Result Section */}
        {imageUrl && !imageError && (
          <div className="space-y-4 animate-fade-in">
             <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Related Image</label>
              <Button variant="outline" onClick={downloadImage} className="text-xs py-1 px-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Open Link
              </Button>
            </div>
            <div className="relative group rounded-xl overflow-hidden shadow-md border border-slate-200">
              <img 
                src={imageUrl} 
                alt="Related Content" 
                className="w-full h-auto object-cover max-h-[500px]"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                 Image from Web
              </div>
            </div>
          </div>
        )}
        
        {/* Image Load Error Fallback */}
        {imageUrl && imageError && (
             <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm text-center">
                <p>Found image at: <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline truncate block max-w-full">{imageUrl}</a></p>
                <p className="mt-1 text-xs">Image could not be loaded directly (likely due to privacy settings). Click the link to view.</p>
             </div>
        )}

        {/* Scheduling Section */}
        {content && !isLoading && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Schedule Post for {currentPlatform}
            </label>
            <div className="flex gap-2">
              <input 
                type="datetime-local" 
                className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <Button 
                onClick={handleScheduleClick}
                disabled={!scheduleDate || !editedText}
                className="whitespace-nowrap"
              >
                Schedule
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !content && !error && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                <p>Your generated content will appear here</p>
            </div>
        )}
      </div>
    </div>
  );
};