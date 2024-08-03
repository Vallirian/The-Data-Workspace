import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { MessagePipe } from '../../../pipes/message.pipe';
import { CopilotChatInterface, CopilotMessageInterface } from '../../../interfaces/main-interface';

@Component({
  selector: 'app-extraction-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MessagePipe
  ],
  templateUrl: './extraction-chat.component.html',
  styleUrl: './extraction-chat.component.scss'
})
export class ExtractionChatComponent {
  @ViewChild('autoScrollContainer')
  private autoScrollContainer!: ElementRef;
  
  processNamesList: string[] = [];
  processName: string = '';

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

    this.apiService.listProcesses().subscribe({
      next: (processes: any[]) => {
        this.processNamesList = processes.map(p => p.processName);
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load processes', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['processName'] && !changes['processName'].firstChange) {
      this.processName = changes['processName'].currentValue;
    }
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    this.scrollToBottom();
  }

  onCloseConversation() {
  }

  scrollToBottom() {
    try {
      this.autoScrollContainer.nativeElement.scrollTop = this.autoScrollContainer.nativeElement.scrollHeight;
    }
    catch(err) {}
  }

  onSendMessage(message: string) {
    if (!message || message.trim() === '' || this.answerLoading) {
      return;
    }

    if (this.processName === '') {
      this.notificationService.addNotification({message: 'Process name is required', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }

    // add message to chat
    this.answerLoading = true;
    this.messages.push({id: '', createdAt: new Date(), message: message, chatId: '', userId: '', userType: 'user'});

    // send message
    if (this.selectedChatId === null) {
      this.apiService.startExtractionChat(message, this.processName).subscribe({
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
      this.apiService.sendMessageExtractionChat(this.selectedChatId, message, this.processName).subscribe({
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
