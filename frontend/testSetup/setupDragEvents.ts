window.DragEvent = class DragEvent extends MouseEvent {
  dataTransfer: DataTransfer | null;

  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict);

    this.dataTransfer = eventInitDict?.dataTransfer ?? null;
  }
};
