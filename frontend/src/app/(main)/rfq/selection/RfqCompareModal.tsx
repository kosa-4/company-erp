'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Badge, Button } from '@/components/ui';
import { rfqApi } from '@/lib/api/rfq';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';

type CompareResponse = {
    rfqNo: string;
    rfqName: string;
    items: Array<{
        lineNo: number;
        itemCd: string;
        itemDesc: string;
        itemSpec?: string;
        unitCd?: string;
        qty: number;
    }>;
    vendors: Array<{
        vendorCd: string;
        vendorNm: string;
        selectYn?: 'Y' | 'N';
    }>;
    quotes: Array<{
        vendorCd: string;
        lineNo: number;
        unitPrice: number | null;
        amount: number | null;
    }>;
};

export default function RfqCompareModal({
                                            isOpen,
                                            rfqNo,
                                            onClose,
                                        }: {
    isOpen: boolean;
    rfqNo: string | null;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CompareResponse | null>(null);

    useEffect(() => {
        if (!isOpen || !rfqNo) return;

        // 모달 재오픈 시 잔상 방지
        setData(null);

        (async () => {
            try {
                setLoading(true);

                // ✅ 실제 API 붙일 때
                // const res: CompareResponse = await rfqApi.getCompareDetail(rfqNo);
                // setData(res);

                // ✅ 더미 데이터 (확인용)
                const res: CompareResponse = {
                    rfqNo,
                    rfqName: '테스트 RFQ',
                    items: [
                        { lineNo: 1, itemCd: 'IT001', itemDesc: '품목A', qty: 10 },
                        { lineNo: 2, itemCd: 'IT002', itemDesc: '품목B', qty: 5 },
                    ],
                    vendors: [
                        { vendorCd: 'V030', vendorNm: 'test0120', selectYn: 'N' },
                        { vendorCd: 'V035', vendorNm: '동네통테', selectYn: 'Y' },
                    ],
                    quotes: [
                        { vendorCd: 'V030', lineNo: 1, unitPrice: 3400, amount: 34000 },
                        { vendorCd: 'V035', lineNo: 1, unitPrice: 19500, amount: 195000 },
                    ],
                };

                setData(res);
            } catch (e) {
                toast.error('견적 비교 데이터를 불러오지 못했습니다.');
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [isOpen, rfqNo]);

    const cellMap = useMemo(() => {
        const m = new Map<string, { unitPrice: number | null; amount: number | null }>();
        if (!data) return m;
        for (const q of data.quotes) {
            m.set(`${q.vendorCd}::${q.lineNo}`, { unitPrice: q.unitPrice, amount: q.amount });
        }
        return m;
    }, [data]);

    const vendorTotals = useMemo(() => {
        if (!data) return {};
        const totals: Record<string, number> = {};
        for (const q of data.quotes) {
            if (q.amount != null) {
                totals[q.vendorCd] = (totals[q.vendorCd] || 0) + q.amount;
            }
        }
        return totals;
    }, [data]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="견적 비교" size="xl">
            <div className="p-4">
                {loading ? (
                    <div className="py-10 text-center text-stone-500">불러오는 중...</div>
                ) : !data ? (
                    <div className="py-10 text-center text-stone-500">데이터가 없습니다.</div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-stone-500">RFQ</div>
                                <div className="text-base font-semibold text-stone-800">
                                    {data.rfqNo} · {data.rfqName}
                                </div>
                            </div>
                            <Badge variant="blue">참여 협력사 : {data.vendors.length}개</Badge>
                        </div>

                        <div className="overflow-auto border border-stone-200 rounded-lg">
                            <table className="min-w-[1100px] w-full border-collapse">
                                {/* ✅ colSpan/rowSpan 꼬임 방지: colgroup로 열 수 고정 */}
                                <colgroup>
                                    <col style={{ width: 260 }} />
                                    <col style={{ width: 90 }} />
                                    {data.vendors.map(v => (
                                        <React.Fragment key={v.vendorCd}>
                                            <col style={{ width: 140 }} />
                                            <col style={{ width: 160 }} />
                                        </React.Fragment>
                                    ))}
                                </colgroup>

                                <thead className="bg-stone-50">
                                {/* 1행: 협력사 그룹 헤더 */}
                                <tr className="border-b border-stone-200">
                                    <th
                                        rowSpan={2}
                                        className="px-3 py-2 text-xs font-medium text-stone-500 text-left align-middle"
                                    >
                                        품목
                                    </th>
                                    <th
                                        rowSpan={2}
                                        className="px-3 py-2 text-xs font-medium text-stone-500 text-right align-middle"
                                    >
                                        수량
                                    </th>

                                    {data.vendors.map(v => {
                                        const isWinner = v.selectYn === 'Y';
                                        return (
                                            <th
                                                key={v.vendorCd}
                                                colSpan={2}
                                                className={`px-3 py-2 text-xs font-medium text-center ${
                                                    isWinner ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className={`font-semibold ${isWinner ? 'text-blue-700' : 'text-stone-700'}`}>
                                                    {v.vendorNm}
                                                </div>
                                                <div className="text-[11px] text-stone-400">{v.vendorCd}</div>
                                            </th>
                                        );
                                    })}
                                </tr>

                                {/* 2행: 단가/금액 서브 헤더 */}
                                <tr className="border-b border-stone-200">
                                    {data.vendors.map(v => {
                                        const isWinner = v.selectYn === 'Y';
                                        return (
                                            <React.Fragment key={v.vendorCd}>
                                                <th
                                                    className={`px-3 py-2 text-[11px] font-medium text-stone-500 text-right ${
                                                        isWinner ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    단가
                                                </th>
                                                <th
                                                    className={`px-3 py-2 text-[11px] font-medium text-stone-500 text-right ${
                                                        isWinner ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    금액
                                                </th>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-stone-100">
                                {data.items.map(item => (
                                    <tr key={item.lineNo} className="hover:bg-stone-50/60">
                                        <td className="px-3 py-2 text-sm text-stone-700">
                                            <div className="font-medium">{item.itemDesc}</div>
                                            <div className="text-xs text-stone-400">
                                                {item.itemCd}
                                                {item.itemSpec ? ` · ${item.itemSpec}` : ''}
                                                {item.unitCd ? ` · ${item.unitCd}` : ''}
                                            </div>
                                        </td>

                                        <td className="px-3 py-2 text-sm text-stone-700 text-right">
                                            {formatNumber(item.qty)}
                                        </td>

                                        {data.vendors.map(v => {
                                            const isWinner = v.selectYn === 'Y';
                                            const cell = cellMap.get(`${v.vendorCd}::${item.lineNo}`);
                                            const unitPrice = cell?.unitPrice ?? null;
                                            const amount = cell?.amount ?? null;

                                            return (
                                                <React.Fragment key={v.vendorCd}>
                                                    <td
                                                        className={`px-3 py-2 text-sm text-right text-stone-700 ${
                                                            isWinner ? 'bg-blue-50/60' : ''
                                                        }`}
                                                    >
                                                        {unitPrice == null ? (
                                                            <span className="text-stone-300">-</span>
                                                        ) : (
                                                            `₩${formatNumber(unitPrice)}`
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`px-3 py-2 text-sm text-right text-stone-700 ${
                                                            isWinner ? 'bg-blue-50/60' : ''
                                                        }`}
                                                    >
                                                        {amount == null ? (
                                                            <span className="text-stone-300">-</span>
                                                        ) : (
                                                            `₩${formatNumber(amount)}`
                                                        )}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}

                                {/* 합계: 금액 열에만 표시 (단가 열은 비움) */}
                                <tr className="bg-stone-50 border-t border-stone-200">
                                    <td className="px-3 py-2 text-sm font-semibold text-stone-700">합계</td>
                                    <td></td>

                                    {data.vendors.map(v => {
                                        const isWinner = v.selectYn === 'Y';
                                        const total = vendorTotals[v.vendorCd] || 0;
                                        return (
                                            <React.Fragment key={v.vendorCd}>
                                                <td className={`${isWinner ? 'bg-blue-50/60' : ''}`}></td>
                                                <td
                                                    className={`px-3 py-2 text-sm font-semibold text-right text-stone-700 ${
                                                        isWinner ? 'bg-blue-50/60' : ''
                                                    }`}
                                                >
                                                    ₩{formatNumber(total)}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={onClose}>
                                닫기
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
