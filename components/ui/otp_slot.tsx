import { OTPInput, SlotProps } from "input-otp";

type OtpSlotProps = SlotProps & {
  mask?: boolean;
};

const OtpSlot = ({ mask = false, ...props }: OtpSlotProps) => {
  return (
    <div
      className={`
        relative w-12 h-14 flex items-center justify-center
        text-xl border rounded-md
        ${props.isActive ? "border-(--primary) ring-2 ring-(--primary)/30" : "border-gray-300"}
      `}
    >
      {props.char !== null &&
        (mask ? (
          <div className="w-3 h-3 rounded-full bg-(--primary)" />
        ) : (
          <span>{props.char}</span>
        ))}
      {props.hasFakeCaret && (
        <div className="absolute w-px h-6 bg-(--primary) animate-pulse" />
      )}
    </div>
  );
};

export default OtpSlot;