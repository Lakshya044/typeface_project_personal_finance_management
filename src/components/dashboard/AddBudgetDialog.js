"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BudgetForm from "@/components/forms/BudgetForm";

export default function AddBudgetDialog({ defaultMonth }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Set Budget
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-gray-800 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Create New Budget</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set spending limits for different categories to track your financial goals.
          </DialogDescription>
        </DialogHeader>

        <BudgetForm
          defaultMonth={defaultMonth}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
