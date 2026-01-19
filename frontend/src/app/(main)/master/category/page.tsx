'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '@/components/ui';
import CategoryTable from './CategoryTable';
import { Category } from '../item/TreeItem';

let tempId = 0;

interface InputCategory {
    tempKey: number;
    itemCls: string;
    itemClsNm: string;
    useFlag: boolean;
    itemLvl: number;
    parentItemCls: string | null;
}

export default function CategoryPage() {
    const [cateMap, setCateMap] = useState<{ [key: string]: Category }>({});
    const [rootList, setRootList] = useState<Category[]>([]);
    
    // 선택 상태 관리
    const [selectedMainId, setSelectedMainId] = useState(""); // 1단 선택
    const [selectedMidId, setSelectedMidId] = useState("");  // 2단 선택
    const [selectedSubId, setSelectedSubId] = useState("");  // 3단 선택

    
      // 현재 선택 상태를 실시간으로 추적하는 '상자(Ref)'를 만듭니다.
    const selectedMainIdRef = useRef(selectedMainId);
    const selectedMidIdRef = useRef(selectedMidId);
    const selectedSubIdRef = useRef(selectedSubId);

    // 상태값이 바뀔 때마다 상자 안의 내용물(.current)을 최신으로 갈아끼웁니다.
    useEffect(() => {
        selectedMainIdRef.current = selectedMainId;
        selectedMidIdRef.current = selectedMidId;
        selectedSubIdRef.current = selectedSubId;
    }, [selectedMainId, selectedMidId, selectedSubId]);

    const [inputDatas, setInputDatas] = useState<InputCategory[]>([]);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/v1/categories/all");
            if (!response.ok) throw new Error("서버 응답 오류");
            const data = await response.json();

            const tempMap: { [key: string]: Category } = {};
            const tempRoot: Category[] = [];

            data.forEach((c: any) => {
                tempMap[c.itemCls] = { ...c, children: [] };
            });

            data.forEach((c: any) => {
                const pId = c.parentItemCls;
                if (pId && tempMap[pId]) {
                    tempMap[pId].children?.push(tempMap[c.itemCls]);
                } else {
                    tempRoot.push(tempMap[c.itemCls]);
                }
            });

            setCateMap(tempMap);
            setRootList(tempRoot);
            setInputDatas([]); 

            const nextMainId = tempMap[selectedMainIdRef.current] ? selectedMainIdRef.current : "";
            
            const nextMidId = (nextMainId && tempMap[nextMainId]?.children?.some(c => c.itemCls === selectedMidIdRef.current))
                ? selectedMidIdRef.current : "";
            
            const nextSubId = (nextMidId && tempMap[nextMidId]?.children?.some(c => c.itemCls === selectedSubIdRef.current))
                ? selectedSubIdRef.current : "";

            setSelectedMainId(nextMainId);
            setSelectedMidId(nextMidId);
            setSelectedSubId(nextSubId);
        } catch (err) {
            console.error("데이터 로딩 중 오류 발생", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 각 단계별 자식 리스트 계산
    const class1List = useMemo(() => selectedMainId ? cateMap[selectedMainId]?.children || [] : [], [selectedMainId, cateMap]);
    const class2List = useMemo(() => selectedMidId ? cateMap[selectedMidId]?.children || [] : [], [selectedMidId, cateMap]);
    const class3List = useMemo(() => selectedSubId ? cateMap[selectedSubId]?.children || [] : [], [selectedSubId, cateMap]);

    const handleRowClick = (e: any, level: number) => {
        const id = e.target.value;
        if (level === 0) {
            setSelectedMainId(id); setSelectedMidId(""); setSelectedSubId("");
        } else if (level === 1) {
            setSelectedMidId(id); setSelectedSubId("");
        } else if (level === 2) {
            setSelectedSubId(id);
        }
    };

    const handleAddRow = (e: any, itemLvl: number, targetParentId: string) => {
        // targetParentId가 없으면 null, 있으면 그 값 그대로 사용
        const parentId = !targetParentId || targetParentId === "" ? null : targetParentId;

        const newInput: InputCategory = {
            tempKey: tempId++,
            itemCls: '',
            itemClsNm: '',
            useFlag: true,
            itemLvl: itemLvl,
            parentItemCls: parentId, // 정규화된 부모 ID 저장
        };
        setInputDatas(prev => [...prev, newInput]);
    };

    const removeInputRow = (tempKey: number) => {
        setInputDatas(prev => prev.filter(row => row.tempKey !== tempKey));
    };

    const handleInputChange = (tempKey: number, field: keyof InputCategory, value: any) => {
        setInputDatas(prev => prev.map(row => 
            row.tempKey === tempKey ? { ...row, [field]: value } : row
        ));
    };

    const saveCategory = async (targetParentId: string) => {
        const currentParent = !targetParentId || targetParentId === "" ? null : targetParentId;
        
        const dataToSave = inputDatas.filter(d => {
            const isSameParent = d.parentItemCls === currentParent;
            const isNameFilled = d.itemClsNm && d.itemClsNm.trim() !== '';
            const isCodeFilled = d.itemLvl !== 0 || (d.itemCls && d.itemCls.trim() !== ''); // 최상위에서 code 미입력 시
            return isSameParent && isNameFilled && isCodeFilled;
        });

        if (dataToSave.length === 0) {
            alert("저장할 분류 명칭을 입력해주세요.");
            return;
        }

        try {
            const payload = dataToSave.map(({ tempKey, itemCls, ...rest }) => {
                // itemLvl이 0(최상위)이 아닐 때(자동채번 대상)는 itemCls를 제외
                if (rest.itemLvl !== 0) {
                    return rest; // itemCls가 없는 상태로 전송
                }
                return { itemCls, ...rest };
            });
            const response = await fetch("/api/v1/categories/new", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(errMsg || "저장 실패");
            }

            alert("저장되었습니다.");
            await fetchCategories(); // 저장 후 목록을 다시 불러오면서 자동 생성된 코드를 확인
        } catch (err: any) {
            alert("저장 오류: " + err.message);
        }
    };

    const handleDeleteCategory = async (itemCls: string) => {
        if(!confirm("삭제하시겠습니까? 하위 분류가 있는 경우 삭제되지 않을 수 있습니다.")) return;
        try {
            const response = await fetch(`/api/v1/categories/${itemCls}`, { method: "DELETE" });
            if (!response.ok) throw new Error("서버에서 삭제를 거부했습니다.");
            await fetchCategories();
            alert("삭제되었습니다.");
        } catch (err: any) { alert(err.message); }
    };

    return (
        <div>
            <PageHeader title="품목 분류" subtitle="품목 카테고리를 조회하고 관리합니다." />
            <div className="p-4 bg-gray-100 min-h-screen text-sm">
                <div className="grid grid-cols-4 gap-2 h-[650px]">
                    
                    {/* 1단: 품목 종류 */}
                    <CategoryTable
                        title="품목 종류"
                        itemLvl={0}
                        categories={rootList}
                        inputDatas={inputDatas.filter(d => d.itemLvl === 0 && d.parentItemCls === null)}
                        itemCls={selectedMainId}
                        handleChildItemType={(e: any) => handleRowClick(e, 0)}
                        handleAddRow={handleAddRow}
                        removeInputRow={removeInputRow}
                        saveCategory={() => saveCategory("")}
                        handleDeleteCategory={handleDeleteCategory}
                        parentCls="" fetchCategories={fetchCategories} handleInputChange={handleInputChange} 
                        handleSelectedCheck={() => {}} isChecked={false} itemType="MAIN" childItemType="CLASS1" maxLength={2}
                    />

                    {/* 2단: 대분류 */}
                    <CategoryTable
                        title="대분류"
                        itemLvl={1}
                        categories={class1List}
                        inputDatas={inputDatas.filter(d => d.itemLvl === 1 && d.parentItemCls === (selectedMainId || null))}
                        itemCls={selectedMidId}
                        parentCls={selectedMainId}
                        handleChildItemType={(e: any) => handleRowClick(e, 1)}
                        saveCategory={() => saveCategory(selectedMainId)}
                        handleDeleteCategory={handleDeleteCategory}
                        handleAddRow={handleAddRow}
                        removeInputRow={removeInputRow}
                        fetchCategories={fetchCategories} handleInputChange={handleInputChange} 
                        handleSelectedCheck={() => {}} isChecked={false} itemType="CLASS1" childItemType="CLASS2" maxLength={2}
                    />

                    {/* 3단: 중분류 */}
                    <CategoryTable
                        title="중분류"
                        itemLvl={2}
                        categories={class2List}
                        inputDatas={inputDatas.filter(d => d.itemLvl === 2 && d.parentItemCls === (selectedMidId || null))}
                        itemCls={selectedSubId}
                        parentCls={selectedMidId}
                        handleChildItemType={(e: any) => handleRowClick(e, 2)}
                        saveCategory={() => saveCategory(selectedMidId)}
                        handleDeleteCategory={handleDeleteCategory}
                        handleAddRow={handleAddRow}
                        removeInputRow={removeInputRow}
                        fetchCategories={fetchCategories} handleInputChange={handleInputChange} 
                        handleSelectedCheck={() => {}} isChecked={false} itemType="CLASS2" childItemType="CLASS3" maxLength={2}
                    />

                    {/* 4단: 소분류 */}
                    <CategoryTable
                        title="소분류"
                        itemLvl={3}
                        categories={class3List}
                        inputDatas={inputDatas.filter(d => d.itemLvl === 3 && d.parentItemCls === (selectedSubId || null))}
                        itemCls="" // 소분류는 하위 단계가 없으므로 선택 상태를 관리할 필요 없음
                        parentCls={selectedSubId}
                        handleChildItemType={() => {}} // 하위 단계가 없으므로 빈 함수
                        saveCategory={() => saveCategory(selectedSubId)}
                        handleDeleteCategory={handleDeleteCategory}
                        handleAddRow={handleAddRow}
                        removeInputRow={removeInputRow}
                        fetchCategories={fetchCategories} handleInputChange={handleInputChange} 
                        handleSelectedCheck={() => {}} isChecked={false} itemType="CLASS3" childItemType="" maxLength={2}
                    />

                </div>
            </div>
        </div>
    );
}