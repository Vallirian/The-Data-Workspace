import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { MessagePipe } from '../../../pipes/message.pipe';
import { CopilotChatInterface, CopilotMessageInterface } from '../../../interfaces/main-interface';
import { CustomDatetimePipe } from '../../../pipes/custom-datetime.pipe';

@Component({
  selector: 'app-analysis-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MessagePipe,
    CustomDatetimePipe
  ],
  providers: [DatePipe], // DatePipe to support the CustomDatetimePipe
  templateUrl: './analysis-chat.component.html',
  styleUrl: './analysis-chat.component.scss'
})
export class AnalysisChatComponent {
  @Input() tableId: string = '';
  @ViewChild('autoScrollContainer')
  private autoScrollContainer!: ElementRef;

  messages: CopilotMessageInterface[] = [];
  chats: CopilotChatInterface[] = []; 
  selectedChatId: string | null = null;
  functionModeAny: boolean = false; // to force function call by AI API

  currentMessage: string = '';
  answerLoading: boolean = false;
  sampleQuestions: string[] = [
    "Give me a general analysis of this table?",
    "Give me averages in this table?"
  ]

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
        this.notificationService.addNotification({message: err.error.error || 'Failed to load conversations', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableId'] && !changes['tableId'].firstChange) {
      this.tableId = changes['tableId'].currentValue;
    }
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.autoScrollContainer.nativeElement.scrollTop = this.autoScrollContainer.nativeElement.scrollHeight;
    }
    catch(err) {}
  }

  onSelectConversation(chatId: string) {
    this.selectedChatId = chatId;
    this.apiService.getAnalysisChat(chatId).subscribe({
      next: (messages: CopilotMessageInterface[]) => {
        this.messages = messages;
      },
      error: (err) => {
        this.notificationService.addNotification({message: err.error.error || 'Failed to load conversation', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onCloseConversation() {
    this.selectedChatId = null;
    this.messages = [];
  }

  onSendMessage(message: string) {
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
          this.notificationService.addNotification({message: err.error.error || 'Failed to start conversation', type: 'error', dismissed: false, remainingTime: 5000});
          this.currentMessage = '';
          this.answerLoading = false
        }
      });
    }
    else {
      this.apiService.sendMessageAnalysisChat(this.selectedChatId, message, this.tableId, this.functionModeAny ? 'ANY' : 'AUTO').subscribe({
        next: (newMessage: CopilotMessageInterface) => {
          this.messages.push(newMessage);
          this.currentMessage = '';
          this.answerLoading = false
        },
        error: (err) => {
          this.notificationService.addNotification({message: err.error.error || 'Failed to send message', type: 'error', dismissed: false, remainingTime: 5000});
          this.currentMessage = '';
          this.answerLoading = false
        }
      });
    }
  }
}
