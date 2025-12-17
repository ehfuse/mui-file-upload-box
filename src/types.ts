import { HTMLAttributes } from "react";
import { SxProps, Theme } from "@mui/material";

// 서버 파일 기본 인터페이스
export interface ServerFile {
    seq: string;
    name: string;
    size: number;
    user_seq?: string;
    user_name?: string;
    created_time?: string;
}

// 서버에서 가져온 파일 정보 인터페이스
export interface UploadedFile extends ServerFile {
    table_name: string; // 파일이 저장된 테이블 이름
    toDelete?: boolean; // 삭제 표시 여부 (UI용)
    readonly?: boolean; // 읽기 전용 여부 (삭제 불가)
}

// 스타일 커스터마이징 인터페이스
export interface FileUploadBoxStyles {
    container?: SxProps<Theme>; // 컨테이너 스타일
    dropzone?: SxProps<Theme>; // 드롭존 박스 스타일
    fileItem?: SxProps<Theme>; // 파일 아이템 스타일
    attachedFileItem?: SxProps<Theme>; // 첨부된 파일 아이템 스타일
    deleteIcon?: SxProps<Theme>; // 삭제 아이콘 스타일
    tooltip?: SxProps<Theme>; // 툴팁 스타일
}

// 컴포넌트 props 타입 정의
export interface FileUploadBoxProps extends HTMLAttributes<HTMLDivElement> {
    uploadedFiles?: UploadedFile[]; // 서버에서 가져온 파일 목록
    uploaderUrl?: string; // 파일 업로더 URL (선택적)
    multiple?: boolean; // 다중 파일 업로드 여부 (선택적, 기본값: true)
    height?: number | string; // 컴포넌트 높이 (선택적)
    onUpload?: (files: File[]) => void; // 파일 업로드 콜백
    viewInBrowser?: boolean; // 브라우저에서 볼 수 있는 파일을 새 탭에서 열지 여부
    acceptedTypes?: string[]; // 허용되는 파일 확장자 목록 (예: ['jpg', 'png', 'pdf']) - 기본값: 모든 파일
    maxFileSize?: number; // 최대 파일 크기 (MB 단위, 기본값: 20MB)
    variant?: "box" | "icon" | "list"; // 업로드 UI 스타일 ("box": 드래그앤드롭 박스, "icon": 첨부파일 아이콘만, "list": 파일 목록만)
    iconSize?: number; // 아이콘 크기 (픽셀 단위, 기본값: 20)
    dropzoneText?: string; // 드롭존 텍스트 (기본값: "파일을 드래그하여 놓거나 클릭하여 선택하세요")
    noFilesText?: string; // 파일이 없을 때 표시할 텍스트 (기본값: "파일이 없습니다")
    showTooltip?: boolean; // 툴팁 표시 여부 (기본값: true)
    styles?: FileUploadBoxStyles; // 스타일 커스터마이징
}

// 외부에서 접근 가능한 메서드 정의
export interface FileUploadBoxRef {
    handleUploadFiles: (
        tableName: string,
        dataFieldName: string,
        dataSeq: string
    ) => Promise<boolean>;
    getFilesToDelete: () => UploadedFile[]; // 삭제할 파일 목록 반환
}
