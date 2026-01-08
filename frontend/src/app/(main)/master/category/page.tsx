'use client'

import { useState, useRef, useEffect } from "react"
import { PageHeader } from "@/components/ui"
import { div } from "framer-motion/client";

interface Category {
    itemCls: string,
    itemClsNm: string,
    useFlag: boolean,
    isChecked: boolean,
    readOnly: boolean,
}

export default function CategoryPage(){
    const [categories, setCategories] = useState<Category[]>([]);

    // 1. 카테고리 조회
    const fetchCategories = async () => {
        try{
            // 1. 데이터 요청
            const response = await fetch ("http://localhost:8080/categories");

            // 응답 실패 시
            if (!response.ok){
                throw new Error(`조회 실패 ${response.status}`);
            }

            // 2. 응답 값 저장
            const data = await response.json();

            setCategories(data);
        } catch(error){
            console.error("데이터 로드 중 오류 발생", error);
            alert("데이터 로드에 실패하였습니다.")
        }
    }
    
    // 2. 행 추가
    const [inputDatas, setInputDatas] = useState<Category[]>([])
    const handleAddRow = () =>{        
        
        // 초기값 세팅
        const newInput = {
            itemCls: '',
            itemClsNm:'',
            useFlag: true,
            isChecked: false,
            readOnly: false,
        };

        // null인 경우 처리
        if (!Array.isArray(inputDatas)) {
            setInputDatas([newInput]);
            return;
        }

        // 입력값 최신화
        setInputDatas([...inputDatas, newInput]);
        
    }  
    
    // 3. 카테고리 저장
    const handleInputChange = (index: number, field: keyof Category, value:any) => {
        const updatedInput = inputDatas.map((data, i) => 
            i === index ? {...data, [field]: value} : data
        );
        setInputDatas(updatedInput);
    }

    // 저장

    const saveCategory = async () => {
        const data = inputDatas.filter(d => d.itemCls.trim() !== '' && d.itemClsNm.trim() !== '');

        if(data.length === 0){
            alert("저장할 데이터를 입력해주세요");
            return;
        }
        try{
            // 1. 데이터 요청
            const response = await fetch ("http://localhost:8080/categories/new", {
                method: 'POST',
                headers:{
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if(!response.ok){
                throw new Error(`입력 실패 ${response.status}`)
            };

            alert("저장되었습니다.");
            setInputDatas([]);
            fetchCategories();
        } catch(err){
            console.error("데이터 입력 중 오류 발생", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    },[])

    
    return(
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
            {/* 품목 종류 */}
            <div className="flex flex-col bg-white border border-gray-300 shadow-sm">
                {/* 테이블 헤더 */}
                <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                {/* <div className={`w-3 h-3 rounded-full ${highlight ? 'bg-orange-500' : 'border border-gray-400'}`}></div> */}
                <span className="font-bold text-gray-700">품목 종류</span>
                </div>
                
                {/* 카드 영역 */}
                <div className="flex-1 overflow-y-auto">                    
                    <table className="w-full text-center border-collapse">
                        {/* 컬럼명 */}
                        <thead className="bg-gray-100 sticky top-0 border-b">
                        <tr className="text-xs text-gray-600">
                            <th className="w-8 border-r p-1 font-normal text-blue-500">✓</th>
                            <th className="w-8 border-r p-1 font-normal">▢</th>
                            <th className="w-16 border-r p-1 font-normal">코드</th>
                            <th className="border-r p-1 font-normal">명</th>
                            <th className="w-16 p-1 font-normal">사용여부</th>
                        </tr>
                        </thead>

                        {/* 조회된 카테고리 출력 */}
                        <tbody>
                        {categories.length > 0 ? categories.map((category: any, i: number) => (
                            
                            <tr key={i} className={`border-b text-xs hover:bg-blue-50 cursor-pointer ${category.active ? 'bg-orange-50' : ''}`}>
                            <td className="p-1 border-r text-gray-400">
                                {i + 1}
                            </td>
                            <td className="p-1 border-r">
                                <input 
                                type="checkbox" 
                                />
                            </td>
                            <td className="p-1 border-r text-orange-600 font-medium underline">
                                {category.itemCls}
                            </td>
                            <td className="p-1 border-r text-left px-2">
                                {category.itemClsNm}
                            </td>
                            <td className="p-1">
                                {category.useFlag ? "사용" : "미사용"}
                            </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="h-20 text-gray-400 italic">데이터가 없습니다.</td></tr>
                        )}
                        </tbody>

                        {/* input 출력 */}
                        <tbody>
                        {inputDatas.map((input: any, i: number) => (
                            
                            <tr key={i} className={`border-b text-xs hover:bg-blue-50 cursor-pointer ${input.active ? 'bg-orange-50' : ''}`}>
                            <td className="p-1 border-r text-gray-400">
                                {i + 1}
                            </td>
                            <td className="p-1 border-r">
                                <input 
                                type="checkbox" 
                                checked={input.isChecked}
                                onChange={(e) => handleInputChange(i, 'isChecked', e.target.checked)}
                                />
                            </td>
                            <td className="p-1 border-r text-orange-600 font-medium underline">
                                <input 
                                type="text"                                
                                value={input.itemCls}  
                                onChange={(e) => handleInputChange(i, 'itemCls', e.target.value)}                                   
                                />
                            </td>
                            <td className="p-1 border-r text-left px-2">
                                <input 
                                type="text"
                                value={input.itemClsNm}
                                onChange={(e) => handleInputChange(i, 'itemClsNm', e.target.value)}
                                />
                            </td>
                            <td className="p-1">
                                <select 
                                className="border text-[10px]"
                                value={input.useFlag ? "Y" : "N"}
                                onChange={(e) => handleInputChange(i, 'useFlag', e.target.value)}
                                >
                                    <option value="Y">사용</option>
                                    <option value="N">미사용</option>
                                </select>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    
                </div>

                {/* 하단 컨트롤바 */}
                <div className="p-1 border-t bg-gray-50 flex items-center justify-between text-[10px]">
                    <div className="flex gap-2 items-center">
                        <button 
                        className="p-1 border bg-white"
                        onClick={fetchCategories}
                        >🔍</button>
                        <button 
                        className="p-1 border bg-white text-green-600"
                        onClick={handleAddRow}
                        >➕</button>
                        <button 
                        className="p-1 border bg-white"
                        onClick={saveCategory}
                        >💾</button>
                        <button className="p-1 border bg-white">⋯</button>
                    </div>
                
                </div>
            </div>
            {/* 품목 종류 */}
            <div className="flex flex-col bg-white border border-gray-300 shadow-sm">
                {/* 테이블 헤더 */}
                <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                {/* <div className={`w-3 h-3 rounded-full ${highlight ? 'bg-orange-500' : 'border border-gray-400'}`}></div> */}
                <span className="font-bold text-gray-700">대분류</span>
                </div>
                
                {/* 카드 영역 */}
                <div className="flex-1 overflow-y-auto">                    
                    <table className="w-full text-center border-collapse">
                        {/* 컬럼명 */}
                        <thead className="bg-gray-100 sticky top-0 border-b">
                        <tr className="text-xs text-gray-600">
                            <th className="w-8 border-r p-1 font-normal text-blue-500">✓</th>
                            <th className="w-8 border-r p-1 font-normal">▢</th>
                            <th className="w-16 border-r p-1 font-normal">코드</th>
                            <th className="border-r p-1 font-normal">명</th>
                            <th className="w-16 p-1 font-normal">사용여부</th>
                        </tr>
                        </thead>

                        {/* 조회된 카테고리 출력 */}
                        <tbody>
                        {categories.length > 0 ? categories.map((category: any, i: number) => (
                            
                            <tr key={i} className={`border-b text-xs hover:bg-blue-50 cursor-pointer ${category.active ? 'bg-orange-50' : ''}`}>
                            <td className="p-1 border-r text-gray-400">
                                {i + 1}
                            </td>
                            <td className="p-1 border-r">
                                <input 
                                type="checkbox" 
                                />
                            </td>
                            <td className="p-1 border-r text-orange-600 font-medium underline">
                                {category.itemCls}
                            </td>
                            <td className="p-1 border-r text-left px-2">
                                {category.itemClsNm}
                            </td>
                            <td className="p-1">
                                {category.useFlag ? "사용" : "미사용"}
                            </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="h-20 text-gray-400 italic">데이터가 없습니다.</td></tr>
                        )}
                        </tbody>

                        {/* input 출력 */}
                        <tbody>
                        {inputDatas.map((input: any, i: number) => (
                            
                            <tr key={i} className={`border-b text-xs hover:bg-blue-50 cursor-pointer ${input.active ? 'bg-orange-50' : ''}`}>
                            <td className="p-1 border-r text-gray-400">
                                {i + 1}
                            </td>
                            <td className="p-1 border-r">
                                <input 
                                type="checkbox" 
                                checked={input.isChecked}
                                onChange={(e) => handleInputChange(i, 'isChecked', e.target.checked)}
                                />
                            </td>
                            <td className="p-1 border-r text-orange-600 font-medium underline">
                                <input 
                                type="text"                                
                                value={input.itemCls}  
                                onChange={(e) => handleInputChange(i, 'itemCls', e.target.value)}                                   
                                />
                            </td>
                            <td className="p-1 border-r text-left px-2">
                                <input 
                                type="text"
                                value={input.itemClsNm}
                                onChange={(e) => handleInputChange(i, 'itemClsNm', e.target.value)}
                                />
                            </td>
                            <td className="p-1">
                                <select 
                                className="border text-[10px]"
                                value={input.useFlag ? "Y" : "N"}
                                onChange={(e) => handleInputChange(i, 'useFlag', e.target.value)}
                                >
                                    <option value="Y">사용</option>
                                    <option value="N">미사용</option>
                                </select>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    
                </div>

                {/* 하단 컨트롤바 */}
                <div className="p-1 border-t bg-gray-50 flex items-center justify-between text-[10px]">
                    <div className="flex gap-2 items-center">
                        <button 
                        className="p-1 border bg-white"
                        onClick={fetchCategories}
                        >🔍</button>
                        <button 
                        className="p-1 border bg-white text-green-600"
                        onClick={handleAddRow}
                        >➕</button>
                        <button 
                        className="p-1 border bg-white"
                        onClick={saveCategory}
                        >💾</button>
                        <button className="p-1 border bg-white">⋯</button>
                    </div>
                
                </div>
            </div>
        </div>  
        
    )
}


