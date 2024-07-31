import { Component, Input, SimpleChanges } from '@angular/core';
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
  @Input() tableId: string = '';
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableId'] && !changes['tableId'].firstChange) {
      this.tableId = changes['tableId'].currentValue;
    }
  }

  onSelectConversation(chatId: string) {
    this.selectedChatId = chatId;
    console.log(chatId);
    this.apiService.getAnalysisChat(chatId).subscribe({
      next: (messages: CopilotMessageInterface[]) => {
        console.log(messages);
        this.messages = messages;
        console.log(this.messages);
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load conversation', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onCloseConversation() {
    // this.selectedConversationId = null;
    // this.messages = [];
  }

  onSendMessage(message: string) {
    console.log(this.tableId);
    if (!message || message.trim() === '' || this.answerLoading) {
      return;
    }

    // add message to chat
    this.answerLoading = true;
    this.messages.push({id: '', createdAt: new Date(), message: message, chatId: '', userId: '', userType: 'user'});

    // send message
    if (this.selectedChatId === null) {
      this.apiService.startAnalysisChat(message, this.tableId).subscribe({
        next: (newMessage: CopilotMessageInterface) => {
          this.selectedChatId = newMessage.chatId;
          this.messages.push(newMessage);
          this.currentMessage = '';
          this.answerLoading = false;
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to start conversation', type: 'error', dismissed: false, remainingTime: 5000});
          this.currentMessage = '';
          this.answerLoading = false
        }
      });
    }
    else {
      this.apiService.sendMessageAnalysisChat(this.selectedChatId, message, this.tableId).subscribe({
        next: (newMessage: CopilotMessageInterface) => {
          this.messages.push(newMessage);
          this.currentMessage = '';
          this.answerLoading = false
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to send message', type: 'error', dismissed: false, remainingTime: 5000});
          this.currentMessage = '';
          this.answerLoading = false
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
