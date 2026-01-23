'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Badge, Button } from '@/components/ui';
import { rfqApi, CompareResponse } from '@/lib/api/rfq';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';

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

        setData(null);

        (async () => {
            try {
                setLoading(true);
                const res = await rfqApi.getCompareDetail(rfqNo);
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
        const m = new Map<string, { unitPrice: number | null; quoteQt: number | null; amount: number | null }>();
        if (!data) return m;
        for (const q of data.quotes) {
            m.set(`${q.vendorCd}::${q.lineNo}`, {
                unitPrice: q.unitPrice,
                quoteQt: q.quoteQt,
                amount: q.amount,
            });
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

    // 선정된 업체가 앞에 보이게
    const sortedVendors = useMemo(() => {
        if (!data) return [];
        return [...data.vendors].sort((a, b) => {
            const aWinner = a.selectYn === 'Y' ? 0 : 1;
            const bWinner = b.selectYn === 'Y' ? 0 : 1;
            if (aWinner !== bWinner) return aWinner - bWinner; // ✅ Y가 먼저
            return (a.vendorCd || '').localeCompare(b.vendorCd || ''); // 나머진 코드순(원하면 제거)
        });
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
                            <table className="w-full table-fixed min-w-[980px] border-separate border-spacing-0">
                                <colgroup>
                                    <col style={{ width: 150 }} />
                                    <col style={{ width: 50 }} />
                                    {sortedVendors.map(v => (
                                        <React.Fragment key={v.vendorCd}>
                                            <col style={{ width: 50 }} />
                                            <col style={{ width: 50 }} />
                                            <col style={{ width: 60 }} />
                                        </React.Fragment>
                                    ))}
                                </colgroup>

                                <thead className="bg-stone-50">
                                <tr>
                                    <th
                                        rowSpan={2}
                                        className="px-2 py-2 text-xs font-semibold text-stone-600 text-left align-middle border-b-2 border-stone-300 border-r border-stone-200 last:border-r-0"
                                    >
                                        품목
                                    </th>
                                    <th
                                        rowSpan={2}
                                        className="px-2 py-2 text-xs font-semibold text-stone-600 text-right align-middle border-b-2 border-stone-300 border-r border-stone-200 last:border-r-0"
                                    >
                                        요구수량
                                    </th>

                                    {sortedVendors.map((v) => {
                                        const isWinner = v.selectYn === 'Y';
                                        return (
                                            <th
                                                key={v.vendorCd}
                                                colSpan={3}
                                                className={`px-2 py-2 text-xs font-semibold text-center border-b border-stone-200 border-r border-stone-200 last:border-r-0 ${
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

                                <tr>
                                    {sortedVendors.map((v) => {
                                        const isWinner = v.selectYn === 'Y';
                                        const thClass =
                                            `px-2 py-2 text-[11px] font-semibold text-stone-600 text-right border-b-2 border-stone-300 border-r border-stone-200 last:border-r-0 ` +
                                            (isWinner ? 'bg-blue-50' : '');
                                        return (
                                            <React.Fragment key={v.vendorCd}>
                                                <th className={thClass}>단가</th>
                                                <th className={thClass}>견적수량</th>
                                                <th className={thClass}>금액</th>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                                </thead>

                                <tbody className="bg-white">
                                {data.items.map((item) => (
                                    <tr key={item.lineNo} className="hover:bg-stone-50/60">
                                        <td className="px-2 py-2 text-sm text-stone-700 border-b border-stone-200 border-r border-stone-200 last:border-r-0">
                                            <div className="font-semibold truncate">{item.itemDesc}</div> {/* truncate : 텍스트가 늘어지지 않게함 */}
                                            <div className="text-xs text-stone-400 truncate">
                                                {item.itemCd}
                                                {item.itemSpec ? ` · ${item.itemSpec}` : ''}
                                                {item.unitCd ? ` · ${item.unitCd}` : ''}
                                            </div>
                                        </td>

                                        <td className="px-2 py-2 text-sm font-semibold text-stone-800 text-right border-b border-stone-200 border-r border-stone-200 last:border-r-0">
                                            {formatNumber(item.qty)}
                                        </td>

                                        {sortedVendors.map((v) => {
                                            const isWinner = v.selectYn === 'Y';
                                            const cell = cellMap.get(`${v.vendorCd}::${item.lineNo}`);
                                            const unitPrice = cell?.unitPrice ?? null;
                                            const quoteQt = cell?.quoteQt ?? null;
                                            const amount = cell?.amount ?? null;

                                            const tdBase =
                                                `px-2 py-2 text-sm text-right font-medium text-stone-700 border-b border-stone-200 border-r border-stone-200 last:border-r-0 ` +
                                                (isWinner ? 'bg-blue-50/60' : '');

                                            return (
                                                <React.Fragment key={v.vendorCd}>
                                                    <td className={tdBase}>
                                                        {unitPrice == null ? <span className="text-stone-300">-</span> : `₩${formatNumber(unitPrice)}`}
                                                    </td>
                                                    <td className={tdBase}>
                                                        {quoteQt == null ? <span className="text-stone-300">-</span> : formatNumber(quoteQt)}
                                                    </td>
                                                    <td className={tdBase}>
                                                        {amount == null ? <span className="text-stone-300">-</span> : `₩${formatNumber(amount)}`}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}

                                {/* 합계 */}
                                <tr className="bg-stone-50">
                                    <td className="px-2 py-2 text-sm font-semibold text-stone-800 border-t-2 border-stone-300 border-r border-stone-200 last:border-r-0">
                                        합계
                                    </td>
                                    <td className="border-t-2 border-stone-300 border-r border-stone-200 last:border-r-0"></td>

                                    {sortedVendors.map((v) => {
                                        const isWinner = v.selectYn === 'Y';
                                        const total = vendorTotals[v.vendorCd] || 0;

                                        const tdBlank = `border-t-2 border-stone-300 border-r border-stone-200 last:border-r-0 ${
                                            isWinner ? 'bg-blue-50/60' : ''
                                        }`;

                                        return (
                                            <React.Fragment key={v.vendorCd}>
                                                <td className={tdBlank}></td>
                                                <td className={tdBlank}></td>
                                                <td
                                                    className={`px-2 py-2 text-sm font-semibold text-right text-stone-800 border-t-2 border-stone-300 border-r border-stone-200 last:border-r-0 ${
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
