import React from 'react';

interface ICategoryProps {
    title: string;
    categories: any[];
    inputDatas: any[];
    fetchCategories: any;
    handleAddRow: any;
    handleInputChange: any;
    saveCategory: any;
    maxLength?: number;
    itemCls: string; // 현재 선택된 ID (하이라이트용)
    itemType?: string;
    itemLvl: number;
    parentCls: string;
    childItemType?: string;
    isChecked: boolean;
    handleChildItemType: any; // 클릭 이벤트
    handleSelectedCheck: any;
    handleDeleteCategory: any;
    isCheckboxMode?: boolean; // ★ 추가: 3열처럼 체크박스 UI인지 여부
}

export default function CategoryTable({
    title,
    categories,
    inputDatas,
    fetchCategories,
    handleAddRow,
    handleInputChange,
    handleSelectedCheck,
    saveCategory,
    maxLength,
    itemCls, // 이게 selectedId 역할을 합니다
    itemType,
    itemLvl,
    childItemType,
    isChecked,
    parentCls,
    handleChildItemType,
    handleDeleteCategory,
    isCheckboxMode = false // 기본값은 false (일반 테이블 모드)
}: ICategoryProps) {

    return (
        <div className="flex flex-col h-full bg-white border border-gray-300 shadow-sm">
            
            {/* 1. 헤더 영역 */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-50 h-10 shrink-0">
                <span className="font-bold text-gray-700 text-sm">{title}</span>
                {/* 우측 상단 버튼들 (필요시 활성화) */}
                <div className="flex gap-1">
                    {/* <button className="text-gray-400 hover:text-blue-500">🔄</button> */}
                </div>
            </div>

            {/* 2. 본문 영역 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto relative">
                
                {/* ★ 분기 1: 체크박스 모드 (3열 - 사진 오른쪽 UI) */}
                {isCheckboxMode ? (
                    <div className="p-2 space-y-1">
                         {/* 데이터 리스트 */}
                        {categories && categories.map((category: any, i: number) => {
                             if (category.itemLvl !== itemLvl) return null;
                             return (
                                <div key={i} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                    <input 
                                        type="checkbox" 
                                        id={`check-${category.itemCls}`}
                                        className="mr-2"
                                        // 체크 로직 연결
                                        onChange={(e) => handleChildItemType(e)} 
                                        value={category.itemCls}
                                    />
                                    <label htmlFor={`check-${category.itemCls}`} className="text-sm cursor-pointer select-none flex-1">
                                        <span className="font-bold text-blue-600 mr-2">{category.itemClsNm}</span>
                                        {/* 필요하다면 코드도 표시 */}
                                        {/* <span className="text-gray-400 text-xs">({category.itemCls})</span> */}
                                    </label>
                                </div>
                             )
                        })}
                         {/* 데이터 없을 때 */}
                        {(!categories || categories.length === 0) && (
                            <div className="text-center text-gray-400 text-xs mt-4">데이터 없음</div>
                        )}
                    </div>
                ) : (
                /* ★ 분기 2: 일반 테이블 모드 (1, 2열 - 사진 왼쪽 UI) */
                    <table className="w-full text-center border-collapse text-xs">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr className="text-gray-600">
                                {/* <th className="w-8 border-r p-1 font-normal">No</th> */}
                                <th className="w-16 border-r p-1 font-normal">코드</th>
                                <th className="border-r p-1 font-normal">명</th>
                                <th className="w-12 p-1 font-normal">사용</th>
                                <th className="w-8 p-1 font-normal">삭제</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {/* 1. 조회된 데이터 리스트 */}
                            {categories && categories.map((category: any, i: number) => {
                                // 레벨 체크 (서버에서 걸러오면 좋지만, 여기서 한번 더 체크)
                                if (category.itemLvl !== itemLvl) return null;

                                // ★ 선택된 행인지 확인 (하이라이트 로직)
                                const isSelected = itemCls === category.itemCls;

                                return (
                                    <tr 
                                        key={i} 
                                        // 클릭 시 부모의 handleRowClick 실행 (e.target.value에 ID를 담아서 보냄)
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
                                            e.stopPropagation(); // 행 클릭 방지
                                            handleDeleteCategory(category.itemCls);
                                        }}>
                                            <button className="text-gray-400 hover:text-red-500">×</button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* 데이터 없을 때 안내 */}
                            {(!categories || categories.length === 0) && (!inputDatas || inputDatas.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="h-32 text-gray-300 italic">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            )}

                            {/* 2. 입력 모드 (Add Row 클릭 시 생기는 행) */}
                            {inputDatas && inputDatas.map((input: any, i: number) => (
                                itemType === "MAIN" ? (

                                    <tr key={`input-${i}`} className="bg-yellow-50 border-b">
                                        <td className="p-1 border-r">
                                            <input 
                                                type="text" 
                                                className="w-full border p-1 text-center bg-white focus:outline-blue-500"
                                                value={input.itemCls}
                                                placeholder="코드"
                                                maxLength={maxLength}
                                                onChange={(e) => handleInputChange(i, 'itemCls', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-1 border-r">
                                            <input 
                                                type="text"
                                                className="w-full border p-1 text-left bg-white focus:outline-blue-500"
                                                value={input.itemClsNm}
                                                placeholder="명칭 입력"
                                                onChange={(e) => handleInputChange(i, 'itemClsNm', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-1" colSpan={2}>
                                            <select 
                                                className="w-full border p-1 bg-white"
                                                value={input.useFlag ? "Y" : "N"}
                                                onChange={(e) => handleInputChange(i, 'useFlag', e.target.value === "Y")}
                                            >
                                                <option value="Y">Y</option>
                                                <option value="N">N</option>
                                            </select>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={`input-${i}`} className="bg-yellow-50 border-b">
                                        <td className="p-1 border-r">
                                            <input 
                                                type="text" 
                                                className="w-full border p-1 text-center bg-white focus:outline-blue-500"
                                                value={parentCls || ""}
                                                placeholder="코드 자동 증가"
                                                readOnly
                                                onChange={(e) => handleInputChange(i, 'itemCls', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-1 border-r">
                                            <input 
                                                type="text"
                                                className="w-full border p-1 text-left bg-white focus:outline-blue-500"
                                                value={input.itemClsNm}
                                                placeholder="명칭 입력"
                                                onChange={(e) => handleInputChange(i, 'itemClsNm', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-1" colSpan={2}>
                                            <select 
                                                className="w-full border p-1 bg-white"
                                                value={input.useFlag ? "Y" : "N"}
                                                onChange={(e) => handleInputChange(i, 'useFlag', e.target.value === "Y")}
                                            >
                                                <option value="Y">Y</option>
                                                <option value="N">N</option>
                                            </select>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 3. 하단 컨트롤바 (고정) */}
            <div className="p-1 border-t bg-gray-50 flex items-center justify-end h-8 shrink-0">
                <div className="flex gap-1">
                    {/* 추가 버튼 (입력 중이 아닐 때만 보임 or 항상 보임) */}
                    {handleAddRow && (
                        <button 
                            className="w-6 h-6 flex items-center justify-center border bg-white text-green-600 hover:bg-green-50 rounded shadow-sm"
                            onClick={(e) => handleAddRow(e, itemLvl, parentCls)}
                            title="행 추가"
                        >
                            ➕
                        </button>
                    )}
                    {/* 저장 버튼 (입력 데이터가 있을 때만 보임) */}
                    {saveCategory && inputDatas.length > 0 && (
                        <button 
                            className="w-6 h-6 flex items-center justify-center border bg-white text-blue-600 hover:bg-blue-50 rounded shadow-sm animate-pulse"
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