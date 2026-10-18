export interface Chatmessage {
    id: string;
    role: 'user' | 'assistant',
    content: string;
    timestamp: Date;
}