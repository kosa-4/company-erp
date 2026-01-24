import React from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { PrGroup } from '@/lib/api/rfq';
import { formatNumber } from '@/lib/utils';

interface PrDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PrGroup | null;
}

export default function PrDetailModal({ isOpen, onClose, data }: PrDetailModalProps) {
    const totalAmount = data?.items?.reduce((sum, item) => sum + (item.prAmt || 0), 0) || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="구매요청 상세"
            size="xl"
            footer={
                <div className="flex w-full items-center justify-end">
                    <Button variant="outline" onClick={onClose}>
                        닫기
                    </Button>
                </div>
            }
        >
            {data ? (
                <div className="space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <div className="space-y-1">
                            <label className="text-xs text-stone-500">구매요청번호</label>
                            <div className="text-base text-stone-900">{data.prNum}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-stone-500">구매요청명</label>
                            <div className="text-base text-stone-900 truncate" title={data.prSubject}>
                                {data.prSubject}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-stone-500">요청일자</label>
                            <div className="text-base text-stone-900">{data.prDate}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-stone-500">담당자</label>
                            <div className="text-base text-stone-900">{data.requester}</div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-stone-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-stone-500">품목코드</th>
                                    <th className="px-4 py-3 text-left font-medium text-stone-500">품목명</th>
                                    <th className="px-4 py-3 text-right font-medium text-stone-500">수량</th>
                                    <th className="px-4 py-3 text-right font-medium text-stone-500">단가</th>
                                    <th className="px-4 py-3 text-right font-medium text-stone-500">금액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {data.items && data.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-stone-50">
                                        <td className="px-4 py-3 text-stone-600">{item.itemCd}</td>
                                        <td className="px-4 py-3 text-stone-900">{item.itemDesc}</td>
                                        <td className="px-4 py-3 text-right text-stone-900">{formatNumber(item.prQt)}</td>
                                        <td className="px-4 py-3 text-right text-stone-600">₩{formatNumber(item.unitPrc)}</td>
                                        <td className="px-4 py-3 text-right text-stone-900">₩{formatNumber(item.prAmt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Amount */}
                    <div className="flex justify-end items-center gap-4 pt-2">
                        <span className="text-stone-500">총 금액:</span>
                        <span className="text-xl font-bold text-blue-600">
                            ₩{formatNumber(totalAmount)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="py-12 text-center text-stone-500">
                    데이터를 불러올 수 없습니다.
                </div>
            )}
        </Modal>
    );
}
