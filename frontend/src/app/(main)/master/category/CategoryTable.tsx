import React from 'react';

interface ICategoryProps {
    title: string;
    categories: any[];
    inputDatas: any[]; // { tempKey, itemCls, itemClsNm, ... } 구조
    fetchCategories: any;
    handleAddRow: any;
    handleInputChange: any;
    removeInputRow: (tempKey: number) => void; 
    saveCategory: any;
    maxLength?: number;
    itemCls: string; 
    itemType?: string;
    itemLvl: number;
    parentCls: string;
    childItemType?: string;
    isChecked: boolean;
    handleChildItemType: any; 
    handleSelectedCheck: any;
    handleDeleteCategory: any;
    isCheckboxMode?: boolean; 
    handleEditChange: (itemCls: string, field: string, value: any) => void;
}

export default function CategoryTable({
    title,
    categories,
    inputDatas,
    fetchCategories,
    handleAddRow,
    handleInputChange,
    handleEditChange,
    removeInputRow,
    handleSelectedCheck,
    saveCategory,
    maxLength,
    itemCls, 
    itemType,
    itemLvl,
    childItemType,
    isChecked,
    parentCls,
    handleChildItemType,
    handleDeleteCategory,
    isCheckboxMode = false 
}: ICategoryProps) {

    // 행 추가 가능 여부 (Lv0 이거나, 상위 카테고리가 선택된 경우)
    const canAddRow = itemLvl === 0 || parentCls;
    
    // [수정] 저장 버튼 활성화 조건: 신규 입력이 있거나 OR 기존 데이터 중 수정된 게 있을 때
    const hasInput = inputDatas && inputDatas.length > 0;
    const hasModified = categories && categories.some((c: any) => c.isModified);
    const canSave = hasInput || hasModified;

    return (
        <div className="flex flex-col h-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
            
            {/* 1. 헤더 영역 */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-50 h-10 shrink-0">
                <span className="font-bold text-gray-700 text-sm pl-1">{title}</span>
                
                <div className="flex items-center gap-2">
                    {/* [저장 버튼] */}
                    <button 
                        onClick={() => saveCategory(parentCls)}
                        disabled={!canSave} // 조건 변경
                        className={`px-2 py-1 text-xs font-bold text-white rounded transition-all duration-200 flex items-center gap-1
                            ${canSave 
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-sm' 
                                : 'bg-gray-300 cursor-not-allowed opacity-50'
                            }`}
                        title="저장"
                    >
                        <span>💾</span> 저장
                    </button>

                    {/* [추가(+) 버튼] */}
                    <button 
                        onClick={(e) => handleAddRow(e, itemLvl, parentCls)}
                        disabled={!canAddRow}
                        className={`w-6 h-6 flex items-center justify-center border rounded transition-colors
                            ${canAddRow 
                                ? 'bg-white text-green-600 hover:bg-green-50 border-gray-300' 
                                : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                            }`}
                        title="행 추가"
                    >
                        ➕
                    </button>
                </div>
            </div>

            {/* 2. 본문 영역 */}
            <div className="flex-1 overflow-y-auto relative bg-white">
                
                {isCheckboxMode ? (
                    // ... (체크박스 모드는 기존 유지)
                    <div className="p-2 space-y-1">
                        {categories && categories.map((category: any) => (
                             <div key={category.itemCls}>...</div> 
                        ))}
                    </div>
                ) : (
                    <table className="w-full text-center border-collapse text-xs table-fixed">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm text-gray-600">
                            <tr>
                                <th className="w-[30%] border-r p-1 font-normal">코드</th>
                                <th className="w-[40%] border-r p-1 font-normal">명칭</th>
                                <th className="w-[15%] border-r p-1 font-normal">사용</th>
                                <th className="w-[15%] p-1 font-normal">삭제</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {/* 1. 기존 데이터 리스트 (수정 가능하도록 변경) */}
                            {categories && categories.map((category: any) => {
                                const isSelected = itemCls === category.itemCls;
                                // 수정된 행인지 확인 (배경색 표시 등)
                                const isModified = category.isModified; 

                                return (
                                    <tr 
                                        key={category.itemCls} 
                                        onClick={() => handleChildItemType({ target: { value: category.itemCls } })} 
                                        className={`border-b cursor-pointer transition-colors duration-150
                                            ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                            ${isModified ? 'bg-green-50' : ''} 
                                        `}
                                    >
                                        {/* 코드 (수정 불가) */}
                                        <td className={`p-1 border-r truncate ${isSelected ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                                            <input 
                                                type="text" 
                                                value={category.itemCls} 
                                                readOnly 
                                                className="w-full bg-transparent text-center focus:outline-none cursor-pointer"
                                            />
                                        </td>

                                        {/* 명칭 (수정 가능) */}
                                        <td className="p-1 border-r">
                                            <input 
                                                type="text"
                                                className={`w-full border-b border-transparent focus:border-blue-500 bg-transparent text-left px-1 focus:outline-none ${isSelected ? 'font-bold text-blue-700' : ''}`}
                                                value={category.itemClsNm}
                                                onChange={(e) => handleEditChange(category.itemCls, 'itemClsNm', e.target.value)}
                                            />
                                        </td>

                                        {/* 사용여부 (수정 가능) */}
                                        <td className="p-1 border-r">
                                            <select 
                                                className="w-full bg-transparent text-center focus:outline-none cursor-pointer"
                                                value={category.useFlag ? "Y" : "N"}
                                                onClick={(e) => e.stopPropagation()} // 클릭 시 행 선택 방지
                                                onChange={(e) => handleEditChange(category.itemCls, 'useFlag', e.target.value === "Y")}
                                            >
                                                <option value="Y">Y</option>
                                                <option value="N">N</option>
                                            </select>
                                        </td>

                                        {/* 삭제 버튼 */}
                                        <td className="p-1" onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleDeleteCategory(category.itemCls);
                                        }}>
                                            <button className="text-gray-400 hover:text-red-500 font-bold px-2">×</button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* 2. 신규 입력 행 (기존 코드 유지) */}
                            {inputDatas && inputDatas.map((input: any) => (
                                <tr key={input.tempKey} className="bg-yellow-50 border-b animate-in fade-in duration-300">
                                    <td className="p-1 border-r">
                                        <input 
                                            type="text" 
                                            className={`w-full border p-1 text-center text-xs rounded ${itemLvl === 0 ? 'bg-white' : 'bg-gray-100'}`}
                                            value={input.itemCls}
                                            placeholder={itemLvl === 0 ? "코드" : "자동"}
                                            readOnly={itemLvl !== 0} 
                                            onChange={(e) => handleInputChange(input.tempKey, 'itemCls', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-1 border-r">
                                        <input 
                                            type="text"
                                            className="w-full border p-1 text-left bg-white focus:outline-blue-500 text-xs rounded"
                                            value={input.itemClsNm}
                                            placeholder="명칭"
                                            onChange={(e) => handleInputChange(input.tempKey, 'itemClsNm', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-1 border-r">
                                        <select 
                                            className="w-full border p-1 bg-white text-center text-xs rounded"
                                            value={input.useFlag ? "Y" : "N"}
                                            onChange={(e) => handleInputChange(input.tempKey, 'useFlag', e.target.value === "Y")}
                                        >
                                            <option value="Y">Y</option>
                                            <option value="N">N</option>
                                        </select>
                                    </td>
                                    <td className="p-1">
                                        <button 
                                            onClick={() => removeInputRow(input.tempKey)}
                                            className="text-red-500 hover:bg-red-100 px-2 py-0.5 rounded text-xs whitespace-nowrap"
                                            title="입력 취소"
                                        >
                                            취소
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* 데이터 없음 (기존 코드 유지) */}
                            {(!categories || categories.length === 0) && (!inputDatas || inputDatas.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="h-32 text-gray-300 italic align-middle">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}