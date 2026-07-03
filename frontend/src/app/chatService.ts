import { apiRequest } from './api';

export const chatService = {
  sendMessage: (message: string): Promise<string> =>
    apiRequest<{ reply: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }).then(r => r.reply),
};
