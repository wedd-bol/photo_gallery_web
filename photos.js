/**
 * 替换 src 即可换成自己的照片；留空显示静态占位并从灯箱排除。
 * position / mobilePosition 调整桌面 / 手机裁切中心，灯箱始终保留完整构图。
 * 首页视频、文案、图片与五组日记都在本文件中；id 请保持唯一。
 * 现有素材为 Unsplash 示例，来源见 assets/photos/CREDITS.md。
 */
export const album = {
  name: '光的索引', englishName: 'LIGHT INDEX',
  homeTitle: ['To relive', 'the past journey.'],
  recallTitle: ['Your incredible way to recall', 'memory'],
  motto: ['keep on', 'keeping on'],
  note: ['一些行走，一些停留。', '把无声的瞬间，留给慢慢看的人。'],
  video: 'assets/video/journey.mp4',
  videoPoster: 'assets/video/journey-poster.webp',
};

export const photos = [
  { id: 'clouds', src: 'assets/photos/clouds.webp', title: '云的边界', alt: '暮色下连绵的雪山与云海，天空泛着微暖的光', position: '50% 54%', mobilePosition: '26% 54%' },
  { id: 'ridge', src: 'assets/photos/ridge.webp', title: '山的另一面', alt: '松林覆盖着广阔的山谷，远处是连绵的雪山', position: '50% 55%' },
  { id: 'valley', src: 'assets/photos/valley.webp', title: '沿着光的方向', alt: '树木的剪影与山谷峭壁笼罩在柔和的阳光里', position: '64% 50%' },
  { id: 'forest', src: 'assets/photos/forest.webp', title: '走进一片寂静', alt: '日光穿过细长的树干，照在寂静的林间小路上', position: '42% 50%' },
  { id: 'green', src: 'assets/photos/green.webp', title: '林间的回声', alt: '高大的松林在平静的山间湖水两侧延伸', position: '50% 48%' },
  { id: 'lake', src: 'assets/photos/lake.webp', title: '风停下的地方', alt: '灰蓝色的群山与深绿树林环绕着宁静的湖水', position: '50% 62%' },
  { id: 'reflection', src: 'assets/photos/reflection.webp', title: '另一个世界', alt: '山峰和森林静静倒映在清澈的湖水里', position: '50% 58%' },
  { id: 'night', src: 'assets/photos/night.webp', title: '群星之下', alt: '银河与繁星铺满雪山上方的夜空', position: '50% 48%' },
];

// Five volumes in the film archive. Each opens its own embedded daybook.
// Replace photos above, then edit the entry titles and short diary notes here.
export const volumes = [
  { id: 'wandering', title: 'Wandering', chinese: '山野来信', cover: 'ridge', note: '有些路，走过以后才成为记忆。', entries: [
    { photo: 'ridge', title: '山的另一面', category: 'ON THE ROAD', text: '山谷在眼前慢慢展开。风很轻，远处的雪山没有说话。我们在这里停了一会，把赶路的念头留在了身后。' },
    { photo: 'valley', title: '沿着光的方向', category: 'A LITTLE FURTHER', text: '阳光从树木之间经过，岩壁上留下短暂的明暗。有时候，出发不需要一个更远的理由。' },
    { photo: 'clouds', title: '云的边界', category: 'BEFORE NIGHTFALL', text: '云海漫过山谷，白昼慢慢退到远处。等最后一点光落下，再回到日常。' },
  ] },
  { id: 'woodlands', title: 'Into the woods', chinese: '林间手记', cover: 'forest', note: '把脚步放轻，听见日常之外的声音。', entries: [
    { photo: 'forest', title: '森林的房间', category: 'A QUIET PLACE', text: '我把一些日子记在文字与照片里。光从树梢落下来，地面是柔软的。那一刻，森林像一间没有屋顶的房间。' },
    { photo: 'green', title: '林间的回声', category: 'SLOW AFTERNOON', text: '走过一片深绿，水面忽然出现在眼前。树木与倒影之间，所有声音都慢了下来。' },
    { photo: 'lake', title: '一场停留', category: 'NOTHING TO HURRY', text: '没有什么特别的事情发生。只是光恰好停在这里，而我们也愿意多留一会。' },
  ] },
  { id: 'still-waters', title: 'Still waters', chinese: '水的回声', cover: 'lake', note: '在真实与倒影之间，收藏一些无声的片刻。', entries: [
    { photo: 'lake', title: '风停下的地方', category: 'BY THE WATER', text: '湖面把群山轻轻接住。没有涟漪的时候，世界仿佛有了另一个安静的自己。' },
    { photo: 'reflection', title: '另一个世界', category: 'ANOTHER SIDE', text: '山峰在水里重新生长。我们沿着岸边走，直到分不清是在接近风景，还是走进了它的倒影。' },
    { photo: 'green', title: '一封没有寄出的信', category: 'A SMALL MEMORY', text: '如果记忆可以有一种颜色，我想它会是这片不声张的绿。' },
  ] },
  { id: 'after-dark', title: 'After dark', chinese: '星夜档案', cover: 'night', note: '天色渐暗。那些遥远的光，才慢慢显露出来。', entries: [
    { photo: 'night', title: '群星之下', category: 'AFTER THE LAST LIGHT', text: '城市的灯光退去以后，夜空才显露出它的辽阔。此刻，我们只是山脚下的一粒微光。' },
    { photo: 'clouds', title: '夜的前一刻', category: 'BLUE HOUR', text: '在天色完全暗下来之前，山脊还保留着一点暖色。我们没有说话，只是看着。' },
    { photo: 'ridge', title: '明日的方向', category: 'UNTIL WE WANDER AGAIN', text: '旅途暂时停在这里。等天亮，再沿着光的方向出发。' },
  ] },
  { id: 'collected-light', title: 'Collected light', chinese: '光的切片', cover: 'valley', note: '不为抵达，只为认真看见。', entries: [
    { photo: 'valley', title: '光经过的地方', category: 'COLLECTED MOMENTS', text: '一束光穿过山谷，把寻常的一天照得有些不同。相机只替我们留住了其中一小部分。' },
    { photo: 'reflection', title: '再看一眼', category: 'LOOK A LITTLE LONGER', text: '有些风景值得回头。不是因为它改变了，而是我们终于慢了下来。' },
    { photo: 'forest', title: '仍在路上', category: 'THE DAYBOOK CONTINUES', text: '翻到最后一页，也不算结束。下一次出门，下一次停留，影像手记还会继续。' },
  ] },
];
