import { Loader2 } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "../ui/button";

interface OrderOnlineButtonActionProps {
  title: string;
  isLoading: boolean;
  handleAction: ()=> void;
}
export function OrderOnlineButtonAction({ title, isLoading, handleAction}: OrderOnlineButtonActionProps) {
  return (
    <Button 
      onClick={handleAction} 
      disabled={isLoading} 
      className={`w-full bg-amber-600 hover:bg-amber-700  h-12 font-bold ${isLoading ? 'text-slate-900' : 'text-white'}`}
    >
      {isLoading ? (<Fragment>
        <Loader2  className="h-10 w-10 animate-spin text-slate-900 " />
        Processando...
      </Fragment>)  : (title) }
    </Button>
  )
}