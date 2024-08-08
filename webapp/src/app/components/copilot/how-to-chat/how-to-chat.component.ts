import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { MessagePipe } from '../../../pipes/message.pipe';
import { CopilotChatInterface, CopilotMessageInterface } from '../../../interfaces/main-interface';
import { CustomDatetimePipe } from '../../../pipes/custom-datetime.pipe';


@Component({
  selector: 'app-how-to-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MessagePipe,
    CustomDatetimePipe
  ],
  providers: [DatePipe], // DatePipe to support the CustomDatetimePipe
  templateUrl: './how-to-chat.component.html',
  styleUrl: './how-to-chat.component.scss'
})
export class HowToChatComponent {
  @ViewChild('autoScrollContainer')
  private autoScrollContainer!: ElementRef;

  messages: CopilotMessageInterface[] = [];
  chats: CopilotChatInterface[] = []; 
  selectedChatId: string | null = null;

  currentMessage: string = '';
  answerLoading: boolean = false;
  sampleQuestions: string[] = [
    "How do I update customer information?",
    "How can I update an order?",
    "Can you help me submit a time off request?"
  ]

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ){}

  ngOnInit(): void {
    this.apiService.listHowToChats().subscribe({
      next: (conversations: any[]) => {
        this.chats = conversations;
      },
      error: (err) => {
        this.notificationService.addNotification({message: err.error.error || 'Failed to load conversations', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

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
    this.apiService.getHowToChat(chatId).subscribe({
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
      this.apiService.startHowToChat(message).subscribe({
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
      this.apiService.sendMessageHowToChat(this.selectedChatId, message).subscribe({
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
