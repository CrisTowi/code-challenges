export { TracedAlgorithm, runAndTrace } from "./TracedAlgorithm";
export {
  ensureAudioRunning,
  setMuted,
  isMuted,
  playNoteForValue,
  playTone,
  playSuccess,
  playFailure,
  playWoodKnock,
  valueToFrequency,
} from "./audio";
export type {
  Snapshot,
  Trace,
  Example,
  Challenge,
  ChallengeMeta,
  SceneProps,
  AnyChallenge,
} from "./trace";
