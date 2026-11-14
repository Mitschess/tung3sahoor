import React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { ADEGAN, PANJANG_TRANSISI } from "./daftar-adegan";

const Transisi = (t: "fade" | "slide" | "wipe" | undefined) => {
  const timing = linearTiming({ durationInFrames: PANJANG_TRANSISI });
  if (t === "slide") return <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />;
  if (t === "wipe") return <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={timing} />;
  return <TransitionSeries.Transition presentation={fade()} timing={timing} />;
};

export const VideoRangkul: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {ADEGAN.map((a, i) => {
          const Komponen = a.komponen;
          return (
            <React.Fragment key={a.id}>
              {i > 0 ? Transisi(a.transisi) : null}
              <TransitionSeries.Sequence name={a.id} durationInFrames={a.durasi}>
                <Komponen />
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      <Audio
        src={staticFile("musik/latar.mp3")}
        volume={(f) => interpolate(f, [0, 30, durationInFrames - 60, durationInFrames - 1], [0, 0.55, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
