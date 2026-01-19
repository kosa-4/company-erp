import React from 'react';

interface ICategoryProps {
    title: string;
    categories: any[];
    inputDatas: any[]; // { tempKey, itemCls, itemClsNm, ... } 구조
    fetchCategories: any;
    handleAddRow: any;
    handleInputChange: any;
    removeInputRow: (tempKey: number) => void; // ★ 추가: 입력 행 취소 함수
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
}

export default function CategoryTable({
    title,
    categories,
    inputDatas,
    fetchCategories,
    handleAddRow,
    handleInputChange,
    removeInputRow, // props 추가
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

    return (
        <div className="flex flex-col h-full bg-white border border-gray-300 shadow-sm">
            
            {/* 1. 헤더 영역 */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-50 h-10 shrink-0">
                <span className="font-bold text-gray-700 text-sm">{title}</span>
            </div>

            {/* 2. 본문 영역 */}
            <div className="flex-1 overflow-y-auto relative">
                
                {isCheckboxMode ? (
                    <div className="p-2 space-y-1">
                        {categories && categories.map((category: any) => (
                            <div key={category.itemCls} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                <input 
                                    type="checkbox" 
                                    id={`check-${category.itemCls}`}
                                    className="mr-2"
                                    onChange={(e) => handleChildItemType(e)} 
                                    value={category.itemCls}
                                />
                                <label htmlFor={`check-${category.itemCls}`} className="text-sm cursor-pointer select-none flex-1">
                                    <span className="font-bold text-blue-600 mr-2">{category.itemClsNm}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full text-center border-collapse text-xs">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr className="text-gray-600">
                                <th className="w-16 border-r p-1 font-normal">코드</th>
                                <th className="border-r p-1 font-normal">명</th>
                                <th className="w-12 p-1 font-normal">사용</th>
                                <th className="w-8 p-1 font-normal">취소/삭제</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {/* 1. 기존 데이터 리스트 */}
                            {categories && categories.map((category: any) => {
                                const isSelected = itemCls === category.itemCls;
                                return (
                                    <tr 
                                        key={category.itemCls} 
                                        onClick={() => handleChildItemType({ target: { value: category.itemCls } })} 
                                        className={`border-b cursor-pointer transition-colors duration-150
                                            ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-600'}
                                        `}
                                    >
                                        <td className={`p-2 border-r ${isSelected ? 'text-blue-600' : 'text-orange-600 underline'}`}>
                                            {category.itemCls}
                                        </td>
                                        <td className="p-2 border-r text-left px-3">
                                            {category.itemClsNm}
                                        </td>
                                        <td className="p-2 border-r">
                                            {category.useFlag ? "Y" : "N"}
                                        </td>
                                        <td className="p-2" onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleDeleteCategory(category.itemCls);
                                        }}>
                                            <button className="text-gray-400 hover:text-red-500 font-bold">×</button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* 2. 신규 입력 행 (Add Row 클릭 시) */}
                            {inputDatas && inputDatas.map((input: any) => (
                                <tr key={input.tempKey} className="bg-yellow-50 border-b animate-in fade-in duration-300">
                                    <td className="p-1 border-r">
                                        <input 
                                            type="text" 
                                            className={`w-full border p-1 text-center ${itemLvl === 0 ? 'bg-white' : 'bg-gray-100'}`}
                                            value={input.itemCls}
                                            placeholder={itemLvl === 0 ? "코드 직접 입력" : "자동 생성"}
                                            readOnly={itemLvl !== 0} // Lv 0(품목종류)만 직접 입력, 나머지는 자동 생성일 때
                                            onChange={(e) => handleInputChange(input.tempKey, 'itemCls', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-1 border-r">
                                        <input 
                                            type="text"
                                            className="w-full border p-1 text-left bg-white focus:outline-blue-500"
                                            value={input.itemClsNm}
                                            placeholder="명칭 입력"
                                            onChange={(e) => handleInputChange(input.tempKey, 'itemClsNm', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-1 border-r">
                                        <select 
                                            className="w-full border p-1 bg-white text-center"
                                            value={input.useFlag ? "Y" : "N"}
                                            onChange={(e) => handleInputChange(input.tempKey, 'useFlag', e.target.value === "Y")}
                                        >
                                            <option value="Y">Y</option>
                                            <option value="N">N</option>
                                        </select>
                                    </td>
                                    <td className="p-1">
                                        {/* 잘못 추가한 행을 화면에서 제거하는 버튼 */}
                                        <button 
                                            onClick={() => removeInputRow(input.tempKey)}
                                            className="text-red-500 hover:bg-red-100 w-full rounded"
                                            title="입력 취소"
                                        >
                                            취소
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* 데이터 없을 때 */}
                            {(!categories || categories.length === 0) && (!inputDatas || inputDatas.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="h-32 text-gray-300 italic">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 3. 하단 컨트롤바 */}
            <div className="p-1 border-t bg-gray-50 flex items-center justify-end h-8 shrink-0">
                <div className="flex gap-1">
                    {/* 행 추가 버튼: 부모가 선택되어야 하거나(Lv > 0), Root(Lv=0)일 때만 활성화 */}
                    {(itemLvl === 0 || parentCls) && (
                        <button 
                            className="w-6 h-6 flex items-center justify-center border bg-white text-green-600 hover:bg-green-50 rounded shadow-sm"
                            onClick={(e) => handleAddRow(e, itemLvl, parentCls)}
                            title="행 추가"
                        >
                            ➕
                        </button>
                    )}
                    {/* 저장 버튼: 입력 중인 데이터가 있을 때만 반짝이며 등장 */}
                    {inputDatas.length > 0 && (
                        <button 
                            className="w-6 h-6 flex items-center justify-center border bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm animate-bounce"
                            onClick={() => saveCategory(parentCls)}
                            title="저장"
                        >
                            💾
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}