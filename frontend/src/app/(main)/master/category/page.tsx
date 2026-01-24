'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '@/components/ui';
import CategoryTable from './CategoryTable';
import { Category } from '../item/TreeItem';

let tempId = 0;

// [핵심 1] Category 타입 확장 (isModified 사용을 위해)
type CategoryState = Category & { isModified?: boolean };

interface InputCategory {
    tempKey: number;
    itemCls: string;
    itemClsNm: string;
    useFlag: boolean;
    itemLvl: number;
    parentItemCls: string | null;
    isModified?: boolean;
}

export default function CategoryPage() {
    // [핵심 2] rootList 상태 제거! 오직 cateMap만 믿습니다.
    const [cateMap, setCateMap] = useState<{ [key: string]: CategoryState }>({});
    
    // 선택 상태 관리
    const [selectedMainId, setSelectedMainId] = useState(""); 
    const [selectedMidId, setSelectedMidId] = useState(""); 
    const [selectedSubId, setSelectedSubId] = useState(""); 
    
    const selectedMainIdRef = useRef(selectedMainId);
    const selectedMidIdRef = useRef(selectedMidId);
    const selectedSubIdRef = useRef(selectedSubId);

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

            const tempMap: { [key: string]: CategoryState } = {};
            
            // 1단계: 맵 생성
            data.forEach((c: any) => {
                tempMap[c.itemCls] = { 
                    ...c, 
                    useFlag: c.useFlag === 'Y', 
                    children: [], // 이제 children 배열은 화면 렌더링에 안 씀 (useMemo로 대체)
                    isModified: false
                };
            });

            // 2단계: 부모-자식 연결 (트리 탐색용으로 남겨둠, 필수는 아님)
            data.forEach((c: any) => {
                const pId = c.parentItemCls;
                if (pId && tempMap[pId]) {
                    if(!tempMap[pId].children) tempMap[pId].children = [];
                    tempMap[pId].children?.push(tempMap[c.itemCls]);
                }
            });

            // [핵심 3] setRootList 삭제 -> cateMap만 업데이트하면 끝
            setCateMap(tempMap);
            setInputDatas([]); 

            // 선택 상태 복구
            const nextMainId = tempMap[selectedMainIdRef.current] ? selectedMainIdRef.current : "";
            const nextMidId = (nextMainId && tempMap[nextMainId]?.children?.some((c: any) => c.itemCls === selectedMidIdRef.current))
                ? selectedMidIdRef.current : "";
            const nextSubId = (nextMidId && tempMap[nextMidId]?.children?.some((c: any) => c.itemCls === selectedSubIdRef.current))
                ? selectedSubIdRef.current : "";

            setSelectedMainId(nextMainId);
            setSelectedMidId(nextMidId);
            setSelectedSubId(nextSubId);
        } catch (err: any) {
            console.error("데이터 로딩 중 오류 발생", err);
            alert("카테고리 목록을 불러오지 못했습니다.\n" + (err.message || "서버 오류"));
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // [핵심 4] 리스트를 cateMap에서 실시간으로 생성 (입력 시 바로 반영됨)
    
    // 1단 (Root)
    const rootList = useMemo(() => {
        return Object.values(cateMap)
            .filter(c => c.itemLvl === 0)
            .sort((a, b) => a.itemCls.localeCompare(b.itemCls));
    }, [cateMap]);

    // 2단 (대분류)
    const class1List = useMemo(() => {
        if (!selectedMainId) return [];
        return Object.values(cateMap)
            .filter(c => c.parentItemCls === selectedMainId)
            .sort((a, b) => a.itemCls.localeCompare(b.itemCls));
    }, [cateMap, selectedMainId]);

    // 3단 (중분류)
    const class2List = useMemo(() => {
        if (!selectedMidId) return [];
        return Object.values(cateMap)
            .filter(c => c.parentItemCls === selectedMidId)
            .sort((a, b) => a.itemCls.localeCompare(b.itemCls));
    }, [cateMap, selectedMidId]);

    // 4단 (소분류)
    const class3List = useMemo(() => {
        if (!selectedSubId) return [];
        return Object.values(cateMap)
            .filter(c => c.parentItemCls === selectedSubId)
            .sort((a, b) => a.itemCls.localeCompare(b.itemCls));
    }, [cateMap, selectedSubId]);


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
        const parentId = !targetParentId || targetParentId === "" ? null : targetParentId;
        const newInput: InputCategory = {
            tempKey: tempId++,
            itemCls: '',
            itemClsNm: '',
            useFlag: true,
            itemLvl: itemLvl,
            parentItemCls: parentId,
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

    // [핵심 5] 수정 핸들러 (cateMap을 업데이트 -> 위 useMemo가 감지 -> 리스트 갱신 -> 화면 변경)
    const handleEditChange = (itemCls: string, field: string, value: any) => {
        setCateMap(prev => {
            const target = prev[itemCls];
            if (!target) return prev;

            return {
                ...prev,
                [itemCls]: {
                    ...target,
                    [field]: value,
                    isModified: true
                }
            };
        });
    };

    const saveCategory = async (targetParentId: string) => {
        const currentParent = !targetParentId || targetParentId === "" ? null : targetParentId;
        
        // A. 신규 데이터
        const newItemsToSave = inputDatas.filter(d => {
            const isSameParent = d.parentItemCls === currentParent;
            const isNameFilled = d.itemClsNm && d.itemClsNm.trim() !== '';
            const isCodeFilled = d.itemLvl !== 0 || (d.itemCls && d.itemCls.trim() !== ''); 
            return isSameParent && isNameFilled && isCodeFilled;
        });

        // B. 수정 데이터
        const modifiedItemsToSave = Object.values(cateMap).filter((c: any) => {
            const itemParent = (!c.parentItemCls || c.parentItemCls === "") ? null : c.parentItemCls;
            const targetParent = (!currentParent || currentParent === "") ? null : currentParent;
            return itemParent === targetParent && c.isModified;
        });

        if (newItemsToSave.length === 0 && modifiedItemsToSave.length === 0) {
            alert("저장하거나 수정할 데이터가 없습니다.");
            return;
        }

        try {
            // 1) 신규 저장
            if (newItemsToSave.length > 0) {
                const payload = newItemsToSave.map((row) => {
                    const { tempKey, itemCls, useFlag, ...rest } = row;
                    const commonData = { ...rest, useFlag: useFlag === true ? 'Y' : 'N' };
                    if (rest.itemLvl !== 0) return commonData;
                    return { itemCls, ...commonData };
                });

                const res = await fetch("/api/v1/categories/new", {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(await res.text() || "신규 저장 실패");
            }

            // 2) 수정 저장
            if (modifiedItemsToSave.length > 0) {
                const updatePayload = modifiedItemsToSave.map(c => ({
                    itemCls: c.itemCls,
                    itemClsNm: c.itemClsNm,
                    useFlag: c.useFlag === true ? 'Y' : 'N',
                }));

                const res = await fetch("/api/v1/categories/update", {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(updatePayload),
                });
                if (!res.ok) throw new Error(await res.text() || "수정 실패");
            }

            alert("저장되었습니다.");
            await fetchCategories(); 

        } catch (err: any) {
            alert("오류 발생: " + err.message);
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
            <PageHeader title="품목 분류" subtitle="품목 분류를 조회하고 관리합니다." />
            <div className="p-4 bg-gray-100 min-h-screen text-sm">
                <div className="grid grid-cols-4 gap-2 h-[650px]">
                    
                    {/* 1단 */}
                    <CategoryTable
                        title="품목 종류"
                        itemLvl={0}
                        categories={rootList} // 이제 useMemo로 실시간 반영된 리스트가 들어감
                        inputDatas={inputDatas.filter(d => d.itemLvl === 0 && d.parentItemCls === null)}
                        itemCls={selectedMainId}
                        handleChildItemType={(e: any) => handleRowClick(e, 0)}
                        handleAddRow={handleAddRow}
                        removeInputRow={removeInputRow}
                        saveCategory={() => saveCategory("")}
                        handleEditChange={handleEditChange}
                        handleDeleteCategory={handleDeleteCategory}
                        parentCls="" fetchCategories={fetchCategories} handleInputChange={handleInputChange} 
                        handleSelectedCheck={() => {}} isChecked={false} itemType="MAIN" childItemType="CLASS1" maxLength={2}
                    />

                    {/* 2단 */}
                    <CategoryTable
                        title="대분류"
                        itemLvl={1}
                        categories={class1List}
                        inputDatas={inputDatas.filter(d => d.itemLvl === 1 && d.parentItemCls === (selectedMainId || null))}
                        itemCls={selectedMidId}
                        parentCls={selectedMainId}
                        handleChildItemType={(e: any) => handleRowClick(e, 1)}
                        saveCategory={() => saveCategory(selectedMainId)}
                        handleEditChange={handleEditChange}
                        handleDeleteCategory={handleDeleteCategory}
                        handleAddRow={handleAddRow}
                        removeInputRow={removeInputRow}
                        fetchCategories={fetchCategories} handleInputChange={handleInputChange} 
                        handleSelectedCheck={() => {}} isChecked={false} itemType="CLASS1" childItemType="CLASS2" maxLength={2}
                    />

                    {/* 3단 */}
                    <CategoryTable
                        title="중분류"
                        itemLvl={2}
                        categories={class2List}
                        inputDatas={inputDatas.filter(d => d.itemLvl === 2 && d.parentItemCls === (selectedMidId || null))}
                        itemCls={selectedSubId}
                        parentCls={selectedMidId}
                        handleChildItemType={(e: any) => handleRowClick(e, 2)}
                        saveCategory={() => saveCategory(selectedMidId)}
                        handleEditChange={handleEditChange}
                        handleDeleteCategory={handleDeleteCategory}
                        handleAddRow={handleAddRow}
                        removeInputRow={removeInputRow}
                        fetchCategories={fetchCategories} handleInputChange={handleInputChange} 
                        handleSelectedCheck={() => {}} isChecked={false} itemType="CLASS2" childItemType="CLASS3" maxLength={2}
                    />

                    {/* 4단 */}
                    <CategoryTable
                        title="소분류"
                        itemLvl={3}
                        categories={class3List}
                        inputDatas={inputDatas.filter(d => d.itemLvl === 3 && d.parentItemCls === (selectedSubId || null))}
                        itemCls="" 
                        parentCls={selectedSubId}
                        handleChildItemType={() => {}} 
                        saveCategory={() => saveCategory(selectedSubId)}
                        handleEditChange={handleEditChange}
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