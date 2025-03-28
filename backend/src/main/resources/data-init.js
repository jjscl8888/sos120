// MongoDB 初始化脚本
const categories = [
  {
    categoryKey: 'trauma',
    subcategories: ['创伤评估流程', '止血包扎技术', '骨折固定方法', '伤口处理原则']
  },
  {
    categoryKey: 'poisoning',
    subcategories: ['食物中毒处理', '化学物中毒急救', '药物过量应对', '有毒气体急救']
  },
  {
    categoryKey: 'cpr',
    subcategories: ['成人CPR步骤', '儿童CPR要点', 'AED使用指南', '复苏后护理']
  },
  {
    categoryKey: 'bleeding',
    subcategories: ['直接压迫止血', '止血带应用', '伤口填塞法', '特殊部位止血']
  },
  {
    categoryKey: 'burn',
    subcategories: ['烧伤深度判断', '冷却处理流程', '水泡处理原则', '化学烧伤急救']
  }
];

db.categories.insertMany(categories);

// 根据contentData.js生成contents集合数据
const contentData = ${require('./contentData.js').contentData};

Object.entries(contentData).forEach(([categoryKey, subcategories]) => {
  Object.entries(subcategories).forEach(([subcategoryKey, content]) => {
    db.contents.insert({
      categoryKey,
      subcategoryKey,
      title: content.title,
      steps: content.steps,
      precautions: content.precautions,
      videoURL: content.videoURL || []
    });
  });
});