import Link from 'next/link';
import Image from 'next/image';

/** Fixed top-left "back to landing" control shared by the auth pages. */
export function AuthHomeLink() {
  return (
    <Link
      href="/"
      aria-label="Back to Intervio home"
      className="group fixed left-5 top-5 z-10 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 py-2 pl-3 pr-4 text-base text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
    >
      <Image src="/logo.png" alt="Intervio" width={28} height={28} />
      <span className="font-medium tracking-tight text-foreground">
        Intervio<span className="text-muted-foreground">.ai</span>
      </span>
      <span className="text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/80">
        / home
      </span>
    </Link>
  );
}
