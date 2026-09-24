/**
 * 파일 업로드 박스 타입(v3.0.0 — 배포본 dist/types.d.ts 에서 되살림, 2026-09-25).
 * 저장소에 올라오지 않은 3.0.0 변경을 맞추기 위해 선언 파일을 그대로 소스로 옮겼다(주석은 배포본에 없어 비어 있다).
 */
import type { HTMLAttributes } from "react";
import type { SxProps, Theme } from "@mui/material";
export interface FileDescriptor {
    name: string;
    size: number;
}
export type FileIdentity = string | number;
export interface UploadedFileBase extends FileDescriptor {
    pendingDelete?: boolean;
    readOnly?: boolean;
    downloadUrl?: string;
}
export type UploadedFile<TExtra extends object = Record<string, never>> = UploadedFileBase & TExtra;
export type FileUploadRequestContext<TContext extends object = Record<string, never>> = TContext & {
    files: File[];
};
export interface FileDeleteRequestContext<TFile extends UploadedFile = UploadedFile> {
    files: TFile[];
}
export type FileDownloadValue = Blob | string | null | undefined;
export type FileUploadResult<TFile extends UploadedFile = UploadedFile> = boolean | TFile[] | void;
export interface FileUploadBoxStyles {
    container?: SxProps<Theme>;
    dropzone?: SxProps<Theme>;
    fileItem?: SxProps<Theme>;
    attachedFileItem?: SxProps<Theme>;
    deleteIcon?: SxProps<Theme>;
    tooltip?: SxProps<Theme>;
}
export interface FileUploadBoxProps<TFile extends UploadedFile = UploadedFile, TUploadContext extends object = Record<string, never>> extends HTMLAttributes<HTMLDivElement> {
    uploadedFiles?: TFile[];
    multiple?: boolean;
    height?: number | string;
    onUpload?: (files: File[]) => void;
    onRequestUpload?: (context: FileUploadRequestContext<TUploadContext>) => Promise<FileUploadResult<TFile>> | FileUploadResult<TFile>;
    onRequestDelete?: (context: FileDeleteRequestContext<TFile>) => Promise<boolean | void> | boolean | void;
    onRequestDownload?: (file: TFile) => Promise<FileDownloadValue> | FileDownloadValue;
    getFileId?: (file: TFile) => FileIdentity;
    getFileTooltip?: (file: TFile) => string | null | undefined;
    onValidationError?: (message: string) => void;
    viewInBrowser?: boolean;
    acceptedTypes?: string[];
    maxFileSize?: number;
    variant?: "box" | "icon" | "list";
    iconSize?: number;
    dropzoneText?: string;
    emptyText?: string;
    showTooltip?: boolean;
    styles?: FileUploadBoxStyles;
}
export interface FileUploadBoxRef<TFile extends UploadedFile = UploadedFile, TUploadContext extends object = Record<string, never>> {
    handleUploadFiles: (context?: TUploadContext) => Promise<boolean>;
    getPendingDeleteFiles: () => TFile[];
    getAttachedFiles: () => File[];
}
