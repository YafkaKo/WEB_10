import { GetObjectCommand } from "@aws-sdk/client-s3";
import File from "./file.model.js";
import { FileSerive } from "./file.service.js";

export class FileController {
  static async saveFile(request, reply) {
    const data = await request.file();

    const cookies = request.cookies;
    const cookieNames = Object.keys(cookies).filter((name) =>
      name.startsWith("token_")
    );
    const decoded = await request.server.jwt.verify(cookies[cookieNames[0]]);

    if (!decoded.id) {
      reply.code(400);
      return { message: "Invalid or missing user ID" };
    }
    const userId = decoded.id;
    const entityId = request.body?.entityId || null;

    const { error, data: result } = await FileSerive.saveFile(
      data.file,
      data.filename,
      data.mimetype,
      userId,
      entityId
    );

    if (error) {
      reply.code(500);
      return { message: "Internal server error" };
    }
    return result;
  }

  static async getFile(request, reply) {
    const { fileId } = request.params;

    const meta = await File.findByPk(fileId);

    if (!meta) {
      reply.code(404);
      return { message: "File not found" };
    }

    try {
      const command = new GetObjectCommand({
        Bucket: meta.bucket,
        Key: meta.key,
      });

      const response = await FileSerive.client.send(command);

      const encodedName = encodeURIComponent(meta.original_name)
        .replace(/['()]/g, escape)
        .replace(/\*/g, "%2A");

      reply.header("Content-Type", meta.mime_type);
      reply.header(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodedName}`
      );

      return reply.send(response.Body); // это stream
    } catch (error) {
      console.error(error);
      reply.code(500);
      return { message: "Error retrieving file from storage" };
    }
  }
}
