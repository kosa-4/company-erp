import React, { useState } from 'react';

// 타입 정의

export interface Category {
    itemCls: string,
    itemClsNm: string,
    useFlag: boolean,
    itemLvl:number,
    parentItemCls:string,
    children?: Category[],
    top: any
  }

interface Props {
  root: Category;
  onSelect: (node: Category) => void;
  selectedId?: string;
}

const TreeItem = ({ root, onSelect, selectedId }: Props) => {
  // console.log(node);
  const [isOpen, setIsOpen] = useState(false); // 기본적으로 딛겨있게 설정
  const hasChildren = root.children && root.children.length > 0;
  const isSelected = selectedId === root.itemCls;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모로 클릭 이벤트가 퍼지는 것 방지
    if (hasChildren) {
      setIsOpen(!isOpen); // 현재 상태의 반대로 바꿈 (토글)
    }
    onSelect(root); // 항목 선택도 동시에 처리
  };

  return (
    <div className="select-none"> {/* 텍스트 드래그 방지 */}
      <div 
        onClick={handleToggle}
        className={`
          flex items-center py-1.5 px-2 cursor-pointer rounded-md transition-all
          ${isSelected ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-100 text-gray-700'}
        `}
      >
        {/* 2. 화살표 아이콘: 자식이 있을 때만 표시 */}
        <div className="w-5 h-5 flex items-center justify-center mr-1">
          {hasChildren && (
            <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
              ▶ 
            </span>
          )}
        </div>

        {/* 카테고리 이름 */}
        <span className="text-sm">{root.itemClsNm}</span>
      </div>

      {/* 3. 토글 영역: isOpen이 true이고 자식이 있을 때만 렌더링 */}
      {isOpen && hasChildren && (
        <div className="ml-4 border-l border-gray-200">
          {root.children?.map((child) => (
            <TreeItem 
              key={child.itemCls} 
              root={child} 
              onSelect={onSelect} 
              selectedId={selectedId} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeItem;