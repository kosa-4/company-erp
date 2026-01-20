import React from 'react';
import { PrGroup } from '@/lib/api/rfq';
import { Badge, Button } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { X } from 'lucide-react';

interface PrDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PrGroup | null;
}

export default function PrDetailModal({ isOpen, onClose, data }: PrDetailModalProps) {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                    {/* Header */}
                    <div className="bg-white px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                구매요청 상세 정보
                                <span className="ml-2 text-sm font-normal text-gray-500">({data.prNum})</span>
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">요청일자: {data.prDate}</p>
                        </div>
                        <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        {/* 기본 정보 */}
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 bg-gray-50 p-4 rounded-lg">
                            <div className="sm:col-span-3">
                                <dt className="text-sm font-medium text-gray-500">구매요청명</dt>
                                <dd className="mt-1 text-sm text-gray-900">{data.prSubject}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">구매유형</dt>
                                <dd className="mt-1">
                                    <Badge variant={data.pcType === 'URGENT' ? 'red' : 'blue'}>
                                        {data.pcTypeNm}
                                    </Badge>
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">요청부서</dt>
                                <dd className="mt-1 text-sm text-gray-900">{data.reqDeptNm}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">요청자</dt>
                                <dd className="mt-1 text-sm text-gray-900">{data.requester}</dd>
                            </div>
                        </div>

                        {/* 품목 리스트 */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">요청 품목 목록</h4>
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase sm:pl-6">라인</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase">품목코드</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase">품목명</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase">규격</th>
                                            <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium text-gray-500 uppercase">단위</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 uppercase">수량</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 uppercase">예상단가</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 uppercase">예상금액</th>
                                            <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium text-gray-500 uppercase">납기요청일</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {data.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">{index + 1}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900">{item.itemCd}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{item.itemDesc}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{item.itemSpec || '-'}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 text-center">{item.unitCd}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900 text-right">{formatNumber(item.prQt)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 text-right">₩{formatNumber(item.unitPrc)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900 text-right">₩{formatNumber(item.prAmt)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 text-center">{item.delyDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={7} className="py-3 pl-4 pr-3 text-sm font-medium text-gray-900 text-right sm:pl-6">합계</td>
                                            <td className="px-3 py-3 text-sm font-bold text-blue-600 text-right">₩{formatNumber(data.totalAmount)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <Button variant="secondary" onClick={onClose}>
                            닫기
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
