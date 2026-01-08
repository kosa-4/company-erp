'use client'

import { useState, useRef, useEffect } from "react"

interface Category {
    itemCls: string,
    itemClsNm: string,
    useFlag: boolean,
    isChecked: boolean,
    readOnly: boolean,
}

export default function CategoryTable({ title, highlight,  }: any){
    const [categories, setCategories] = useState<Category[]>([]);

    // 카테고리 조회
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
    
    // 카테고리 추가
    const handleAddRow = () =>{        
        
        const newInput = {
            itemCls: '',
            itemClsNm:'',
            useFlag: true,
            isChecked: true,
            readOnly: false,
        };
        if (!Array.isArray(categories)) {
            setCategories([newInput]);
            return;
        }
        setCategories([...categories, newInput]);
        
    }  
    
    // 카테고리 저장
    const [inputDatas, setInputDatas] = useState()
    const handleSaveRow = () => {
        let saveInput = categories.map(c => {
            if(c.itemCls.trim() != '' && c.itemClsNm.trim() != ''){
                return{
                    ...c,
                    readOnly: true,
                } 
            } else {
                return c;   
            }
        })
        setCategories(saveInput);        
    }

    // 저장
    // form 태그 내용 저장
    const saveForm = useRef<HTMLFormElement>(null);

    const saveCategory = async () => {
        // form 태그 null 처리
        if(!saveForm.current){
            return;
        }
        // 1. form 데이터 저장
        const formData = new FormData(saveForm.current);
        const data = Object.fromEntries(formData.entries());
        
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
        } catch(err){
            console.error("데이터 입력 중 오류 발생", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    },[])

    
    return(
        
            <div className="flex flex-col bg-white border border-gray-300 shadow-sm">
                {/* 테이블 헤더 */}
                <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                <div className={`w-3 h-3 rounded-full ${highlight ? 'bg-orange-500' : 'border border-gray-400'}`}></div>
                <span className="font-bold text-gray-700">{title}</span>
                </div>

                {/* 실제 그리드 영역 */}
                <div className="flex-1 overflow-y-auto">
                    <form ref={saveForm}>
                        <table className="w-full text-center border-collapse">
                            <thead className="bg-gray-100 sticky top-0 border-b">
                            <tr className="text-xs text-gray-600">
                                <th className="w-8 border-r p-1 font-normal text-blue-500">✓</th>
                                <th className="w-8 border-r p-1 font-normal">▢</th>
                                <th className="w-16 border-r p-1 font-normal">코드</th>
                                <th className="border-r p-1 font-normal">명</th>
                                <th className="w-16 p-1 font-normal">사용여부</th>
                            </tr>
                            </thead>
                
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
                                    {category.useFlag}
                                </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="h-20 text-gray-400 italic">데이터가 없습니다.</td></tr>
                            )}
                            </tbody>
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
                                    <input 
                                    type="text"   
                                    name="itemCls"                                     
                                    readOnly={category.readOnly}/>
                                </td>
                                <td className="p-1 border-r text-left px-2">
                                    <input 
                                    type="text" 
                                    name="itemClsNm"
                                    readOnly={category.readOnly}/>
                                </td>
                                <td className="p-1">
                                    <select className="border text-[10px]">
                                        <option>사용</option>
                                    </select>
                                </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="h-20 text-gray-400 italic">데이터가 없습니다.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </form>
                </div>

                {/* 테이블 하단 컨트롤바 */}
                <div className="p-1 border-t bg-gray-50 flex items-center justify-between text-[10px]">
                <div className="flex gap-2 items-center">
                    <button className="p-1 border bg-white">🔍</button>
                    <button 
                    className="p-1 border bg-white text-green-600"
                    onClick={handleAddRow}
                    >➕</button>
                    <button 
                    className="p-1 border bg-white"
                    onClick={() => {
                        handleSaveRow();
                        saveCategory();
                    }}
                    >💾</button>
                    <button className="p-1 border bg-white">⋯</button>
                </div>
                {/* <div className="text-gray-500 px-2">개수: {initialCount}</div> */}
                </div>
            </div>
        
    )
}


