import http from "http";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { UserRole } from "../../generated/prisma/client";
import { env } from "./env";

type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

type ConnectedUser = {
  id: string;
  email: string;
  role: UserRole;
};

let io: Server | null = null;

export const notificationEvents = {
  created: "notification:created",
  read: "notification:read",
  readAll: "notification:read-all",
  connected: "notification:connected",
} as const;

export const getNotificationRoom = (userId: string) => `user:${userId}`;

const getTokenFromSocket = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token;

  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authorizationHeader = socket.handshake.headers.authorization;

  if (
    typeof authorizationHeader === "string" &&
    authorizationHeader.startsWith("Bearer ")
  ) {
    return authorizationHeader.slice(7);
  }

  return null;
};

export const initializeSocket = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      const user: ConnectedUser = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      socket.data.user = user;
      socket.join(getNotificationRoom(user.id));

      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as ConnectedUser | undefined;

    if (user) {
      socket.emit(notificationEvents.connected, {
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    }
  });

  return io;
};

export const getSocketServer = () => io;

export const emitNotificationToUsers = (
  userIds: string[],
  event: string,
  payload: unknown,
) => {
  if (!io) {
    return;
  }

  const uniqueUserIds = [...new Set(userIds)];

  for (const userId of uniqueUserIds) {
    io.to(getNotificationRoom(userId)).emit(event, payload);
  }
};
