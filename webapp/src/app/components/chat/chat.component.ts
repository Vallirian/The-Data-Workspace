import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  messages: {message: string, sender: string, createdAt: Date}[] = [];
  chats: {conversationId: string, displayName: string, createdAt: Date}[] = [];
  selectedConversationId: string | null = null;
  currentMessage: string = '';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ){}

  ngOnInit(): void {
    this.apiService.listAnalysisChats().subscribe({
      next: (conversations: any[]) => {
        this.chats = conversations;
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load conversations', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onSelectConversation(conversationId: string) {
    this.selectedConversationId = conversationId;
    this.apiService.getAnalysisChat(conversationId).subscribe({
      next: (conversation: any) => {
        console.log(conversation);
        this.messages = conversation
        console.log(this.messages);
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load conversation', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onSendMessage(message: string) {
    // add message to chat
    this.messages.push({message, sender: 'user', createdAt: new Date()});

    // send message
    if (this.selectedConversationId === null) {
      this.apiService.startAnalysisChat(message).subscribe({
        next: (conversation: any) => {
          this.selectedConversationId = conversation.conversationId;
          this.messages.push({message: conversation.message, sender: 'system', createdAt: new Date()});
          this.currentMessage = '';
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to start conversation', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });
    }
    else {
      this.apiService.sendMessageAnalysisChat(this.selectedConversationId, message).subscribe({
        next: (conversation: any) => {
          this.messages.push({message: conversation.message, sender: 'user', createdAt: new Date()});
          this.currentMessage = '';
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to send message', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });
    }
  }

  // formatters 
  formatDate(value: any): string {
    if (value && (typeof value === 'string' || value instanceof Date)) {
      return new Date(value).toLocaleString();
    }
    return '';
  }


}
