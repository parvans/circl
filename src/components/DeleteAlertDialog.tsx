"use client";
import React from 'react'
import { Loader2Icon, Trash2Icon } from 'lucide-react'
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, 
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from './ui/alert-dialog';
import { Button } from './ui/button';

interface DeleteAlertDialogPros {
    isDeleting:boolean;
    onDelete:()=>Promise<void>;
    title?:string;
    description?:string;
}
export default function DeleteAlertDialog({
    isDeleting, 
    onDelete,
    title="Delete Post",
    description="This action cannot be undone."
    }:DeleteAlertDialogPros) {
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button 
            variant={"ghost"}
            size={"sm"}
            className='text-muted-foreground hover:text-red-500 -mr-2'
            >
                {
                    isDeleting ? (
                        <Loader2Icon className='size-4 animate-spin' />
                    )
                    :(
                        <Trash2Icon className='size-4'/>
                    )
                }
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                onClick={onDelete}
                className='bg-red-500 hover:bg-red-600'
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}
