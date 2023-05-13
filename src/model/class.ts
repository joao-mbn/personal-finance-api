import { Message } from './enum';

export class ErrorObject extends Error {
  code: number | string;
  asHTML: boolean;

  constructor(code: number | string, message: string | Message, asHTML: boolean = false) {
    super(message);
    this.code = code;
    this.asHTML = asHTML;
  }
}
