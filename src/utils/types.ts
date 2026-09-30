export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

export type SendMessageRequest = {
  chatId: string;
  message: string;
};

export type SendMessageResponse = {
  idMessage: string;
};

export type ReceiveNotificationResponse = {
  receiptId: number;
  body: {
    messageData: {
      textMessageData?: {
        textMessage: string;
      }
    }
  }
}

export type DeleteNotificationResponse = {
  result: boolean;
};