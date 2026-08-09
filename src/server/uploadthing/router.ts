import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const uploadRouter = {
  productImage: f(
    { image: { maxFileSize: "4MB", maxFileCount: 1 } },
    { awaitServerData: false }
  )
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) {
        throw new UploadThingError("No autorizado");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
