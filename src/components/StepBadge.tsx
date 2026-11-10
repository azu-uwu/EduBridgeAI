interface StepBadgeProps {
  step: number;
  label: string;
}

export function StepBadge({ step, label }: StepBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm"
      >
        {step}
      </span>
      <h2 className="text-base font-bold text-[#0F2942] sm:text-[17px]">
        {label}
      </h2>
    </div>
  );
}

