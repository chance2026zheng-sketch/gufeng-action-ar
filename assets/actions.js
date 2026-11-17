/**
 * 四个动作的共享配置。
 * planeHeight = 追踪图高 / 宽，因为 MindAR 锚点内 1 单位 = 图片宽度，原点在图片中心。
 * 视频实际宽高比与追踪图误差 <0.2%，因此按追踪图比例铺满不会变形。
 */
window.AR_ACTIONS = {
  fangzhi: {
    key: 'fangzhi',
    name: '纺织',
    desc: '拉线、收手与纺轮转动相互配合',
    img: 'assets/img/fangzhi.png',
    video: 'assets/video/fangzhi.mp4',
    target: 'assets/targets/fangzhi.mind',
    px: [731, 800],
    planeHeight: 800 / 731,
    color: '#e8b7b7'
  },
  jigu: {
    key: 'jigu',
    name: '击鼓',
    desc: '抬臂蓄力 → 鼓槌落下接触鼓面 → 回弹',
    img: 'assets/img/jigu.png',
    video: 'assets/video/jigu.mp4',
    target: 'assets/targets/jigu.mind',
    px: [800, 600],
    planeHeight: 600 / 800,
    color: '#f0d9a8'
  },
  qifu: {
    key: 'qifu',
    name: '祈福',
    desc: '手臂带动鼓和鼓槌，头饰、飘带延迟摆动',
    img: 'assets/img/qifu.png',
    video: 'assets/video/qifu.mp4',
    target: 'assets/targets/qifu.mind',
    px: [800, 600],
    planeHeight: 600 / 800,
    color: '#f2c6c6'
  },
  shuxie: {
    key: 'shuxie',
    name: '书写',
    desc: '落笔 → 运笔 → 提笔，手腕与毛笔同步',
    img: 'assets/img/shuxie.png',
    video: 'assets/video/shuxie.mp4',
    target: 'assets/targets/shuxie.mind',
    px: [602, 800],
    planeHeight: 800 / 602,
    color: '#cfe3d0'
  }
};

window.AR_ORDER = ['fangzhi', 'jigu', 'qifu', 'shuxie'];

window.getAction = function (key) {
  return window.AR_ACTIONS[key] || null;
};
