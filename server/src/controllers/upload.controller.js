const { handleUpload } = require("@vercel/blob/client");
const WishUpload = require("../models/upload.model");
const { readToken } = require("./user.controller");

async function uploadHandler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const claims = readToken(clientPayload || "");
        if (!claims || !pathname.startsWith(`wish-imports/${claims.sub}/`)) {
          throw new Error("Sign in to upload a wish history file");
        }
        return {
          allowedContentTypes: ["application/json"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: claims.sub }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { userId } = JSON.parse(tokenPayload || "{}");
        if (!userId || !blob?.pathname || !blob?.url) throw new Error("Invalid completed upload");
        await WishUpload.findOneAndUpdate(
          { pathname: blob.pathname },
          { userId, pathname: blob.pathname, url: blob.url, contentType: blob.contentType || "application/json" },
          { upsert: true, new: true, runValidators: true },
        );
      },
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Blob upload failed" });
  }
}

module.exports = { uploadHandler };
