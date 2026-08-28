"use client";

import * as React from "react";
import { CircleCheck, X } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";

type SuccessToast = {
	title: string;
	description?: string;
};

type ToastContextValue = {
	showSuccessToast: (toast: SuccessToast) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = React.useState(false);
	const [toast, setToast] = React.useState<SuccessToast>({
		title: "",
		description: ""
	});

	const showSuccessToast = React.useCallback((nextToast: SuccessToast) => {
		setToast(nextToast);
		setOpen(true);
	}, []);

	const value = React.useMemo(() => ({ showSuccessToast }), [showSuccessToast]);

	return (
		<ToastContext.Provider value={value}>
			<ToastPrimitive.Provider swipeDirection="right" duration={4000}>
				{children}

				<ToastPrimitive.Root
					open={open}
					onOpenChange={setOpen}
					className="border-success/30 bg-popover text-popover-foreground data-open:animate-in data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border p-4 shadow-lg duration-200 motion-reduce:animate-none"
				>
					<div className="bg-success/10 text-success flex size-9 items-center justify-center rounded-lg">
						<CircleCheck aria-hidden="true" className="size-5" />
					</div>

					<div className="min-w-0 pt-0.5">
						<ToastPrimitive.Title className="text-sm font-semibold">
							{toast.title}
						</ToastPrimitive.Title>
						{toast.description ? (
							<ToastPrimitive.Description className="text-muted-foreground mt-1 text-sm leading-5">
								{toast.description}
							</ToastPrimitive.Description>
						) : null}
					</div>

					<ToastPrimitive.Close
						aria-label="Đóng thông báo"
						className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 flex size-7 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-3"
					>
						<X aria-hidden="true" className="size-4" />
					</ToastPrimitive.Close>
				</ToastPrimitive.Root>

				<ToastPrimitive.Viewport className="fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none sm:top-5 sm:right-5" />
			</ToastPrimitive.Provider>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = React.useContext(ToastContext);

	if (!context) {
		throw new Error("useToast must be used within ToastProvider");
	}

	return context;
}
