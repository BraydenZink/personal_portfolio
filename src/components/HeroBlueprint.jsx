// A steel-frame elevation that draws itself in behind the hero. Purely decorative.
const FRAME_LINES = [
  'M60 460H740',
  'M140 460V120',
  'M300 460V60',
  'M460 460V60',
  'M620 460V180',
  'M140 120L300 60H460L620 180',
  'M140 240H620',
  'M140 350H620',
  'M140 350L300 240M300 350L460 240M460 350L620 240',
  'M140 460L300 350M300 460L460 350M460 460L620 350',
];

export default function HeroBlueprint() {
  return (
    <svg
      viewBox="0 0 800 500"
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 bottom-0 w-[44rem] max-w-none opacity-15 sm:-right-12 lg:right-0 lg:w-[56rem]"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      {FRAME_LINES.map((d, index) => (
        <path
          key={d}
          d={d}
          pathLength="1"
          className="draw-line"
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </svg>
  );
}
