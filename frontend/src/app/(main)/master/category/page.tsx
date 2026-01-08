'use client'

import React, {useState} from 'react';

import { PageHeader } from '@/components/ui';
import CategoryTable from './categoeyTable';


export default function CategoryPage() {
    /* 입력 분기 */
    const [editStep, setEditStep] = useState(0);

    const getStatus = (tableType : string) =>{
        switch(tableType){
            case 'MAIN':
                return editStep < 1;
            case 'CLASS1':
                return editStep < 2;
            case 'CLASS2':
                return editStep < 3;
            case 'CLASS3':
                return editStep < 4;
            default:
                return true;
        };
    }
  return (
    <div>
        <PageHeader 
            title="품목 현황" 
            subtitle="품목 정보를 조회하고 관리합니다."
            icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            }
        />
        <div className="p-4 bg-gray-100 min-h-screen text-sm">      

            {/* 메인 3단 테이블 섹션 */}
            <div className="grid grid-cols-3 gap-2 h-[600px]">
                
                {/* 1. 품목 종류 테이블 */}
                <CategoryTable 
                highlight
                title="품목 종류"   
                />
                
                {/* 2. 대분류 테이블 */}
                <CategoryTable 
                title="대분류"                  
                />

                {/* 3. 중분류 테이블 */}
                <CategoryTable 
                title="중분류"                                 
                />

                {/* 4. 소분류 테이블 */}
                <CategoryTable 
                title="소분류"                 
                />

            </div>
        </div>
    </div>

    

      

      
  );
}