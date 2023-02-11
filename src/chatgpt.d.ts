type Message = {
  id: string;
  role: string;
  user: null | any;
  create_time: null | any;
  update_time: null | any;
  content: {
    content_type: string;
    parts: string[];
  };
  end_turn: boolean;
  weight: number;
  metadata: {
    message_type: string;
    model_slug: string;
    finish_details: {
      type: string;
      stop: string;
    };
  };
  recipient: string;
};

type ChatGPTResponse = {
  message: Message;
  conversation_id: string;
  error: null | any;
};
