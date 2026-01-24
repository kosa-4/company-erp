'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Calendar, User, FileText, Upload, Eye, Trash2, X, Download } from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  DatePicker,
  Textarea,
  DataGrid,
  SearchPanel,
  Modal,
  ModalFooter
} from '@/components/ui';
import { Notice, ColumnDef } from '@/types';
import { noticeApi, NoticeListResponse, NoticeDetailResponse, FileListItemResponse } from '@/lib/api/notice';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';



export default function NoticePage() {
  const { user } = useAuth();
  const isBuyer = user?.role === 'BUYER' || user?.role === 'ADMIN';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    title: '',
  });
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: '',
    content: '',
  });
  const [selectedNotices, setSelectedNotices] = useState<string[]>([]);
  const [regUserName, setRegUserName] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    startDate: '',
    endDate: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<FileListItemResponse[]>([]);
  const [originalAttachedFiles, setOriginalAttachedFiles] = useState<FileListItemResponse[]>([]);
  const [editUploadedFiles, setEditUploadedFiles] = useState<File[]>([]);
  const [deletedFileNums, setDeletedFileNums] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // 공지사항 목록 조회
  const fetchNoticeList = async () => {
    try {
      setLoading(true);
      console.log('공지사항 목록 조회 시작:', searchParams);
      const response = await noticeApi.getList({
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
        subject: searchParams.title || undefined,
      });
      
      console.log('공지사항 목록 응답:', response);
      
      // NoticeListResponse를 Notice 타입으로 변환
      const transformedNotices: Notice[] = response.map((item: NoticeListResponse) => ({
        noticeNo: item.noticeNum,
        title: item.subject,
        content: '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        createdAt: item.regDate || '',
        createdBy: item.regUserId || '',
        createdByName: item.regUserName || '',
        viewCnt: item.viewCnt || 0,
      }));
      
      console.log('변환된 공지사항 목록:', transformedNotices);
      setNotices(transformedNotices);
    } catch (error: any) {
      console.error('공지사항 목록 조회 실패:', error);
      console.error('에러 상세:', {
        status: error?.status,
        message: error?.message,
        data: error?.data
      });
      toast.error(error?.data?.error || error?.message || '공지사항 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await fetchNoticeList();
  };

  const handleReset = () => {
    setSearchParams({
      startDate: '',
      endDate: '',
      title: '',
    });
  };

  const handleRowClick = async (notice: Notice) => {
    try {
      setIsDetailModalOpen(true);
      setIsEditing(false);
      // 상세 조회 API 호출
      const detail = await noticeApi.getDetail(notice.noticeNo);
      
      // NoticeDetailResponse를 Notice 타입으로 변환
      const noticeDetail: Notice = {
        noticeNo: detail.noticeNum,
        title: detail.subject,
        content: detail.content,
        startDate: detail.startDate,
        endDate: detail.endDate,
        createdAt: detail.regDate,
        createdBy: detail.regUserId,
        createdByName: detail.regUserName,
        modDate: detail.modDate,
        viewCnt: detail.viewCnt || 0,
      };
      
      setSelectedNotice(noticeDetail);
      setEditFormData({
        subject: detail.subject,
        content: detail.content,
      });
      
      // 첨부파일 목록 설정
      const files = detail.files || [];
      setAttachedFiles(files);
      setOriginalAttachedFiles(files);
      
      // 목록의 조회수도 업데이트
      setNotices(prev => prev.map(n => 
        n.noticeNo === noticeDetail.noticeNo 
          ? { ...n, viewCnt: detail.viewCnt || 0 }
          : n
      ));
    } catch (error: any) {
      console.error('공지사항 상세 조회 실패:', error);
      toast.error(error?.data?.error || error?.message || '공지사항 상세를 불러오는데 실패했습니다.');
      setIsDetailModalOpen(false);
    }
  };
  
  const handleContentClick = () => {
    if (!isBuyer) return;
    setIsEditing(true);
    setDeletedFileNums([]);
    setEditUploadedFiles([]);
  };

  const handleTitleClick = () => {
    if (!isBuyer) return;
    setIsEditing(true);
    setDeletedFileNums([]);
    setEditUploadedFiles([]);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditUploadedFiles([]);
    setDeletedFileNums([]);
    // 첨부파일 목록을 원본 상태로 복원
    setAttachedFiles([...originalAttachedFiles]);
    if (selectedNotice) {
      setEditFormData({
        subject: selectedNotice.title,
        content: selectedNotice.content,
      });
    }
  };

  // 수정 모드에서 기존 파일 삭제 핸들러
  const handleDeleteExistingFile = (fileNum: string) => {
    setDeletedFileNums(prev => [...prev, fileNum]);
    setAttachedFiles(prev => prev.filter(file => file.fileNum !== fileNum));
  };
  
  const handleUpdate = async () => {
    if (!selectedNotice) return;
    
    // 유효성 검사
    if (!editFormData.subject || !editFormData.content) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }
    
    try {
      setSaving(true);
      console.log('공지사항 수정 시작:', {
        noticeNo: selectedNotice.noticeNo,
        subject: editFormData.subject,
        deletedFiles: deletedFileNums.length,
        newFiles: editUploadedFiles.length
      });
      
      // 1. 공지사항 내용 수정
      await noticeApi.update(selectedNotice.noticeNo, {
        subject: editFormData.subject,
        content: editFormData.content,
      });

      // 2. 삭제된 파일 논리적 삭제 처리
      if (deletedFileNums.length > 0) {
        console.log('삭제할 파일 개수:', deletedFileNums.length);
        for (const fileNum of deletedFileNums) {
          try {
            await noticeApi.deleteFile(fileNum);
            console.log('파일 삭제 완료:', fileNum);
          } catch (error: any) {
            console.error('파일 삭제 실패:', error);
            toast.error(`파일 삭제에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
          }
        }
      }
      
      // 3. 새로 추가된 파일 업로드
      if (editUploadedFiles.length > 0) {
        console.log('업로드할 파일 개수:', editUploadedFiles.length);
        for (const file of editUploadedFiles) {
          try {
            await noticeApi.uploadFile(selectedNotice.noticeNo, file);
            console.log('파일 업로드 완료:', file.name);
          } catch (error: any) {
            console.error('파일 업로드 실패:', error);
            toast.error(`${file.name} 업로드에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
          }
        }
      }
      
      toast.success('공지사항이 수정되었습니다.');
      setIsEditing(false);
      setEditUploadedFiles([]);
      setDeletedFileNums([]);
      
      // 상세 정보 새로고침
      const detail = await noticeApi.getDetail(selectedNotice.noticeNo);
      const noticeDetail: Notice = {
        noticeNo: detail.noticeNum,
        title: detail.subject,
        content: detail.content,
        startDate: detail.startDate,
        endDate: detail.endDate,
        createdAt: detail.regDate,
        createdBy: detail.regUserId,
        createdByName: detail.regUserName,
        modDate: detail.modDate,
        viewCnt: detail.viewCnt || 0,
      };
      setSelectedNotice(noticeDetail);
      setAttachedFiles(detail.files || []);
      
      // 목록 새로고침
      await fetchNoticeList();
    } catch (error: any) {
      console.error('공지사항 수정 실패:', error);
      toast.error(error?.data?.error || error?.message || '공지사항 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async (noticeNum: string, e?: React.MouseEvent) => {
    if (!isBuyer) return;
    if (e) {
      e.stopPropagation();
    }
    
    toast('정말 삭제하시겠습니까?', {
      action: {
        label: '삭제',
        onClick: async () => {
          try {
            await noticeApi.delete(noticeNum);
            toast.success('공지사항이 삭제되었습니다.');
            await fetchNoticeList();
          } catch (error: any) {
            console.error('공지사항 삭제 실패:', error);
            toast.error(error?.data?.error || error?.message || '공지사항 삭제에 실패했습니다.');
          }
        }
      }
    });
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotices(notices.map(n => n.noticeNo));
    } else {
      setSelectedNotices([]);
    }
  };
  
  const handleSelectNotice = (noticeNo: string, checked: boolean) => {
    if (checked) {
      setSelectedNotices(prev => [...prev, noticeNo]);
    } else {
      setSelectedNotices(prev => prev.filter(n => n !== noticeNo));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (!isBuyer) return;
    if (selectedNotices.length === 0) {
      toast.warning('삭제할 공지사항을 선택해주세요.');
      return;
    }
    
    toast(`선택한 ${selectedNotices.length}개의 공지사항을 삭제하시겠습니까?`, {
      action: {
        label: '삭제',
        onClick: async () => {
           try {
            await Promise.all(selectedNotices.map(noticeNum => noticeApi.delete(noticeNum)));
            toast.success('선택한 공지사항이 삭제되었습니다.');
            setSelectedNotices([]);
            await fetchNoticeList();
          } catch (error: any) {
            console.error('공지사항 일괄 삭제 실패:', error);
            toast.error(error?.data?.error || error?.message || '공지사항 삭제에 실패했습니다.');
          }
        }
      }
    });
  };

  // 선택된 항목 중 첫 번째를 상세 모달로 열기
  const handleEdit = async () => {
    if (!isBuyer) return;
    if (selectedNotices.length === 0) {
      toast.error('수정할 공지사항을 선택해주세요.');
      return;
    }
    
    // 여러 개 선택 시 알림 표시
    if (selectedNotices.length > 1) {
      toast.warning('수정은 1건만 가능합니다.');
      return;
    }
    
    // 선택된 항목 중 첫 번째를 찾아서 상세 모달 열기
    const firstSelectedNoticeNo = selectedNotices[0];
    const notice = notices.find(n => n.noticeNo === firstSelectedNoticeNo);
    
    if (notice) {
      await handleRowClick(notice);
      // 상세 모달이 열리면 수정 모드로 전환
      setIsEditing(true);
    }
  };

  // 초기 목록 로드
  useEffect(() => {
    fetchNoticeList();
  }, []);

  // 공지사항 등록 모달 열릴 때 초기 데이터 로드
  useEffect(() => {
    const loadInitData = async () => {
      if (isCreateModalOpen) {
        try {
          const initData = await noticeApi.getInitData();
          setRegUserName(initData.regUserName || '');
          setFormData({
            subject: '',
            content: '',
            startDate: '',
            endDate: '',
          });
        } catch (error: any) {
          console.error('초기 데이터 로드 실패:', error);
          console.error('에러 상세:', {
            status: error?.status,
            message: error?.message,
            data: error?.data
          });
          // 에러가 발생해도 모달은 열어둠 (기본값으로 표시)
          setRegUserName('');
        }
      }
    };

    loadInitData();
  }, [isCreateModalOpen]);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  // 파일 제거 핸들러
  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 수정 모드 파일 선택 핸들러
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditUploadedFiles(prev => [...prev, ...files]);
  };

  // 수정 모드 파일 제거 핸들러
  const handleEditFileRemove = (index: number) => {
    setEditUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 공지사항 저장 핸들러
  const handleSave = async () => {
    // 유효성 검사
    if (!formData.subject || !formData.content || !formData.startDate || !formData.endDate) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const response = await noticeApi.save({
        subject: formData.subject,
        content: formData.content,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      
      // 공지사항 번호 가져오기
      const noticeNum = (response as any).noticeNum;

      // 파일 업로드 (실패해도 공지사항은 저장됨)
      if (uploadedFiles.length > 0) {
        if (!noticeNum) {
          toast.error('공지사항 번호를 받지 못해 파일을 업로드할 수 없습니다.');
        } else {
          for (const file of uploadedFiles) {
            try {
              console.log(`파일 업로드 시도: ${file.name}, 크기: ${file.size} bytes`);
              await noticeApi.uploadFile(noticeNum, file);
              console.log(`파일 업로드 성공: ${file.name}`);
            } catch (error: any) {
              console.error('파일 업로드 실패:', error);
              console.error('에러 상세:', {
                message: error?.message,
                status: error?.status,
                data: error?.data,
                stack: error?.stack
              });
              toast.error(`${file.name} 업로드에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
            }
          }
        }
      }
      
      // 공지사항 저장 성공 메시지 표시
      toast.success('공지사항이 등록되었습니다.');
      setIsCreateModalOpen(false);
      
      // 체크박스 선택 해제
      setSelectedNotices([]);
      
      // 목록 새로고침
      await fetchNoticeList();
      
      // 폼 초기화
      setFormData({
        subject: '',
        content: '',
        startDate: '',
        endDate: '',
      });
      setUploadedFiles([]);
    } catch (error: any) {
      console.error('공지사항 저장 실패:', error);
      toast.error(error?.data?.error || error?.message || '공지사항 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const baseColumns: ColumnDef<Notice>[] = [
    {
      key: 'checkbox',
      header: (
        <input
          type="checkbox"
          checked={selectedNotices.length === notices.length && notices.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500 cursor-pointer"
        />
      ),
      width: 50,
      align: 'center',
      render: (_, notice) => (
        <div 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-full h-full"
        >
          <input
            type="checkbox"
            checked={selectedNotices.includes(notice.noticeNo)}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectNotice(notice.noticeNo, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500 cursor-pointer"
          />
        </div>
      ),
    },
    {
      key: 'noticeNo',
      header: '공지번호',
      width: 140,
      align: 'center',
      render: (value, notice) => (
        <span
          className="font-medium text-blue-600 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(notice);
          }}
        >
          {String(value)}
        </span>
      ),
    },
    {
      key: 'title',
      header: '공지명',
      align: 'left',
    },
    {
      key: 'createdAt',
      header: '등록일자',
      width: 120,
      align: 'center',
    },
    {
      key: 'createdByName',
      header: '등록자명',
      width: 100,
      align: 'center',
    },
    {
      key: 'startDate',
      header: '공지 시작일',
      width: 120,
      align: 'center',
    },
    {
      key: 'endDate',
      header: '공지 종료일',
      width: 120,
      align: 'center',
    },
    {
      key: 'viewCnt',
      header: '조회수',
      width: 80,
      align: 'center',
      render: (value) => (
        <span className="text-gray-600">{Number(value || 0)}</span>
      ),
    },
    {
      key: 'actions',
      header: '삭제',
      width: 80,
      align: 'center',
      render: (_, notice) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleDelete(notice.noticeNo, e)}
          icon={<Trash2 className="w-4 h-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          삭제
        </Button>
      ),
    },
  ];

  const columns: ColumnDef<Notice>[] = isBuyer
    ? baseColumns
    : baseColumns.filter(col => col.key !== 'checkbox' && col.key !== 'actions');

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Page Header - 무채색 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">공지사항</h1>
          <p className="text-sm text-gray-500">시스템 공지사항을 확인할 수 있습니다.</p>
        </div>
      </div>

      {/* Search Panel */}
      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <DatePicker
          label="공지기간 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="공지기간 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Input
          label="공지명"
          placeholder="공지명을 입력하세요"
          value={searchParams.title}
          onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
        />
      </SearchPanel>

      {/* Data Grid */}
      <Card 
        title="공지사항 목록"
        padding={false}
        actions={
          <div className="flex items-center gap-2">
            {isBuyer && (
              <>
                <Button
                  variant="primary" 
                  onClick={() => setIsCreateModalOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  등록
                </Button>
                <Button
                    variant="outline"
                    disabled={selectedNotices.length === 0}
                    onClick={handleEdit}
                >
                  수정
                </Button>

                {selectedNotices.length > 0 && (
                  <Button
                    variant="danger"
                    onClick={handleDeleteSelected}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    선택 삭제 ({selectedNotices.length})
                  </Button>
                )}
              </>
            )}
          </div>
        }
      >
        <DataGrid
          columns={columns}
          data={notices}
          keyField="noticeNo"
          loading={loading}
          emptyMessage="등록된 공지사항이 없습니다."
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setIsEditing(false);
          setEditUploadedFiles([]);
          setDeletedFileNums([]);
          // 모달 닫을 때도 첨부파일 상태 복원
          if (selectedNotice) {
            setAttachedFiles([...originalAttachedFiles]);
          }
        }}
        title="공지사항 상세"
        size="lg"
        footer={
          isEditing ? (
            <ModalFooter
              onClose={handleCancelEdit}
              onConfirm={handleUpdate}
              cancelText="취소"
              confirmText="저장"
            />
          ) : (
            <ModalFooter
              onClose={() => {
                setIsDetailModalOpen(false);
                setIsEditing(false);
              }}
              cancelText="닫기"
            />
          )
        }
      >
        {selectedNotice && (
          <div className="space-y-6">
            {isEditing ? (
              <>
                <Input 
                  label="공지명" 
                  placeholder="공지명을 입력하세요" 
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, subject: e.target.value }))}
                  required 
                />
                
                <Textarea 
                  label="공지내용" 
                  rows={10} 
                  placeholder="공지 내용을 입력하세요" 
                  value={editFormData.content}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                  required 
                />

                {/* 기존 첨부파일 목록 */}
                {attachedFiles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">기존 첨부파일</label>
                    <div className="space-y-2">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.fileNum}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.originName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => noticeApi.downloadFile(file.fileNum)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="다운로드"
                            >
                              <Download className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingFile(file.fileNum)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="삭제"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 새 첨부파일 추가 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일 추가</label>
                  <input
                    type="file"
                    id="edit-file-upload"
                    className="hidden"
                    multiple
                    onChange={handleEditFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                  />
                  <label
                    htmlFor="edit-file-upload"
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors block"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-600">클릭하여 파일을 선택하거나 드래그하여 업로드</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLSX, 이미지 파일 (최대 10MB)</p>
                  </label>
                  
                  {/* 선택된 파일 목록 */}
                  {editUploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {editUploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEditFileRemove(index)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h2 
                      className={`text-lg font-semibold text-gray-900 transition-colors ${
                        isBuyer ? 'cursor-pointer hover:text-blue-600' : ''
                      }`}
                      onClick={isBuyer ? handleTitleClick : undefined}
                      title={isBuyer ? '클릭하여 수정' : undefined}
                    >
                      {selectedNotice.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedNotice.createdByName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        등록일: {selectedNotice.createdAt}
                      </span>
                      {selectedNotice.modDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          수정일: {selectedNotice.modDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    <Calendar className="w-4 h-4" />
                    공지기간: {selectedNotice.startDate} ~ {selectedNotice.endDate}
                  </span>
                </div>

                <div 
                  className={`bg-stone-50 rounded-2xl p-6 min-h-[200px] transition-colors ${
                    isBuyer ? 'cursor-pointer hover:bg-stone-100' : ''
                  }`}
                  onClick={isBuyer ? handleContentClick : undefined}
                  title={isBuyer ? '클릭하여 수정' : undefined}
                >
                  <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{selectedNotice.content}</p>
                </div>

                {/* 첨부파일 목록 */}
                {attachedFiles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일</label>
                    <div className="space-y-2">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.fileNum}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => noticeApi.downloadFile(file.fileNum)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.originName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="공지사항 등록"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsCreateModalOpen(false)}
            onConfirm={handleSave}
            confirmText="저장"
          />
        }
      >
        <div className="space-y-5">
          <Input 
            label="공지명" 
            placeholder="공지명을 입력하세요" 
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            required 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <DatePicker 
              label="공지 시작일" 
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required 
            />
            <DatePicker 
              label="공지 종료일" 
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="등록일자" value={new Date().toISOString().split('T')[0]} readOnly />
            <Input label="등록자명" value={regUserName} readOnly />
          </div>

          <Textarea 
            label="공지내용" 
            rows={8} 
            placeholder="공지 내용을 입력하세요" 
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required 
          />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일</label>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
              />
              <label
                htmlFor="file-upload"
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors block"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm text-gray-600">클릭하여 파일을 선택하거나 드래그하여 업로드</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLSX, 이미지 파일 (최대 10MB)</p>
              </label>
              
              {/* 선택된 파일 목록 */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </Modal>
    </motion.div>
  );
}
