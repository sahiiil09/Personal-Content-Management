import React from 'react';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Youtube, 
  Globe, 
  ShieldCheck, 
  FileText, 
  Code, 
  Layers, 
  FolderGit2, 
  MapPin, 
  Mail, 
  Sparkles
} from 'lucide-react';
import { UserProfile, ContentItem } from '../types';

interface HeroSectionProps {
  profile: UserProfile;
  totalPublished: number;
  totalNotes: number;
  totalCode: number;
  totalFiles: number;
  socialLinks: ContentItem[];
  onSelectType: (type: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  totalPublished,
  totalNotes,
  totalCode,
  totalFiles,
  socialLinks,
  onSelectType,
}) => {
  const getSocialIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'twitter':
      case 'x':
        return <Twitter className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <section id="hero-profile-section" className="relative overflow-hidden pt-6 sm:pt-8 pb-8 sm:pb-10 border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10">
          
          {/* Avatar and Bio Info */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 max-w-3xl w-full">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-indigo-500/40 bg-zinc-850 shadow-xl">
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-emerald-500 text-zinc-950 ring-2 ring-zinc-900"
                title="Verified Creator & Author"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                  {profile.name}
                </h1>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {profile.handle}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Online
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-zinc-300 mt-1">{profile.title}</p>
              
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>

              {/* Social Channels Ribbon */}
              <div className="flex flex-wrap items-center gap-2 mt-3.5 sm:mt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    id={`social-link-${social.id}`}
                    href={social.socialData?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
                  >
                    {getSocialIcon(social.socialData?.platform)}
                    <span>{social.socialData?.customPlatformName || social.title}</span>
                  </a>
                ))}

                {profile.emailContact && (
                  <a
                    href={`mailto:${profile.emailContact}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Contact</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row gap-2 sm:gap-3 shrink-0">
            <div 
              onClick={() => onSelectType('all')}
              className="cursor-pointer p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 transition-all text-center group min-w-[80px]"
            >
              <span className="block text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                {totalPublished}
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <Layers className="w-3 h-3 text-indigo-400" />
                Published
              </span>
            </div>

            <div 
              onClick={() => onSelectType('note')}
              className="cursor-pointer p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 transition-all text-center group min-w-[80px]"
            >
              <span className="block text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                {totalNotes}
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <FileText className="w-3 h-3 text-amber-400" />
                Notes
              </span>
            </div>

            <div 
              onClick={() => onSelectType('code')}
              className="cursor-pointer p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 transition-all text-center group min-w-[80px]"
            >
              <span className="block text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {totalCode}
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <Code className="w-3 h-3 text-emerald-400" />
                Snippets
              </span>
            </div>

            <div 
              onClick={() => onSelectType('file')}
              className="cursor-pointer p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 transition-all text-center group min-w-[80px]"
            >
              <span className="block text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-rose-400 transition-colors">
                {totalFiles}
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <FolderGit2 className="w-3 h-3 text-rose-400" />
                Files
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
