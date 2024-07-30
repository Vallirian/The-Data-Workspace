import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { MessagePipe } from '../../pipes/message.pipe';
import { CopilotChatInterface, CopilotMessageInterface } from '../../interfaces/main-interface';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MessagePipe
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  messages: CopilotMessageInterface[] = [];
  chats: CopilotChatInterface[] = []; 
  selectedChatId: string | null = null;
  currentMessage: string = '';
  answerLoading: boolean = false;

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

  onSelectConversation(chatId: string) {
    // this.selectedChatId = chatId;
    // console.log(chatId);
    // this.apiService.getAnalysisChat(conversationId).subscribe({
    //   next: (conversation: any) => {
    //     console.log(conversation);
    //     this.messages = conversation
    //     console.log(this.messages);
    //   },
    //   error: (err) => {
    //     this.notificationService.addNotification({message: 'Failed to load conversation', type: 'error', dismissed: false, remainingTime: 5000});
    //   }
    // });
  }

  onCloseConversation() {
    // this.selectedConversationId = null;
    // this.messages = [];
  }

  onSendMessage(message: string) {
    if (!message || message.trim() === '' || this.answerLoading) {
      return;
    }

    // add message to chat
    this.answerLoading = true;
    this.messages.push({message, sender: 'user', createdAt: new Date()});

    // send message
    if (this.selectedChatId === null) {
      this.apiService.startAnalysisChat(message).subscribe({
        next: (chat: any) => {
          this.selectedChatId = chat.id;
          this.messages.push({message: chat.message, sender: 'model', createdAt: new Date()});
          this.currentMessage = '';
          this.answerLoading = false;
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to start conversation', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });
    }
    else {
      this.apiService.sendMessageAnalysisChat(this.selectedConversationId, message).subscribe({
        next: (conversation: any) => {
          this.messages.push({message: conversation.message, sender: 'model', createdAt: new Date()});
          this.currentMessage = '';
          this.answerLoading = false
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
      const date = new Date(value);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
  
      if (isToday) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        const differenceInTime = today.getTime() - date.getTime();
        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
        return `${differenceInDays} days ago`;
      }
    }
    return '';
  }


}
