import { useState, useRef } from "react";
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Stack,
} from "@mui/material";
import { FileUploadBox } from "@ehfuse/mui-fileupload";
import type { FileUploadBoxRef, UploadedFile } from "@ehfuse/mui-fileupload";

function App() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
        {
            seq: "1",
            name: "sample-document.pdf",
            size: 524288, // 512KB
            table_name: "example_table",
            user_seq: "123",
            user_name: "홍길동",
            created_time: new Date().toISOString(),
        },
        {
            seq: "2",
            name: "image-sample.png",
            size: 1048576, // 1MB
            table_name: "example_table",
            user_seq: "123",
            user_name: "홍길동",
            created_time: new Date().toISOString(),
        },
    ]);

    const fileUploadRef = useRef<FileUploadBoxRef>(null);

    const handleUpload = async () => {
        if (fileUploadRef.current) {
            const success = await fileUploadRef.current.handleUploadFiles(
                "example_table",
                "example_field",
                "example_seq_123"
            );

            if (success) {
                alert("파일 업로드가 완료되었습니다!");
            } else {
                alert("파일 업로드에 실패했습니다.");
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
                MUI File Upload Box 예제
            </Typography>

            <Stack spacing={4} sx={{ mt: 4 }}>
                {/* Box 스타일 예제 */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        1. 박스 스타일 (기본)
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        1 파일을 드래그하여 놓거나 클릭하여 선택할 수 있습니다.
                    </Typography>
                    <FileUploadBox
                        ref={fileUploadRef}
                        uploadedFiles={uploadedFiles}
                        variant="box"
                        height={150}
                        multiple={true}
                        maxFileSize={10}
                    />
                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={handleUpload}>
                            파일 업로드
                        </Button>
                    </Box>
                </Paper>

                {/* Icon 스타일 예제 */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        2. 아이콘 스타일
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        첨부파일 아이콘만 표시됩니다.
                    </Typography>
                    <FileUploadBox
                        uploadedFiles={[]}
                        variant="icon"
                        iconSize={24}
                    />
                </Paper>

                {/* List 스타일 예제 */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        3. 리스트 스타일 (파일 목록만)
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        파일 목록만 표시됩니다. 업로드 기능 및 삭제 버튼이
                        없습니다.
                    </Typography>
                    <FileUploadBox
                        uploadedFiles={uploadedFiles}
                        variant="list"
                    />
                </Paper>

                {/* 파일 타입 제한 예제 */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        4. 파일 타입 제한 (이미지만)
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        jpg, png, gif 파일만 업로드할 수 있습니다.
                    </Typography>
                    <FileUploadBox
                        uploadedFiles={[]}
                        variant="box"
                        acceptedTypes={["jpg", "jpeg", "png", "gif"]}
                        maxFileSize={5}
                    />
                </Paper>
            </Stack>
        </Container>
    );
}

export default App;
