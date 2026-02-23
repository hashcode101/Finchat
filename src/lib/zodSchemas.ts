import { z } from "zod";
import { AccountType } from "@/types/account";
import { TransactionType, RecurringInterval } from "@/types/transaction";

// Project name validation schema
// Requirements:
// - Up to 100 characters long
// - Must be lowercase
// - Can only include letters, digits, and underscores
// - Cannot start with a digit
export const projectNameSchema = z
  .string()
  .min(1, "Project name is required")
  .max(100, "Project name must be at most 100 characters")
  .toLowerCase()
  .refine((val) => /^[a-z_][a-z0-9_]*$/.test(val), {
    message: "Project name must start with a letter or underscore, and can only contain lowercase letters, digits, and underscores",
  });

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(AccountType),
  balance: z
    .string()
    .min(1, "Initial balance is required")
    .refine((val) => parseFloat(val) > 0, {
      message: "Balance must be greater than 0",
    }),
  isDefault: z.boolean().default(false),
});

// Create a schema that matches TransactionFormData
export const transactionSchema = z
  .object({
    type: z.nativeEnum(TransactionType),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.nativeEnum(RecurringInterval).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });
