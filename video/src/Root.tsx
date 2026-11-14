import React from "react";
import { Composition, Folder } from "remotion";
import { ADEGAN, DURASI_TOTAL } from "./daftar-adegan";
import { FPS } from "./tema";
import { VideoRangkul } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Rangkul" component={VideoRangkul} width={1920} height={1080} fps={FPS} durationInFrames={DURASI_TOTAL} />
    <Folder name="Adegan">
      {ADEGAN.map((a) => (
        <Composition key={a.id} id={a.id} component={a.komponen} width={1920} height={1080} fps={FPS} durationInFrames={a.durasi} />
      ))}
    </Folder>
  </>
);
