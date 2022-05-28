Deno Vimeo Downloader
===

A vimeo video downloader written in deno

Usage
---

1. Open the browser developer tools on the network tab
2. Start the video (or move mouse over the video).
3. In the "Network" tab, locate the load of the "master.json" file, copy its full URL.
4. Fill in `url` and `name`(using as filename) fields in `list.ts` file
5. Run: `deno --allow-net --allow-write main.ts`
6. Wait for console output `🎉 Finished!`

Limitation
---

Audio file and video file will be downloaded separately, so we need another tool to combined audio & video into one single file.

Here is a example using `ffmpeg` to do that:

```
ffmpeg -i path-to-video.m4v -i path-to-audio.m4a -c copy final-output.mp4
```
