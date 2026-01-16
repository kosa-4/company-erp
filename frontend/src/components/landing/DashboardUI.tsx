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
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100',
    icon: Terminal,
  },
  { 
    id: 2, 
    role: 'Frontend Dev', 
    name: '송민선', 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50',
    icon: Layout,
  },
  { 
    id: 3, 
    role: 'Data Architect', 
    name: '윤소연', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100',
    icon: Database,
  },
  { 
    id: 4, 
    role: 'Project Lead', 
    name: '이재민', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100',
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay, duration: 0.5 }}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      className="relative bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 min-w-[160px]"
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg ${member.bgColor} flex items-center justify-center ${member.color}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      
      {/* Info */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
        <p className="text-[11px] text-gray-500 font-medium">{member.role}</p>
      </div>

      {/* Active Status Dot */}
      <span className="flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
    </motion.div>
  );
};

const ConnectionLine = ({ rotation }: { rotation: number }) => (
  <div 
    className="absolute top-1/2 left-1/2 w-[35%] h-[1px] bg-gray-200 origin-left -z-0"
    style={{ transform: `rotate(${rotation}deg) translateY(-0.5px)` }}
  >
    <motion.div
      className="absolute top-0 left-0 w-8 h-[1px] bg-emerald-400"
      animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
      transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
    />
  </div>
);

const DashboardUI: React.FC = () => {
  return (
    <div className="w-full aspect-[16/10] md:aspect-[21/9] bg-white rounded-xl p-6 relative overflow-hidden flex flex-col">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Vendor Portal System</h2>
            <p className="text-xs text-gray-500">System Architecture Overview</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-medium text-gray-600">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-grow relative flex items-center justify-center">
        
        {/* Central Server Hub */}
        <motion.div 
          className="absolute z-20 w-24 h-24 md:w-32 md:h-32 bg-white rounded-full shadow-lg border border-gray-100 flex flex-col items-center justify-center group"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
          <Server className="w-8 h-8 text-emerald-600 mb-1" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CORE API</span>
          <span className="text-sm font-bold text-gray-900 mt-0.5">v.2.1.0</span>
          
          <motion.div 
            className="absolute inset-[-8px] border border-dashed border-emerald-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
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
          <div className="absolute top-[10%] left-[5%] md:top-[15%] md:left-[10%] pointer-events-auto">
            <WorkstationCard member={teamMembers[0]} delay={0.4} />
          </div>

          {/* Top Right - 송민선 */}
          <div className="absolute top-[10%] right-[5%] md:top-[15%] md:right-[10%] pointer-events-auto">
            <WorkstationCard member={teamMembers[1]} delay={0.5} />
          </div>

          {/* Bottom Left - 윤소연 */}
          <div className="absolute bottom-[10%] left-[5%] md:bottom-[15%] md:left-[10%] pointer-events-auto">
            <WorkstationCard member={teamMembers[2]} delay={0.6} />
          </div>

          {/* Bottom Right - 이재민 */}
          <div className="absolute bottom-[10%] right-[5%] md:bottom-[15%] md:right-[10%] pointer-events-auto">
            <WorkstationCard member={teamMembers[3]} delay={0.7} />
          </div>
        </div>
      </div>
      
      {/* Background Decor - Removed for minimalism */}
    </div>
  );
};

export default DashboardUI;
