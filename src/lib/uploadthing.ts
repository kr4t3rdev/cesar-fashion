import { generateUploadButton } from "@uploadthing/react";
import type { UploadRouter } from "@/server/uploadthing/router";

export const UploadButton = generateUploadButton<UploadRouter>();
