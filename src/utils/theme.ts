import { BookOpen, Sparkles, Wrench, Camera, Video, Headphones, Palette, Star, Folder, Compass, FileText } from 'lucide-react';
import { RainbowColor } from '../types';

export const getRainbowClasses = (color: RainbowColor) => {
  switch (color) {
    case 'pink':
      return {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
        activeBg: 'bg-pink-500 text-white',
        spine: '#F472B6',
        lightSpine: '#FBCFE8',
        tagBg: 'bg-pink-100/70 text-pink-700',
      };
    case 'cyan':
      return {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        border: 'border-cyan-200',
        activeBg: 'bg-cyan-600 text-white',
        spine: '#06B6D4',
        lightSpine: '#A5F3FC',
        tagBg: 'bg-cyan-100/70 text-cyan-700',
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        activeBg: 'bg-emerald-600 text-white',
        spine: '#10B981',
        lightSpine: '#A7F3D0',
        tagBg: 'bg-emerald-100/70 text-emerald-700',
      };
    case 'amber':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        activeBg: 'bg-amber-500 text-white',
        spine: '#F59E0B',
        lightSpine: '#FDE68A',
        tagBg: 'bg-amber-100/70 text-amber-700',
      };
    case 'purple':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        activeBg: 'bg-purple-600 text-white',
        spine: '#8B5CF6',
        lightSpine: '#DDD6FE',
        tagBg: 'bg-purple-100/70 text-purple-700',
      };
    case 'orange':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        activeBg: 'bg-orange-500 text-white',
        spine: '#F97316',
        lightSpine: '#FED7AA',
        tagBg: 'bg-orange-100/70 text-orange-700',
      };
    case 'rose':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        activeBg: 'bg-rose-500 text-white',
        spine: '#F43F5E',
        lightSpine: '#FECDD3',
        tagBg: 'bg-rose-100/70 text-rose-700',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        activeBg: 'bg-slate-800 text-white',
        spine: '#64748B',
        lightSpine: '#E2E8F0',
        tagBg: 'bg-slate-100 text-slate-700',
      };
  }
};

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'BookOpen':
      return BookOpen;
    case 'Sparkles':
      return Sparkles;
    case 'Wrench':
      return Wrench;
    case 'Camera':
      return Camera;
    case 'Video':
      return Video;
    case 'Headphones':
      return Headphones;
    case 'Palette':
      return Palette;
    case 'Star':
      return Star;
    case 'Compass':
      return Compass;
    case 'FileText':
      return FileText;
    default:
      return Folder;
  }
};
