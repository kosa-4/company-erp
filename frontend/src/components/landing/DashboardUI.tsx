'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Layout, 
  Terminal,
  GitBranch, 
  Coffee, 
  Code2,
  Server
} from 'lucide-react';

// Team Member Data
const teamMembers = [
  { 
    id: 1, 
    role: 'Backend Dev', 
    name: '최진현', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-100',
    icon: Terminal,
  },
  { 
    id: 2, 
    role: 'Frontend Dev', 
    name: '송민선', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100',
    icon: Layout,
  },
  { 
    id: 3, 
    role: 'Data Architect', 
    name: '윤소연', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100',
    icon: Database,
  },
  { 
    id: 4, 
    role: 'Project Lead', 
    name: '이재민', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100',
    icon: GitBranch,
  },
];

interface WorkstationCardProps {
  member: typeof teamMembers[0];
  delay: number;
}

const WorkstationCard = ({ member, delay }: WorkstationCardProps) => {
  const IconComponent = member.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay, duration: 0.5 }}
      whileHover={{ y: -3, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
      className="relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-4 shadow-lg flex items-center gap-3 min-w-[180px]"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${member.bgColor} flex items-center justify-center ${member.color}`}>
        <IconComponent className="w-5 h-5" />
      </div>
      
      {/* Info */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-800">{member.name}</h3>
        <p className="text-xs text-slate-500 font-mono">{member.role}</p>
      </div>

      {/* Active Status Dot */}
      <span className="flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
      </span>
    </motion.div>
  );
};

const ConnectionLine = ({ rotation }: { rotation: number }) => (
  <div 
    className="absolute top-1/2 left-1/2 w-[35%] h-[2px] bg-slate-200/60 origin-left -z-0"
    style={{ transform: `rotate(${rotation}deg) translateY(-1px)` }}
  >
    <motion.div
      className="absolute top-0 left-0 w-3 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
      animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
      transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
    />
  </div>
);

const DashboardUI: React.FC = () => {
  return (
    <div className="w-full aspect-[16/10] md:aspect-[21/9] bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-6 md:p-8 relative overflow-hidden flex flex-col">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Final Project: ERP System</h2>
            <p className="text-xs text-slate-500">KOSA Academy Team 4</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full border border-slate-200">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-slate-600">Caffeine Lvl: 98%</span>
          </div>
          <div className="flex -space-x-2">
            {['bg-indigo-400', 'bg-blue-400', 'bg-emerald-400', 'bg-purple-400'].map((color, i) => (
              <div 
                key={i} 
                className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${color}`}
                style={{ zIndex: 4 - i }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-grow relative flex items-center justify-center">
        
        {/* Central Server Hub */}
        <motion.div 
          className="absolute z-20 w-28 h-28 md:w-36 md:h-36 bg-white rounded-full shadow-[0_0_40px_rgba(79,70,229,0.1)] border-4 border-slate-50 flex flex-col items-center justify-center group cursor-pointer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="absolute inset-0 rounded-full border border-indigo-100 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
          <Server className="w-8 h-8 text-indigo-500 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MAIN REPO</span>
          <span className="text-sm font-bold text-slate-800 mt-0.5">v.1.0.4</span>
          
          <motion.div 
            className="absolute inset-[-10px] border-2 border-dashed border-indigo-200/50 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          />
        </motion.div>

        {/* Connection Lines */}
        <div className="absolute inset-0 z-0">
          <ConnectionLine rotation={225} />
          <ConnectionLine rotation={-45} />
          <ConnectionLine rotation={135} />
          <ConnectionLine rotation={45} />
        </div>

        {/* Developer Cards - Positioned around center */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Left - 최진현 */}
          <div className="absolute top-[15%] left-[5%] md:top-[18%] md:left-[8%] pointer-events-auto">
            <WorkstationCard member={teamMembers[0]} delay={0.4} />
          </div>

          {/* Top Right - 송민선 */}
          <div className="absolute top-[15%] right-[5%] md:top-[18%] md:right-[8%] pointer-events-auto">
            <WorkstationCard member={teamMembers[1]} delay={0.5} />
          </div>

          {/* Bottom Left - 윤소연 */}
          <div className="absolute bottom-[15%] left-[5%] md:bottom-[18%] md:left-[8%] pointer-events-auto">
            <WorkstationCard member={teamMembers[2]} delay={0.6} />
          </div>

          {/* Bottom Right - 이재민 */}
          <div className="absolute bottom-[15%] right-[5%] md:bottom-[18%] md:right-[8%] pointer-events-auto">
            <WorkstationCard member={teamMembers[3]} delay={0.7} />
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-indigo-50/20 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default DashboardUI;
