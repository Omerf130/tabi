import mongoose from "mongoose";

export function isValidObjectId(value: string): boolean {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return false;
  }
  return String(new mongoose.Types.ObjectId(value)) === value;
}
