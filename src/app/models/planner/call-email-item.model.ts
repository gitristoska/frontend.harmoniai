export interface CallAndEmailItem {
  id?: string; // UUID, optional for new items
  text: string; // Required: description
  isDone: boolean;
}

export interface CallAndEmailItemResponse extends CallAndEmailItem {
  id: string; // UUID
  createdAt?: Date;
  updatedAt?: Date;
}
