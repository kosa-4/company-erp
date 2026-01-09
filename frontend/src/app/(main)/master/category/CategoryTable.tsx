'use client'

import { useState, useRef, useEffect } from "react"
import { PageHeader } from "@/components/ui"
import { div, h2 } from "framer-motion/client";

interface ICategoryProps{
    title:any,
    categories:any,
    inputDatas:any,
    filteredCateByCls:any,
    fetchCategories:any,
    handleAddRow:any,
    handleInputChange:any,
    saveCategory:any,
    maxLength:any,
    itemCls:any,
    // setItemCls:any,
    itemType: any,
    itemLvl: any,
    childItemType:any,
    handleChildItemType:any,
    // handleParentCls: any,
}

export default function CategoryTable({ 
    title, 
    categories, 
    inputDatas,
    filteredCateByCls,
    fetchCategories,
    handleAddRow,
    handleInputChange,
    saveCategory,
    maxLength, 
    itemCls, 
    // setItemCls, 
    itemType,
    itemLvl,
    childItemType, 
    handleChildItemType,
    // handleParentCls
} :ICategoryProps){
    return(
        <div>
            {/* 품목 종류 */}
            <div className="flex flex-col bg-white border border-gray-300 shadow-sm">
                {/* 테이블 헤더 */}
                <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                {/* <div className={`w-3 h-3 rounded-full ${highlight ? 'bg-orange-500' : 'border border-gray-400'}`}></div> */}
                <span className="font-bold text-gray-700">{title}</span>
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
                            {/* {console.log(filteredCateByCls)} */}
                            {filteredCateByCls.length > 0 && (
                                <tr className={`border-b text-xs hover:bg-blue-50 cursor-pointer ${filteredCateByCls.active ? 'bg-orange-50' : ''}`}>
                                    <td className="p-1 border-r text-gray-400">
                                        {1}
                                    </td>
                                    <td className="p-1 border-r">
                                        <input 
                                        type="checkbox" 
                                        value={filteredCateByCls.itemCls}
                                        onChange={(e) => handleChildItemType(e,childItemType)}
                                        />
                                    </td>
                                    <td className="p-1 border-r text-orange-600 font-medium underline">
                                        {filteredCateByCls.itemCls}
                                    </td>
                                    <td className="p-1 border-r text-left px-2">
                                        {filteredCateByCls.itemClsNm}
                                    </td>
                                    <td className="p-1">
                                        {filteredCateByCls.useFlag ? "사용" : "미사용"}
                                    </td>
                                </tr>
                            )}

                            {categories && categories.map((category: any, i: number) => (
                                
                                <tr key={i} className={`border-b text-xs hover:bg-blue-50 cursor-pointer ${category.active ? 'bg-orange-50' : ''}`}>
                                <td className="p-1 border-r text-gray-400">
                                    {i + 1}
                                </td>
                                <td className="p-1 border-r">
                                    <input 
                                    type="checkbox" 
                                    value={category.itemCls}
                                    onChange={(e) => handleChildItemType(e,childItemType)}
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
                            ))}

                            {!categories && !filteredCateByCls && (
                                <tr><td colSpan={5} className="h-20 text-gray-400 italic">데이터가 없습니다.</td></tr>
                            )}
                            </tbody>

                        {/* input 출력 */}
                        <tbody>
                        {inputDatas && inputDatas.map((input: any, i: number) => (
                            
                            <tr key={i} className={`border-b text-xs hover:bg-blue-50 cursor-pointer ${input.active ? 'bg-orange-50' : ''}`}>
                            <td className="p-1 border-r text-gray-400">
                                {i + 1}
                            </td>
                            <td className="p-1 border-r">
                                <input 
                                type="checkbox" 
                                disabled
                                // checked={input.isChecked}
                                // onChange={(e) => handleInputChange(i, 'isChecked', e.target.checked)}
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
                        {handleAddRow && (
                            <button 
                            className="p-1 border bg-white text-green-600"
                            value={itemType}
                            onClick={(e) => handleAddRow(e, itemLvl)}
                            >➕</button>
                        )}
                        {saveCategory && (
                            <button 
                            className="p-1 border bg-white"
                            onClick={saveCategory}
                            >💾</button>
                        )}
                        <button className="p-1 border bg-white">⋯</button>
                    </div>
                
                </div>
            </div>
            
        </div>  
        
    )
}


