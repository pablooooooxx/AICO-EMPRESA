import { Component, OnInit, viewChild, ElementRef } from "@angular/core";
import { AichatService } from "../../services/ai-chat.service";
import { Chatmessage } from "../../models/chat.model";
import { style } from "@angular/animations";

@Component({
    selector: 'saber.style',
    templateUrl: './app.component.html',
    styleUrls: ['./app.componenr.css'],
    standalone: false
})
export class Saberstylecomponent implements OnInit {
    @viewChild('chatBody') chatBodyRef!: ElementRef;

    isChatOpen: boolean = false
    chatMessage: Chatmessage[] = [];
    chatInput: string = '';
    isChatLoading: boolean = false;

    chatSuggestion: string[] = [
        'Crear Quiz '
    ];

    constructor(private aiChatService: AichatService) {}

    ngOnInit(): void {
        this.chatMessage = this.aiChatService.getConversationHistory();
    }

    toogleChat(): void {
        this.isChatOpen = !this.isChatOpen;
        if (this.isChatOpen) {
            this.chatMessage = this.aiChatService.getConversationHistory();
            setTimeout( () => this.scrollChatToBottom(), 100);
        }   
    }

    sendChatMessage(): void {
        const text = this.chatInput?.trim();
        if (!text || this.isChatLoading) return;

        const userMsg: Chatmessage = {
            id: 'ui_' + Date.now(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        this.chatMessage.push(userMsg);
        this.chatInput = '';
        this.scrollChatToBottom();
        this.isChatLoading = true

        this.aiChatService.sendMessage(text).subscribe({
            next: () => {
                this.chatMessage = this.aiChatService.getConversationHistory();
                this.isChatLoading = false;
                this.scrollChatToBottom();
            },
            error: () => {
                this.isChatLoading = false;
                const errorMsg: Chatmessage = {
                    id: 'err_' + Date.now(),
                    role: 'assistant',
                    content: 'error al procesar tu solicitud, Intenta de nuevo.',
                    timestamp: new Date()
                };
                this.chatMessage.push(errorMsg);
                this.scrollChatToBottom();
            }   
        });
    }

    sendChatFromSuggestion(suggestion: string): void {
        this.chatInput = suggestion;
        this.sendChatMessage();
    }

    clearChat(): void {
        this.aiChatService.clearConversation();
        this.chatMessage = [];
    }

    private scrollChatToBottom(): void {
        setTimeout(() => {
            const el = this.chatBodyRef?.nativeElement;
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        }, 50);
    }
}
