import { Server } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import ChatGroup from '@/models/ChatGroup';
import User from '@/models/User';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: Server | undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!res.socket?.server.io) {
      io = new Server(res.socket.server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });
      res.socket.server.io = io;
      // Expose globally for API routes
      // @ts-ignore
      globalThis.io = io;

      io.on('connection', (socket) => {
        console.log('Socket.IO: New client connected:', socket.id);
        socket.on('join', async ({ group, userId }) => {
          console.log(`Socket.IO: User ${userId} joined group ${group}`);
          socket.join(group);
        });
        socket.on('message', async (data) => {
          const { group, userId, username, message } = data;
          console.log(`Socket.IO: Received message for group ${group} from user ${userId}: ${message}`);
          await connectDB();
          try {
            const chatMessage = await ChatMessage.create({
              group,
              userId,
              username,
              message,
            });
            console.log('Socket.IO: Message saved and broadcasting:', chatMessage);
            io?.to(group).emit('message', {
              _id: chatMessage._id,
              group,
              userId,
              username,
              message,
              timestamp: chatMessage.timestamp,
            });
          } catch (err) {
            console.error('Socket.IO: Error saving message:', err);
            socket.emit('error', { error: 'Error saving message', details: err });
          }
        });
        socket.on('error', (err) => {
          console.error('Socket.IO: Socket error:', err);
        });
      });
    }
    res.end();
  } catch (err) {
    console.error('Socket.IO: Top-level handler error:', err);
    res.status(500).end('Socket.IO server error');
  }
}
