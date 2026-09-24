import {
    useState,
    useImperativeHandle,
    forwardRef,
    useEffect,
} from "react";
import type { ForwardedRef, ReactElement, RefAttributes } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import UploadIcon from "@mui/icons-material/Upload";
import ClearIcon from "@mui/icons-material/Clear";
import type {
    FileDownloadValue,
    FileUploadBoxProps,
    FileUploadBoxRef,
    UploadedFile,
} from "./types";
import { formatFileSize } from "./utils";

// 파일 업로드/다운로드/삭제 기능을 제공하는 컴포넌트
function FileUploadBoxInner<
    TFile extends UploadedFile = UploadedFile,
    TUploadContext extends object = Record<string, never>,
>(
    {
        uploadedFiles,
        multiple = true,
        height = 100,
        onUpload,
        onRequestUpload,
        onRequestDelete,
        onRequestDownload,
        getFileId,
        getFileTooltip,
        onValidationError,
        viewInBrowser = true,
        acceptedTypes = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "svg",
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "txt",
            "pptx",
            "hwp",
            "hwpx",
            "csv",
            "json",
            "xml",
            "log",
            "html",
            "htm",
            "zip",
            "rar",
            "egg",
        ],
        maxFileSize = 20, // 기본값: 20MB
        variant = "box", // 기본값: "box"
        iconSize = 16, // 기본값: 20px
        dropzoneText = "파일을 드래그하여 놓거나 클릭하여 선택하세요",
        emptyText = "파일이 없습니다",
        showTooltip = true, // 기본값: true
        styles,

        ...props
    }: FileUploadBoxProps<TFile, TUploadContext>,
    ref: ForwardedRef<FileUploadBoxRef<TFile, TUploadContext>>
) {
        // 상태 관리
        const [serverFiles, setServerFiles] = useState<TFile[]>(
            uploadedFiles || []
        ); // 서버 파일 목록
        const [filesToDelete, setFilesToDelete] = useState<TFile[]>([]); // 삭제할 파일 목록
        const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // 첨부된 파일 목록
        const [isDragOver, setIsDragOver] = useState(false); // 드래그 상태

        const notifyError = (message: string) => {
            if (onValidationError) {
                onValidationError(message);
                return;
            }

            if (typeof window !== "undefined") {
                window.alert(message);
            }
        };

        const mergeSelectedFiles = (files: File[]) => {
            setAttachedFiles((prev) => [...prev, ...files]);
            onUpload?.(files);
        };

        const openDownloadValue = (
            file: TFile,
            downloadValue: Exclude<FileDownloadValue, null | undefined>
        ) => {
            const isStringValue = typeof downloadValue === "string";
            const objectUrl = isStringValue
                ? downloadValue
                : window.URL.createObjectURL(downloadValue);
            const fileExtension =
                file.name.split(".").pop()?.toLowerCase() || "";
            const viewableExtensions = [
                "pdf",
                "jpg",
                "jpeg",
                "png",
                "gif",
                "bmp",
                "webp",
                "svg",
                "txt",
                "html",
                "htm",
                "csv",
                "xls",
                "xlsx",
                "js",
                "jsx",
                "ts",
                "tsx",
                "css",
                "scss",
                "sass",
                "less",
                "php",
                "py",
                "java",
                "c",
                "cpp",
                "h",
                "hpp",
                "cs",
                "go",
                "rs",
                "rb",
                "swift",
                "kt",
                "scala",
                "sql",
                "sh",
                "bash",
                "bat",
                "ps1",
                "yml",
                "yaml",
                "toml",
                "ini",
                "conf",
                "json",
                "xml",
                "log",
                "md",
                "markdown",
            ];

            if (viewInBrowser && viewableExtensions.includes(fileExtension)) {
                window.open(objectUrl, "_blank", "noopener,noreferrer");
                if (!isStringValue) {
                    window.setTimeout(() => {
                        window.URL.revokeObjectURL(objectUrl);
                    }, 1000);
                }
                return;
            }

            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (!isStringValue) {
                window.URL.revokeObjectURL(objectUrl);
            }
        };

        // props로 전달된 파일 목록이 변경되면 상태 업데이트
        useEffect(() => {
            const newFiles = uploadedFiles || [];

            setServerFiles((prev) => {
                if (!getFileId) {
                    return newFiles;
                }

                const deletedFileIds = new Set(
                    prev
                        .filter((file) => file.pendingDelete)
                        .map((file) => getFileId(file))
                );

                return newFiles.map(
                    (file) =>
                        ({
                            ...file,
                            pendingDelete: deletedFileIds.has(
                                getFileId(file)
                            ),
                        }) as TFile
                );
            });
        }, [uploadedFiles, getFileId]);

        // 파일 확장자 검증 함수
        const isFileTypeAllowed = (fileName: string): boolean => {
            if (!acceptedTypes || acceptedTypes.length === 0) {
                return true; // 제한이 없으면 모든 파일 허용
            }

            const fileExtension = fileName.split(".").pop()?.toLowerCase();
            if (!fileExtension) return false;

            return acceptedTypes.some(
                (type) => type.toLowerCase() === fileExtension
            );
        };

        // 파일 크기 검증 함수
        const isFileSizeAllowed = (fileSize: number): boolean => {
            const maxFileSizeInBytes = maxFileSize * 1024 * 1024; // MB를 바이트로 변환
            return fileSize <= maxFileSizeInBytes;
        };

        // 허용되지 않는 파일들을 필터링하는 함수
        const filterAllowedFiles = (
            files: File[]
        ): { allowed: File[]; rejected: File[]; oversized: File[] } => {
            const allowed: File[] = [];
            const rejected: File[] = [];
            const oversized: File[] = [];

            files.forEach((file) => {
                if (!isFileTypeAllowed(file.name)) {
                    rejected.push(file);
                } else if (!isFileSizeAllowed(file.size)) {
                    oversized.push(file);
                } else {
                    allowed.push(file);
                }
            });

            return { allowed, rejected, oversized };
        };

        // 드래그 앤 드롭 이벤트 핸들러
        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(true);
        };

        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            const { allowed, rejected, oversized } = filterAllowedFiles(files);

            // 허용되지 않는 파일 형식 알림
            if (rejected.length > 0) {
                const allowedTypes = acceptedTypes?.join(", ") || "모든 파일";
                notifyError(
                    `허용되지 않는 파일 형식입니다. 허용되는 형식: ${allowedTypes}`
                );
            }

            // 크기 초과 파일 알림
            if (oversized.length > 0) {
                notifyError(
                    `파일 크기 초과. 최대 허용 크기: ${maxFileSize}MB`
                );
            }

            if (allowed.length > 0) {
                mergeSelectedFiles(allowed);
            }
        };

        // 드롭 영역 클릭 시 파일 선택 다이얼로그 열기
        const handleDropAreaClick = () => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = multiple;
            input.style.display = "none";

            // 허용되는 파일 타입이 있으면 accept 속성 설정
            if (acceptedTypes && acceptedTypes.length > 0) {
                input.accept = acceptedTypes
                    .map((type) => `.${type.toLowerCase()}`)
                    .join(",");
            }

            input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const files = Array.from(target.files || []);
                const { allowed, rejected, oversized } =
                    filterAllowedFiles(files);

                // 허용되지 않는 파일 형식 알림
                if (rejected.length > 0) {
                    const allowedTypes =
                        acceptedTypes?.join(", ") || "모든 파일";
                    notifyError(
                        `허용되지 않는 파일 형식입니다. 허용되는 형식: ${allowedTypes}`
                    );
                }

                // 크기 초과 파일 알림
                if (oversized.length > 0) {
                    notifyError(
                        `파일 크기 초과. 최대 허용 크기: ${maxFileSize}MB`
                    );
                }

                if (allowed.length > 0) {
                    mergeSelectedFiles(allowed);
                }

                document.body.removeChild(input);
            };
            document.body.appendChild(input);
            input.click();
        };

        // 로컬 첨부 파일 제거 핸들러
        const handleLocalFileRemove = (index: number) => {
            setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
        };

        // 서버 파일 제거 핸들러 (UI에서 취소선 처리 및 삭제 목록에 추가)
        const handleServerFileRemove = (index: number) => {
            // 삭제할 파일 목록에 추가
            const fileToDelete = serverFiles[index];
            if (!fileToDelete) {
                return;
            }
            setFilesToDelete((prev) => [...prev, fileToDelete]);

            // UI에서 삭제 대기 상태를 표시한다.
            setServerFiles((prev) =>
                prev.map((file, i) =>
                    i === index
                        ? ({ ...file, pendingDelete: true } as TFile)
                        : file
                )
            );
        };

        // 파일 업로드 처리 함수 (외부에서 호출됨)
        const handleUploadFiles = async (
            context?: TUploadContext
        ): Promise<boolean> => {
            // 1. 삭제할 파일이 있으면 먼저 삭제 처리
            if (filesToDelete.length > 0) {
                if (!onRequestDelete) {
                    notifyError("파일 삭제 콜백이 설정되지 않았습니다.");
                    return false;
                }

                const deleteResult = await onRequestDelete({
                    files: filesToDelete,
                });

                if (deleteResult === false) {
                    return false;
                }

                setFilesToDelete([]);
                setServerFiles((prev) =>
                    prev.filter((file) => !file.pendingDelete)
                );
            }

            // 2. 업로드할 파일이 없으면 성공으로 간주
            if (attachedFiles.length === 0) {
                return true;
            }

            if (!onRequestUpload) {
                notifyError("파일 업로드 콜백이 설정되지 않았습니다.");
                return false;
            }

            try {
                const uploadResult = await onRequestUpload({
                    ...(context || ({} as TUploadContext)),
                    files: attachedFiles,
                });

                if (Array.isArray(uploadResult)) {
                    setServerFiles((prev) => [...prev, ...uploadResult]);
                }

                if (uploadResult === false) {
                    return false;
                }

                setAttachedFiles([]);
                return true;
            } catch (error) {
                console.error("🚀 FileUploadBox: Upload error:", error);
                return false;
            }
        };

        // 파일 다운로드 처리 함수
        const handleDownloadFile = async (
            file: TFile,
            e?: React.MouseEvent
        ) => {
            // 이벤트 전파 방지
            if (e) {
                e.stopPropagation();
            }

            // 삭제 예정인 파일은 다운로드 불가
            if (file.pendingDelete) return;

            try {
                const downloadValue =
                    file.downloadUrl ||
                    (await onRequestDownload?.(file));

                if (!downloadValue) {
                    return false;
                }

                openDownloadValue(file, downloadValue);

                return true;
            } catch (error) {
                console.error("파일 다운로드 오류:", error);
                return false;
            }
        };

        // 삭제할 파일 목록 반환 메서드
        const getPendingDeleteFiles = () => {
            return filesToDelete;
        };

        // ref를 통해 외부에서 접근할 수 있는 함수들 노출
        useImperativeHandle(ref, () => ({
            handleUploadFiles,
            getPendingDeleteFiles,
            getAttachedFiles: () => attachedFiles,
        }));

        // 컴포넌트 렌더링
        return (
            <div
                className={variant === "icon" ? "" : "w-full"}
                style={styles?.container as any}
                {...props}
            >
                {/* 업로드 UI - variant에 따라 다르게 표시 */}
                {variant !== "list" && (
                    <>
                        {variant === "box" ? (
                            // 드래그 앤 드롭 박스 스타일
                            <Box
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleDropAreaClick}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: `${height}px`,
                                    border: "2px dashed",
                                    borderColor: isDragOver
                                        ? "primary.main"
                                        : "grey.300",
                                    borderRadius: 2,
                                    padding: 2,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    backgroundColor: isDragOver
                                        ? "action.hover"
                                        : "background.default",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        backgroundColor: "action.hover",
                                    },
                                    userSelect: "none",
                                    ...styles?.dropzone,
                                }}
                            >
                                <div
                                    className="font-suit flex flex-row items-center justify-center gap-2 text-sm"
                                    style={{ color: "#777777" }}
                                >
                                    <UploadIcon
                                        sx={{ color: "#999999", fontSize: 20 }}
                                    />{" "}
                                    {dropzoneText}
                                </div>
                            </Box>
                        ) : variant === "icon" ? (
                            // 첨부파일 아이콘 스타일
                            <IconButton
                                onClick={handleDropAreaClick}
                                size="small"
                                color="primary"
                            >
                                <AttachFileIcon sx={{ fontSize: iconSize }} />
                            </IconButton>
                        ) : null}
                    </>
                )}

                {/* 파일 목록 - variant가 "icon"이 아닐 때만 표시 */}
                {variant !== "icon" &&
                    (serverFiles?.filter((file) => !file.pendingDelete)
                        .length > 0 ||
                        (variant !== "list" && attachedFiles.length > 0)) && (
                        <Box
                            sx={{
                                paddingTop: variant === "list" ? 0 : 2,
                            }}
                        >
                            {/* 서버에서 가져온 파일 목록 */}
                            {serverFiles?.filter((file) => !file.pendingDelete)
                                .length > 0 && (
                                <Box
                                    className="uploaded-files-list"
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {serverFiles
                                        .filter((file) => !file.pendingDelete) // 삭제 대기 파일 제외
                                        .map((file, index) => {
                                            const tooltipTitle =
                                                getFileTooltip?.(file) || "";
                                            const fileKey = getFileId
                                                ? String(getFileId(file))
                                                : `${file.name}-${file.size}-${index}`;

                                            return (
                                                <Tooltip
                                                    key={fileKey}
                                                    title={
                                                        showTooltip
                                                            ? tooltipTitle
                                                            : ""
                                                    }
                                                    placement="left"
                                                    arrow
                                                    enterDelay={0}
                                                    leaveDelay={0}
                                                    disableInteractive
                                                    disableHoverListener={
                                                        !showTooltip ||
                                                        !tooltipTitle
                                                    }
                                                    slotProps={{
                                                        tooltip: {
                                                            sx: {
                                                                fontSize: "14px",
                                                                bgcolor: "black",
                                                                textAlign:
                                                                    "center",
                                                                "& .MuiTooltip-arrow":
                                                                    {
                                                                        color: "black",
                                                                    },
                                                                ...styles?.tooltip,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        className="file-item"
                                                        onClick={() =>
                                                            handleDownloadFile(
                                                                file
                                                            )
                                                        }
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 2,
                                                            borderRadius: 1,
                                                            px: 1.5,
                                                            py: 0.5,
                                                            fontSize:
                                                                "0.875rem",
                                                            cursor: "pointer",
                                                            fontFamily:
                                                                "var(--font-suit)",
                                                            "&:hover": {
                                                                bgcolor:
                                                                    "neutral.100",
                                                            },
                                                            ...styles?.fileItem,
                                                        }}
                                                    >
                                                        <AttachFileIcon
                                                            sx={{
                                                                fontSize:
                                                                    iconSize,
                                                            }}
                                                        />
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                flex: 1,
                                                                flexDirection:
                                                                    "row",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "space-between",
                                                            }}
                                                        >
                                                            <span>
                                                                {file.name}{" "}
                                                                <span
                                                                    style={{
                                                                        color: "#999999",
                                                                    }}
                                                                >
                                                                    (
                                                                    {formatFileSize(
                                                                        file.size
                                                                    )}
                                                                    )
                                                                </span>
                                                            </span>
                                                            {/* list variant가 아니고 readOnly가 아닐 때 삭제 아이콘 표시 */}
                                                            {variant !==
                                                                "list" &&
                                                                !file.readOnly && (
                                                                    <ClearIcon
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleServerFileRemove(
                                                                                index
                                                                            );
                                                                        }}
                                                                        sx={{
                                                                            fontSize: 16,
                                                                            color: "#cccccc",
                                                                            cursor: "pointer",
                                                                            "&:hover":
                                                                                {
                                                                                    color: "#ff4444",
                                                                                },
                                                                            ...styles?.deleteIcon,
                                                                        }}
                                                                    />
                                                                )}
                                                        </Box>
                                                    </Box>
                                                </Tooltip>
                                            );
                                        })}
                                </Box>
                            )}

                            {/* 새로 첨부된 파일 목록 - list variant가 아닐 때만 표시 */}
                            {variant !== "list" && attachedFiles.length > 0 && (
                                <Box
                                    className="attached-file-container"
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        color: "blue.800",
                                    }}
                                >
                                    {attachedFiles.map((file, index) => (
                                        <Box
                                            key={index}
                                            className="attached-file-item"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                borderRadius: 1,
                                                px: 1.5,
                                                py: 0.5,
                                                fontSize: "0.875rem",
                                                cursor: "pointer",
                                                fontFamily: "var(--font-suit)",
                                                "&:hover": {
                                                    bgcolor: "neutral.100",
                                                },
                                                ...styles?.attachedFileItem,
                                            }}
                                        >
                                            <AttachFileIcon
                                                sx={{ fontSize: 16 }}
                                            />
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flex: 1,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <span>
                                                    {file.name}{" "}
                                                    <span
                                                        style={{
                                                            color: "#999999",
                                                        }}
                                                    >
                                                        (
                                                        {formatFileSize(
                                                            file.size
                                                        )}
                                                        )
                                                    </span>
                                                </span>
                                                <ClearIcon
                                                    onClick={() =>
                                                        handleLocalFileRemove(
                                                            index
                                                        )
                                                    }
                                                    sx={{
                                                        fontSize: 16,
                                                        color: "#cccccc",
                                                        cursor: "pointer",
                                                        "&:hover": {
                                                            color: "#ff4444",
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                {/* list variant에서 파일이 없을 때 메시지 표시 */}
                {variant === "list" &&
                    serverFiles?.filter((file) => !file.pendingDelete)
                        .length ===
                        0 && (
                        <Box sx={{ paddingTop: 0 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: "0.875rem",
                                    color: "gray.500",
                                    fontFamily: "var(--font-suit)",
                                }}
                            >
                                {emptyText}
                            </Box>
                        </Box>
                    )}
            </div>
        );
}

export const FileUploadBox = forwardRef(FileUploadBoxInner) as <
    TFile extends UploadedFile = UploadedFile,
    TUploadContext extends object = Record<string, never>,
>(
    props: FileUploadBoxProps<TFile, TUploadContext> &
        RefAttributes<FileUploadBoxRef<TFile, TUploadContext>>
) => ReactElement | null;
