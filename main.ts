import { list } from "./list.ts";
import * as path from "https://deno.land/std@0.141.0/path/mod.ts";
import { decode } from "https://deno.land/std@0.141.0/encoding/base64.ts";
import { writeAllSync } from "https://deno.land/std@0.141.0/streams/conversion.ts";

for (const item of list) {
  console.log(`📦 Starting Download ${item.name}`);

  const { href, origin, pathname } = new URL(item.url);

  const response = await fetch(href);

  const data = await response.json();

  console.log(`📦 📹 Starting Download video...`);

  const bestQualityVideo = data.video.reduce((video1: any, video2: any) =>
    video1.bitrate > video2.bitrate ? video1 : video2
  );

  const videoBaseDirname = path.posix.resolve(
    path.posix.dirname(pathname),
    data.base_url,
    bestQualityVideo.base_url
  );

  const videoSegmentsUrl = bestQualityVideo.segments.map(
    (segment: { url: string }) => segment.url
  ) as string[];

  const videoFile = Deno.openSync(`./parts/${item.name}.m4v`, {
    write: true,
    create: true,
    append: true,
  });

  const initialVideoSegment = new Uint8Array(
    decode(bestQualityVideo.init_segment)
  );
  writeAllSync(videoFile, initialVideoSegment);

  for (let i = 0; i < videoSegmentsUrl.length; i++) {
    const url = `${origin}${videoBaseDirname}/${videoSegmentsUrl[i]}`;

    const response = await fetch(url);
    const data = new Uint8Array(await response.arrayBuffer());
    writeAllSync(videoFile, data);

    console.log(
      `📦 📹 Downloaded video segment ${i + 1}/${videoSegmentsUrl.length}`
    );
  }

  Deno.close(videoFile.rid);
  console.log(`📦 📹 Downloaded video successfully!`);

  console.log(`📦 🎧 Starting Download audio...`);

  const bestQualityAudio = data.audio.reduce((audio1: any, audio2: any) =>
    audio1.bitrate > audio2.bitrate ? audio1 : audio2
  );

  const audioBaseDirname = path.posix.resolve(
    path.posix.dirname(pathname),
    data.base_url,
    bestQualityAudio.base_url
  );

  const audioSegmentsUrl = bestQualityAudio.segments.map(
    (segment: { url: string }) => segment.url
  ) as string[];

  const audioFile = Deno.openSync(`./parts/${item.name}.m4a`, {
    write: true,
    create: true,
    append: true,
  });

  const initialAudioSegment = new Uint8Array(
    decode(bestQualityAudio.init_segment)
  );
  writeAllSync(audioFile, initialAudioSegment);

  for (let i = 0; i < audioSegmentsUrl.length; i++) {
    const fullAudioSegmentUrl = `${origin}${audioBaseDirname}/${audioSegmentsUrl[i]}`;

    const response = await fetch(fullAudioSegmentUrl);
    const data = new Uint8Array(await response.arrayBuffer());
    writeAllSync(audioFile, data);

    console.log(
      `📦 🎧 Downloaded audio segment ${i + 1}/${audioSegmentsUrl.length}`
    );
  }

  Deno.close(audioFile.rid);

  console.log(`📦 🎧 Downloaded audio successfully!`);

  console.log(`📦 Downloaded ${item.name} successfully!`);
}

console.log(`🎉 Finished!`);
