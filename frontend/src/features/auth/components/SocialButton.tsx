import Button from "../../../components/shared/Button";

interface SocialButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  text: string;
}

function GoogleIcon() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center text-[1.55rem] font-semibold leading-none text-slate-900" aria-hidden="true">
      G
    </span>
  );
}

export default function SocialButton({ onClick, disabled = false, text }: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      fullWidth
      disabled={disabled}
      onClick={onClick}
      className="gap-3 whitespace-nowrap"
    >
      <GoogleIcon />
      {text}
    </Button>
  );
}
