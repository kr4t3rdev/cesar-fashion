import { createRouteHandler } from "uploadthing/next";

import { uploadRouter } from "@/server/uploadthing/router";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
