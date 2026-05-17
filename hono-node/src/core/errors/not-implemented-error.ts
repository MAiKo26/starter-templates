import { AppError } from "@/core/errors/app-error";

export class NotImplementedError extends AppError {
  constructor(message: string) {
    super(message, 501);
  }
}
