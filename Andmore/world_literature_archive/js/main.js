/* ============================================================
   世界文学名著档案馆 — 主脚本
   World Literature Masterpieces Archive — Main Script
   ============================================================ */

// --- Strict mode and global namespace ---
'use strict';
const LiteratureArchive = (function() {

  // ==================== Configuration ====================
  const CONFIG = {
    animationDuration: 400,
    scrollThreshold: 300,
    notificationDuration: 3500,
    localStoragePrefix: 'lit_archive_',
    bookDataPath: '/data/books.json',
    searchMinChars: 2,
    readingSpeedWPM: 250,
  };

  // ==================== Book Database (Embedded) ====================
  const BOOK_DATABASE = [
    {
      id: 'dream-of-red-mansions',
      title: '红楼梦',
      titleEn: 'Dream of the Red Chamber',
      author: '曹雪芹',
      authorEn: 'Cao Xueqin',
      era: '清代',
      year: '1791',
      region: 'china',
      genre: '长篇小说',
      rating: 9.9,
      pages: 120,
      description: '中国古典四大名著之首，以贾宝玉、林黛玉和薛宝钗的爱情悲剧为主线，描写了贾、王、史、薛四大家族的兴衰，被誉为中国封建社会的百科全书。',
      cover: 'cover-chinese',
      tags: ['古典名著', '爱情', '家族', '悲剧'],
      featured: true
    },
    {
      id: 'three-kingdoms',
      title: '三国演义',
      titleEn: 'Romance of the Three Kingdoms',
      author: '罗贯中',
      authorEn: 'Luo Guanzhong',
      era: '元末明初',
      year: '14世纪',
      region: 'china',
      genre: '历史小说',
      rating: 9.7,
      pages: 120,
      description: '描绘了东汉末年到西晋初年之间近百年的历史风云，以描写战争为主，诉说了东汉末年的群雄割据混战和魏、蜀、吴三国之间的政治和军事斗争。',
      cover: 'cover-chinese',
      tags: ['古典名著', '历史', '战争', '策略'],
      featured: true
    },
    {
      id: 'water-margin',
      title: '水浒传',
      titleEn: 'Water Margin',
      author: '施耐庵',
      authorEn: 'Shi Nai\'an',
      era: '元末明初',
      year: '14世纪',
      region: 'china',
      genre: '英雄传奇',
      rating: 9.5,
      pages: 100,
      description: '描写了北宋末年以宋江为首的108位好汉在梁山起义，以及聚义之后接受招安、四处征战的故事。',
      cover: 'cover-chinese',
      tags: ['古典名著', '英雄', '起义', '侠义'],
      featured: true
    },
    {
      id: 'journey-to-west',
      title: '西游记',
      titleEn: 'Journey to the West',
      author: '吴承恩',
      authorEn: 'Wu Cheng\'en',
      era: '明代',
      year: '16世纪',
      region: 'china',
      genre: '神魔小说',
      rating: 9.6,
      pages: 100,
      description: '中国古典四大名著之一，讲述了唐僧师徒四人西天取经的传奇历险故事，融合了神话、寓言、讽刺等多种元素。',
      cover: 'cover-chinese',
      tags: ['古典名著', '神话', '冒险', '佛教'],
      featured: true
    },
    {
      id: 'don-quixote',
      title: '堂吉诃德',
      titleEn: 'Don Quixote',
      author: '塞万提斯',
      authorEn: 'Miguel de Cervantes',
      era: '文艺复兴',
      year: '1605',
      region: 'western',
      genre: '骑士小说/现代小说先驱',
      rating: 9.5,
      pages: 130,
      description: '现代西方小说的开山之作，讲述了一位沉迷于骑士小说的乡绅堂吉诃德带着侍从桑丘·潘沙"行侠仗义"的故事，充满幽默与深刻的悲剧性。',
      cover: 'cover-western',
      tags: ['经典', '讽刺', '冒险', '哲学'],
      featured: true
    },
    {
      id: 'war-and-peace',
      title: '战争与和平',
      titleEn: 'War and Peace',
      author: '列夫·托尔斯泰',
      authorEn: 'Leo Tolstoy',
      era: '19世纪',
      year: '1869',
      region: 'russia',
      genre: '史诗小说',
      rating: 9.8,
      pages: 150,
      description: '以1812年俄国卫国战争为中心，以四大贵族家庭的生活为线索，反映了1805年至1820年间的重大历史事件，是一部波澜壮阔的史诗巨著。',
      cover: 'cover-russian',
      tags: ['史诗', '历史', '爱情', '哲学'],
      featured: true
    },
    {
      id: 'tale-of-genji',
      title: '源氏物语',
      titleEn: 'The Tale of Genji',
      author: '紫式部',
      authorEn: 'Murasaki Shikibu',
      era: '平安时代',
      year: '11世纪',
      region: 'japan',
      genre: '物语文学',
      rating: 9.4,
      pages: 110,
      description: '世界上第一部长篇小说，以日本平安王朝全盛时期为背景，描写了主人公光源氏的生活经历和爱情故事，展现了日本古典文学的最高成就。',
      cover: 'cover-japanese',
      tags: ['古典', '爱情', '宫廷', '日本文学'],
      featured: true
    },
    {
      id: 'one-hundred-years',
      title: '百年孤独',
      titleEn: 'One Hundred Years of Solitude',
      author: '加西亚·马尔克斯',
      authorEn: 'Gabriel García Márquez',
      era: '20世纪',
      year: '1967',
      region: 'western',
      genre: '魔幻现实主义',
      rating: 9.6,
      pages: 80,
      description: '魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰，反映了拉丁美洲一个世纪以来风云变幻的历史。',
      cover: 'cover-modern',
      tags: ['魔幻现实主义', '家族', '拉美文学', '诺奖'],
      featured: true
    },
    {
      id: 'crime-and-punishment',
      title: '罪与罚',
      titleEn: 'Crime and Punishment',
      author: '陀思妥耶夫斯基',
      authorEn: 'Fyodor Dostoevsky',
      era: '19世纪',
      year: '1866',
      region: 'russia',
      genre: '心理小说',
      rating: 9.5,
      pages: 90,
      description: '穷大学生拉斯柯尼科夫为生计所迫，制造了一起震惊全俄的凶杀案。经历了一场内心痛苦的忏悔后，他最终在基督徒索尼娅的规劝下投案自首。',
      cover: 'cover-russian',
      tags: ['心理', '犯罪', '救赎', '哲学'],
      featured: true
    },
    {
      id: 'pride-prejudice',
      title: '傲慢与偏见',
      titleEn: 'Pride and Prejudice',
      author: '简·奥斯汀',
      authorEn: 'Jane Austen',
      era: '19世纪',
      year: '1813',
      region: 'western',
      genre: '爱情小说',
      rating: 9.2,
      pages: 75,
      description: '以18世纪末19世纪初的英国乡村为背景，围绕班纳特家五个女儿的婚姻大事展开，通过伊丽莎白与达西的爱情故事，展现了对当时社会婚姻观念的深刻洞察。',
      cover: 'cover-western',
      tags: ['爱情', '社会', '女性', '英国文学'],
      featured: false
    },
    {
      id: 'anna-karenina',
      title: '安娜·卡列尼娜',
      titleEn: 'Anna Karenina',
      author: '列夫·托尔斯泰',
      authorEn: 'Leo Tolstoy',
      era: '19世纪',
      year: '1877',
      region: 'russia',
      genre: '现实主义小说',
      rating: 9.4,
      pages: 110,
      description: '贵族妇女安娜追求爱情幸福，却在卡列宁的虚伪、渥伦斯基的冷漠和自私面前碰得头破血流，最终落得卧轨自杀的悲剧下场。',
      cover: 'cover-russian',
      tags: ['爱情', '悲剧', '社会', '俄国文学'],
      featured: false
    },
    {
      id: 'madame-bovary',
      title: '包法利夫人',
      titleEn: 'Madame Bovary',
      author: '福楼拜',
      authorEn: 'Gustave Flaubert',
      era: '19世纪',
      year: '1857',
      region: 'western',
      genre: '现实主义小说',
      rating: 9.1,
      pages: 70,
      description: '受过贵族化教育的农家女爱玛，瞧不起当乡镇医生的丈夫包法利，梦想着传奇式的爱情。可是她的两度偷情非但没有给她带来幸福，却使她成为高利贷者盘剥的对象。',
      cover: 'cover-western',
      tags: ['现实主义', '悲剧', '女性', '法国文学'],
      featured: false
    },
    {
      id: 'great-gatsby',
      title: '了不起的盖茨比',
      titleEn: 'The Great Gatsby',
      author: '菲茨杰拉德',
      authorEn: 'F. Scott Fitzgerald',
      era: '20世纪',
      year: '1925',
      region: 'western',
      genre: '现代主义小说',
      rating: 9.3,
      pages: 55,
      description: '以20世纪20年代的纽约市及长岛为背景，通过尼克·卡拉威的视角叙述了盖茨比的悲剧故事，展现了"美国梦"的破灭和"爵士时代"的浮华。',
      cover: 'cover-modern',
      tags: ['美国梦', '爵士时代', '爱情', '悲剧'],
      featured: false
    },
    {
      id: 'kafka-trial',
      title: '审判',
      titleEn: 'The Trial',
      author: '卡夫卡',
      authorEn: 'Franz Kafka',
      era: '20世纪',
      year: '1925',
      region: 'western',
      genre: '荒诞主义小说',
      rating: 9.0,
      pages: 60,
      description: '在某个早晨，银行职员约瑟夫·K突然被秘密法庭宣布逮捕，却未被告知罪名。他试图弄清自己的案件真相，却发现司法系统如同迷宫般阴暗荒谬。',
      cover: 'cover-modern',
      tags: ['荒诞', '法律', '异化', '现代主义'],
      featured: false
    },
    {
      id: 'moby-dick',
      title: '白鲸',
      titleEn: 'Moby-Dick',
      author: '赫尔曼·梅尔维尔',
      authorEn: 'Herman Melville',
      era: '19世纪',
      year: '1851',
      region: 'western',
      genre: '冒险小说/哲学寓言',
      rating: 9.3,
      pages: 100,
      description: '捕鲸船船长亚哈被一条名叫莫比·迪克的白鲸咬掉了一条腿，从此他疯狂地追逐这头白鲸，最终与白鲸同归于尽。这部小说融合了冒险故事与深刻的哲学思考。',
      cover: 'cover-western',
      tags: ['冒险', '哲学', '海洋', '象征主义'],
      featured: false
    },
    {
      id: 'divine-comedy',
      title: '神曲',
      titleEn: 'The Divine Comedy',
      author: '但丁',
      authorEn: 'Dante Alighieri',
      era: '中世纪',
      year: '1320',
      region: 'western',
      genre: '史诗',
      rating: 9.7,
      pages: 60,
      description: '全诗分为地狱、炼狱、天堂三部分，以诗人自己为主人公，描述了他在古罗马诗人维吉尔的引导下游历地狱和炼狱，又在贝雅特丽齐的引导下游历天堂的经历。',
      cover: 'cover-western',
      tags: ['史诗', '宗教', '寓言', '中世纪'],
      featured: true
    },
    {
      id: 'hamlet',
      title: '哈姆雷特',
      titleEn: 'Hamlet',
      author: '威廉·莎士比亚',
      authorEn: 'William Shakespeare',
      era: '文艺复兴',
      year: '1603',
      region: 'western',
      genre: '悲剧',
      rating: 9.8,
      pages: 40,
      description: '丹麦王子哈姆雷特在德国留学时，突闻父亲死讯。回国奔丧时，父亲鬼魂显灵，告知自己是被弟弟克劳狄斯毒杀。哈姆雷特陷入复仇的煎熬与延宕之中。',
      cover: 'cover-drama',
      tags: ['戏剧', '复仇', '悲剧', '经典'],
      featured: true
    },
    {
      id: 'karamazov',
      title: '卡拉马佐夫兄弟',
      titleEn: 'The Brothers Karamazov',
      author: '陀思妥耶夫斯基',
      authorEn: 'Fyodor Dostoevsky',
      era: '19世纪',
      year: '1880',
      region: 'russia',
      genre: '哲学小说',
      rating: 9.7,
      pages: 130,
      description: '围绕老卡拉马佐夫和他的三个儿子的故事展开——大儿子德米特里、二儿子伊万、小儿子阿廖沙。这是一部关于信仰、理性、自由意志和道德的深刻探讨。',
      cover: 'cover-russian',
      tags: ['哲学', '宗教', '家庭', '心理'],
      featured: false
    },
    {
      id: 'iliad',
      title: '伊利亚特',
      titleEn: 'The Iliad',
      author: '荷马',
      authorEn: 'Homer',
      era: '古希腊',
      year: '公元前8世纪',
      region: 'western',
      genre: '史诗',
      rating: 9.9,
      pages: 70,
      description: '古希腊文学的最高成就之一，叙述了特洛伊战争第十年中发生的故事——"阿喀琉斯的愤怒"，展现了英雄时代的荣耀与悲剧。',
      cover: 'cover-western',
      tags: ['史诗', '神话', '战争', '古希腊'],
      featured: true
    },
    {
      id: 'odyssey',
      title: '奥德赛',
      titleEn: 'The Odyssey',
      author: '荷马',
      authorEn: 'Homer',
      era: '古希腊',
      year: '公元前8世纪',
      region: 'western',
      genre: '史诗',
      rating: 9.6,
      pages: 65,
      description: '伊利亚特的续篇，讲述了希腊英雄奥德修斯在特洛伊战争结束后，历经十年漂泊终于返回家乡伊萨卡的故事。',
      cover: 'cover-western',
      tags: ['史诗', '冒险', '神话', '古希腊'],
      featured: false
    },
    {
      id: 'jane-eyre',
      title: '简·爱',
      titleEn: 'Jane Eyre',
      author: '夏洛蒂·勃朗特',
      authorEn: 'Charlotte Brontë',
      era: '19世纪',
      year: '1847',
      region: 'western',
      genre: '成长小说',
      rating: 9.1,
      pages: 80,
      description: '孤女简·爱自幼父母双亡，在寄养家庭和慈善学校中长大。成为家庭教师后，她与主人罗切斯特相爱。但婚礼前夕，她发现罗切斯特已有疯妻，毅然离去。',
      cover: 'cover-western',
      tags: ['女性', '成长', '爱情', '英国文学'],
      featured: false
    },
    {
      id: 'wuthering-heights',
      title: '呼啸山庄',
      titleEn: 'Wuthering Heights',
      author: '艾米莉·勃朗特',
      authorEn: 'Emily Brontë',
      era: '19世纪',
      year: '1847',
      region: 'western',
      genre: '哥特小说',
      rating: 9.2,
      pages: 65,
      description: '弃儿希斯克利夫被呼啸山庄的主人收养，与主人的女儿凯瑟琳相爱。但因社会地位悬殊，凯瑟琳嫁给了画眉田庄的埃德加。希斯克利夫出走致富后回来复仇。',
      cover: 'cover-western',
      tags: ['哥特', '爱情', '复仇', '荒原'],
      featured: false
    },
    {
      id: 'sound-mountain',
      title: '喧哗与骚动',
      titleEn: 'The Sound and the Fury',
      author: '威廉·福克纳',
      authorEn: 'William Faulkner',
      era: '20世纪',
      year: '1929',
      region: 'western',
      genre: '意识流小说',
      rating: 9.3,
      pages: 60,
      description: '以美国南方没落贵族康普生家族为背景，通过四个不同叙事者的视角，展现了家族的衰败与南方旧秩序的瓦解。意识流技巧的典范之作。',
      cover: 'cover-modern',
      tags: ['意识流', '南方文学', '家族', '美国文学'],
      featured: false
    },
    {
      id: 'in-search-of-lost-time',
      title: '追忆似水年华',
      titleEn: 'In Search of Lost Time',
      author: '马塞尔·普鲁斯特',
      authorEn: 'Marcel Proust',
      era: '20世纪',
      year: '1913',
      region: 'western',
      genre: '意识流小说',
      rating: 9.5,
      pages: 200,
      description: '以第一人称叙述，主人公通过"无意识的记忆"重新发现了往昔的时光。全书以细腻的心理描写著称，被誉为20世纪最伟大的小说之一。',
      cover: 'cover-modern',
      tags: ['意识流', '记忆', '时间', '法国文学'],
      featured: false
    },
    {
      id: 'the-plague',
      title: '鼠疫',
      titleEn: 'The Plague',
      author: '阿尔贝·加缪',
      authorEn: 'Albert Camus',
      era: '20世纪',
      year: '1947',
      region: 'western',
      genre: '存在主义小说',
      rating: 9.1,
      pages: 55,
      description: '阿尔及利亚的奥兰城爆发鼠疫，城市被封闭。里厄医生等人奋起反抗这场灾难。小说通过鼠疫隐喻了面对荒诞世界时人类的抗争与团结。',
      cover: 'cover-philosophy',
      tags: ['存在主义', '瘟疫', '抗争', '寓言'],
      featured: false
    },
    {
      id: 'the-stranger',
      title: '局外人',
      titleEn: 'The Stranger',
      author: '阿尔贝·加缪',
      authorEn: 'Albert Camus',
      era: '20世纪',
      year: '1942',
      region: 'western',
      genre: '存在主义小说',
      rating: 9.0,
      pages: 40,
      description: '默尔索对母亲的去世、情人的爱、朋友的求助乃至自己杀人后被判死刑都表现得无动于衷。通过这个"局外人"形象，加缪揭示了世界的荒诞性。',
      cover: 'cover-philosophy',
      tags: ['存在主义', '荒诞', '疏离', '法国文学'],
      featured: false
    },
    {
      id: 'golden-pavilion',
      title: '金阁寺',
      titleEn: 'The Temple of the Golden Pavilion',
      author: '三岛由纪夫',
      authorEn: 'Yukio Mishima',
      era: '20世纪',
      year: '1956',
      region: 'japan',
      genre: '心理小说',
      rating: 9.0,
      pages: 50,
      description: '以1950年金阁寺被学僧放火烧毁的真实事件为素材，描写了口吃青年沟口对金阁寺之美从崇拜到毁灭的心理历程，探讨了美与毁灭的主题。',
      cover: 'cover-japanese',
      tags: ['心理', '美学', '毁灭', '日本文学'],
      featured: false
    },
    {
      id: 'kafka-shore',
      title: '海边的卡夫卡',
      titleEn: 'Kafka on the Shore',
      author: '村上春树',
      authorEn: 'Haruki Murakami',
      era: '21世纪',
      year: '2002',
      region: 'japan',
      genre: '超现实主义小说',
      rating: 8.9,
      pages: 70,
      description: '15岁的少年田村卡夫卡离家出走，前往四国的高松市。同时，能跟猫说话的中田老人也踏上了旅程。两条平行线的故事交织在一起，充满魔幻色彩。',
      cover: 'cover-japanese',
      tags: ['超现实', '成长', '魔幻', '当代'],
      featured: false
    },
    {
      id: 'norwegian-wood',
      title: '挪威的森林',
      titleEn: 'Norwegian Wood',
      author: '村上春树',
      authorEn: 'Haruki Murakami',
      era: '20世纪',
      year: '1987',
      region: 'japan',
      genre: '爱情小说',
      rating: 8.8,
      pages: 60,
      description: '渡边彻在中年时听到披头士的《挪威的森林》，回忆起18岁时与直子和绿子两个女孩之间的爱情故事。一部关于青春、爱情、死亡与成长的恋歌。',
      cover: 'cover-japanese',
      tags: ['爱情', '青春', '死亡', '音乐'],
      featured: false
    },
    {
      id: 'no-longer-human',
      title: '人间失格',
      titleEn: 'No Longer Human',
      author: '太宰治',
      authorEn: 'Osamu Dazai',
      era: '20世纪',
      year: '1948',
      region: 'japan',
      genre: '私小说',
      rating: 9.2,
      pages: 35,
      description: '主人公大庭叶藏从小就对人类感到恐惧，通过扮演"小丑"来掩饰真实的自己。这是一部半自传体小说，被认为是太宰治的自杀遗书。',
      cover: 'cover-japanese',
      tags: ['私小说', '绝望', '自传', '战后'],
      featured: false
    },
    {
      id: 'snow-country',
      title: '雪国',
      titleEn: 'Snow Country',
      author: '川端康成',
      authorEn: 'Yasunari Kawabata',
      era: '20世纪',
      year: '1948',
      region: 'japan',
      genre: '唯美小说',
      rating: 9.1,
      pages: 30,
      description: '东京的舞蹈艺术研究家岛村三次前往雪国的温泉旅馆，与当地的艺伎驹子和少女叶子之间发生的情感纠葛。川端康成以极致的日式美学描绘了一个虚幻而美丽的世界。',
      cover: 'cover-japanese',
      tags: ['唯美', '爱情', '虚无', '诺奖'],
      featured: false
    },
    {
      id: 'one-thousand-nights',
      title: '一千零一夜',
      titleEn: 'One Thousand and One Nights',
      author: '民间集体创作',
      authorEn: 'Anonymous',
      era: '中世纪',
      year: '8-14世纪',
      region: 'western',
      genre: '民间故事集',
      rating: 9.5,
      pages: 120,
      description: '相传古代萨桑国王山鲁亚尔因王后不忠而痛恨女性，每日娶一少女翌日晨即杀掉。宰相之女山鲁佐德自愿嫁给国王，每晚讲一个故事，讲到最精彩处天亮了，国王为了听结局便不杀她。故事讲了一千零一夜。',
      cover: 'cover-western',
      tags: ['民间故事', '阿拉伯', '奇幻', '冒险'],
      featured: false
    }
  ];

  // ==================== State ====================
  let state = {
    currentPage: null,
    readingList: [],
    bookmarks: [],
    darkMode: false,
    fontSize: 'medium',
    searchHistory: [],
    currentBookView: null,
    scrolledEnough: false,
    visitorCount: 0,
  };

  // ==================== Initialization ====================
  function init() {
    loadState();
    setupNavigation();
    setupSearch();
    setupReadingProgress();
    setupBackToTop();
    setupDarkMode();
    setupReadingList();
    setupBookmarks();
    setupModalSystem();
    setupLazyLoading();
    setupSmoothScroll();
    setupAnimations();
    setupKeyboardShortcuts();
    updateVisitorCount();
    detectCurrentPage();
    logWelcomeMessage();
  }

  // ==================== State Persistence ====================
  function loadState() {
    try {
      const saved = localStorage.getItem(CONFIG.localStoragePrefix + 'state');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.readingList = parsed.readingList || [];
        state.bookmarks = parsed.bookmarks || [];
        state.darkMode = parsed.darkMode || false;
        state.fontSize = parsed.fontSize || 'medium';
        state.searchHistory = parsed.searchHistory || [];
        state.visitorCount = parsed.visitorCount || 0;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  function saveState() {
    try {
      const toSave = {
        readingList: state.readingList,
        bookmarks: state.bookmarks,
        darkMode: state.darkMode,
        fontSize: state.fontSize,
        searchHistory: state.searchHistory,
        visitorCount: state.visitorCount,
        lastVisit: new Date().toISOString(),
      };
      localStorage.setItem(CONFIG.localStoragePrefix + 'state', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  // ==================== Navigation ====================
  function setupNavigation() {
    // Active nav link highlighting
    const currentPath = window.location.pathname;
    document.querySelectorAll('.main-nav a').forEach(link => {
      if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').replace(/^\//, ''))) {
        link.classList.add('active');
      }
    });

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
      navToggle.addEventListener('click', toggleMobileNav);
    }
  }

  function toggleMobileNav() {
    const nav = document.querySelector('.main-nav ul');
    if (nav) {
      nav.classList.toggle('visible');
    }
  }

  function detectCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('literature_hall') || path.includes('hall') || path === '/' || path.endsWith('/')) {
      state.currentPage = 'home';
    } else if (path.includes('chinese')) {
      state.currentPage = 'chinese';
    } else if (path.includes('western')) {
      state.currentPage = 'western';
    } else if (path.includes('russian')) {
      state.currentPage = 'russian';
    } else if (path.includes('japan')) {
      state.currentPage = 'japanese';
    } else if (path.includes('author')) {
      state.currentPage = 'authors';
    } else if (path.includes('reading')) {
      state.currentPage = 'reading';
    } else if (path.includes('about') || path.includes('timeline')) {
      state.currentPage = 'about';
    }
  }

  // ==================== Search System ====================
  function setupSearch() {
    const searchInput = document.querySelector('.search-container input');
    const searchBtn = document.querySelector('.search-container button');

    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch(this.value);
      });
      searchInput.addEventListener('input', debounce(function() {
        if (this.value.length >= CONFIG.searchMinChars) {
          performLiveSearch(this.value);
        }
      }, 300));
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        const input = document.querySelector('.search-container input');
        if (input) performSearch(input.value);
      });
    }
  }

  function performSearch(query) {
    if (!query || query.trim().length < CONFIG.searchMinChars) return;

    query = query.trim().toLowerCase();
    state.searchHistory.unshift(query);
    if (state.searchHistory.length > 20) state.searchHistory.pop();
    saveState();

    const results = BOOK_DATABASE.filter(book => {
      return book.title.includes(query) ||
             book.titleEn.toLowerCase().includes(query) ||
             book.author.includes(query) ||
             book.authorEn.toLowerCase().includes(query) ||
             book.description.includes(query) ||
             book.tags.some(tag => tag.includes(query)) ||
             book.genre.includes(query) ||
             book.era.includes(query);
    });

    showSearchResults(query, results);
  }

  function performLiveSearch(query) {
    if (!query || query.trim().length < CONFIG.searchMinChars) {
      hideLiveSearch();
      return;
    }
    query = query.trim().toLowerCase();
    const results = BOOK_DATABASE.filter(book => {
      return book.title.includes(query) ||
             book.titleEn.toLowerCase().includes(query) ||
             book.author.includes(query);
    }).slice(0, 8);

    showLiveSearchDropdown(results);
  }

  function showSearchResults(query, results) {
    let existingModal = document.querySelector('.modal-overlay.search-results-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay search-results-modal';

    let resultsHTML = results.length > 0
      ? results.map(book => `
        <div class="card fade-in-up" style="margin-bottom:1rem;">
          <div class="card-body">
            <h3>${book.title} <span style="font-size:0.8rem;color:var(--color-ink-light);">${book.titleEn}</span></h3>
            <p class="card-meta">${book.author} · ${book.era} · ${book.region.toUpperCase()} · ⭐${book.rating}</p>
            <p class="card-excerpt">${book.description}</p>
            <div>${book.tags.map(t => `<span class="tag tag-gold">${t}</span>`).join(' ')}</div>
          </div>
        </div>
      `).join('')
      : `<p class="text-center" style="padding:2rem;">未找到与"${query}"相关的名著。请尝试其他关键词。</p>`;

    modal.innerHTML = `
      <div class="modal-content" style="max-width:800px;">
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        <h2 style="color:var(--color-gold-dark);">搜索结果："${query}"</h2>
        <p style="color:var(--color-ink-light);">找到 ${results.length} 本相关名著</p>
        <div style="margin-top:1rem;">${resultsHTML}</div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });
  }

  function showLiveSearchDropdown(results) {
    let dropdown = document.querySelector('.live-search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'live-search-dropdown';
      dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--color-ivory);
        border: 1px solid var(--color-parchment-dark);
        border-radius: 0 0 8px 8px;
        box-shadow: var(--shadow-strong);
        z-index: 1500;
        min-width: 280px;
        max-height: 400px;
        overflow-y: auto;
      `;
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(dropdown);
      }
    }

    if (results.length === 0) {
      dropdown.innerHTML = '<p style="padding:1rem;color:var(--color-ink-light);text-align:center;">未找到匹配书籍</p>';
    } else {
      dropdown.innerHTML = results.map(book => `
        <div class="live-search-item" style="padding:0.6rem 1rem;cursor:pointer;border-bottom:1px solid var(--color-parchment-dark);transition:background 0.2s;"
             onmouseover="this.style.background='var(--color-parchment-light)'"
             onmouseout="this.style.background=''"
             onclick="document.querySelector('.search-container input').value='${book.title}';document.querySelector('.live-search-dropdown').remove();">
          <strong>${book.title}</strong>
          <span style="color:var(--color-ink-light);font-size:0.85rem;display:block;">${book.author} · ⭐${book.rating}</span>
        </div>
      `).join('');
    }
  }

  function hideLiveSearch() {
    const dropdown = document.querySelector('.live-search-dropdown');
    if (dropdown) dropdown.remove();
  }

  // ==================== Reading Progress Bar ====================
  function setupReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', throttle(function() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';

      if (scrollTop > CONFIG.scrollThreshold && !state.scrolledEnough) {
        state.scrolledEnough = true;
      }
    }, 50));
  }

  // ==================== Back to Top Button ====================
  function setupBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '&#9650;';
    btn.title = '返回顶部';
    document.body.appendChild(btn);

    window.addEventListener('scroll', throttle(function() {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 200));

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== Dark Mode ====================
  function setupDarkMode() {
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
    }

    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem(CONFIG.localStoragePrefix + 'state')) {
      document.body.classList.add('dark-mode');
      state.darkMode = true;
    }
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    state.darkMode = document.body.classList.contains('dark-mode');
    saveState();
    showNotification(state.darkMode ? '已切换到夜间模式 🌙' : '已切换到日间模式 ☀️');
  }

  // ==================== Reading List ====================
  function setupReadingList() {
    document.querySelectorAll('.add-to-reading-list').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const bookId = this.dataset.bookId;
        const bookTitle = this.dataset.bookTitle;
        toggleReadingList(bookId, bookTitle, this);
      });
    });

    renderReadingListSidebar();
  }

  function toggleReadingList(bookId, bookTitle, btnElement) {
    const index = state.readingList.indexOf(bookId);
    if (index > -1) {
      state.readingList.splice(index, 1);
      if (btnElement) {
        btnElement.textContent = '📋 加入书架';
        btnElement.classList.remove('btn-crimson');
        btnElement.classList.add('btn-outline');
      }
      showNotification(`"${bookTitle}" 已从书架移除`);
    } else {
      state.readingList.push(bookId);
      if (btnElement) {
        btnElement.textContent = '📋 已在书架';
        btnElement.classList.remove('btn-outline');
        btnElement.classList.add('btn-crimson');
      }
      showNotification(`"${bookTitle}" 已加入书架 📚`);
    }
    saveState();
    renderReadingListSidebar();
  }

  function renderReadingListSidebar() {
    const sidebar = document.querySelector('.reading-list-sidebar');
    if (!sidebar) return;

    if (state.readingList.length === 0) {
      sidebar.innerHTML = '<p style="color:var(--color-ink-light);text-align:center;">书架空空如也<br>快去探索名著吧 📖</p>';
      return;
    }

    sidebar.innerHTML = state.readingList.map(id => {
      const book = BOOK_DATABASE.find(b => b.id === id);
      if (!book) return '';
      return `
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0;border-bottom:1px dotted var(--color-parchment-dark);">
          <span style="flex:1;font-size:0.9rem;">${book.title}</span>
          <button onclick="LiteratureArchive.removeFromList('${id}')" style="background:none;border:none;cursor:pointer;color:var(--color-crimson);font-size:0.8rem;" title="移除">✕</button>
        </div>
      `;
    }).join('');

    const countSpan = document.querySelector('.reading-list-count');
    if (countSpan) countSpan.textContent = state.readingList.length;
  }

  function removeFromReadingList(bookId) {
    const book = BOOK_DATABASE.find(b => b.id === bookId);
    state.readingList = state.readingList.filter(id => id !== bookId);
    saveState();
    renderReadingListSidebar();
    if (book) showNotification(`"${book.title}" 已从书架移除`);
  }

  // ==================== Bookmarks ====================
  function setupBookmarks() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const bookId = this.dataset.bookId;
        toggleBookmark(bookId, this);
      });

      const bookId = btn.dataset.bookId;
      if (state.bookmarks.includes(bookId)) {
        btn.classList.add('bookmarked');
        btn.innerHTML = '🔖 已收藏';
      }
    });
  }

  function toggleBookmark(bookId, btnElement) {
    const index = state.bookmarks.indexOf(bookId);
    if (index > -1) {
      state.bookmarks.splice(index, 1);
      if (btnElement) {
        btnElement.classList.remove('bookmarked');
        btnElement.innerHTML = '🏷 收藏';
      }
    } else {
      state.bookmarks.push(bookId);
      if (btnElement) {
        btnElement.classList.add('bookmarked');
        btnElement.innerHTML = '🔖 已收藏';
      }
    }
    saveState();
  }

  // ==================== Modal System ====================
  function setupModalSystem() {
    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
      }
    });

    // Close modals on overlay click
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.remove();
      }
    });
  }

  function openModal(contentHTML) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        ${contentHTML}
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });
    return modal;
  }

  // ==================== Lazy Loading ====================
  function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      }, { rootMargin: '100px' });

      lazyImages.forEach(img => imageObserver.observe(img));

      // Fade-in elements
      const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
      const fadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      fadeElements.forEach(el => fadeObserver.observe(el));
    }
  }

  // ==================== Smooth Scroll ====================
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ==================== Animations ====================
  function setupAnimations() {
    // Typing effect for hero
    const typingElement = document.querySelector('.typing-effect');
    if (typingElement) {
      const text = typingElement.dataset.text || typingElement.textContent;
      typingElement.textContent = '';
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          typingElement.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 80);
    }

    // Counter animation
    document.querySelectorAll('.counter-animate').forEach(counter => {
      const target = parseInt(counter.dataset.target);
      if (!target) return;
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
              } else {
                counter.textContent = Math.floor(current).toLocaleString();
              }
            }, 16);
            counterObserver.unobserve(counter);
          }
        });
      }, { threshold: 0.5 });

      counterObserver.observe(counter);
    });

    // Parallax effect
    window.addEventListener('scroll', throttle(function() {
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.3;
        const yPos = -(window.scrollY * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    }, 16));
  }

  // ==================== Keyboard Shortcuts ====================
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Ctrl+D = toggle dark mode
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }
      // Ctrl+K = focus search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-container input');
        if (searchInput) searchInput.focus();
      }
      // Ctrl+Home = scroll to top
      if (e.ctrlKey && e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ==================== Notifications ====================
  function showNotification(message, duration) {
    duration = duration || CONFIG.notificationDuration;
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideInRight 0.4s ease reverse';
      setTimeout(() => notification.remove(), 400);
    }, duration);
  }

  // ==================== Visitor Counter ====================
  function updateVisitorCount() {
    state.visitorCount++;
    saveState();

    const counterEl = document.querySelector('.visitor-count');
    if (counterEl) {
      counterEl.textContent = state.visitorCount.toLocaleString();
    }
  }

  // ==================== Tab System ====================
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tabGroup = this.closest('.tabs');
        const tabContainer = tabGroup ? tabGroup.parentElement : null;

        // Deactivate all tabs in group
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        // Activate clicked tab
        this.classList.add('active');

        // Show corresponding content
        const targetId = this.dataset.tab;
        if (tabContainer) {
          tabContainer.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
          });
          const targetContent = tabContainer.querySelector(`#${targetId}`);
          if (targetContent) targetContent.classList.add('active');
        }
      });
    });
  }

  // ==================== Accordion System ====================
  function setupAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', function() {
        const item = this.parentElement;
        const wasOpen = item.classList.contains('open');

        // Close all in same accordion
        const accordion = item.parentElement;
        accordion.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

        // Toggle clicked
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // ==================== Reading Room ====================
  function setupReadingRoom() {
    const fontSizeBtns = document.querySelectorAll('.font-size-btn');
    const textDisplay = document.querySelector('.text-display');

    if (fontSizeBtns.length && textDisplay) {
      fontSizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const size = this.dataset.size;
          textDisplay.style.fontSize = size === 'small' ? '0.9rem' : size === 'large' ? '1.4rem' : '1.15rem';
          state.fontSize = size;
          saveState();
        });
      });
    }

    // Reading timer
    const readingTimer = document.querySelector('.reading-timer');
    if (readingTimer) {
      let startTime = Date.now();
      let timerInterval;

      function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        readingTimer.textContent = `阅读时间: ${mins}分${secs.toString().padStart(2, '0')}秒`;
      }

      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
          } else {
            if (timerInterval) clearInterval(timerInterval);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(readingTimer.closest('.reading-room') || readingTimer);
    }
  }

  // ==================== Book of the Day ====================
  function getBookOfTheDay() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % BOOK_DATABASE.length;
    return BOOK_DATABASE[index];
  }

  function displayBookOfTheDay() {
    const container = document.querySelector('.book-of-the-day');
    if (!container) return;

    const book = getBookOfTheDay();
    container.innerHTML = `
      <div class="featured-book">
        <div class="featured-book-cover ${book.cover}">
          <div class="book-cover-placeholder">
            <div>
              <div style="font-size:2rem;margin-bottom:0.5rem;">📖</div>
              <div style="font-weight:600;">${book.title}</div>
              <div style="font-size:0.8rem;opacity:0.8;">${book.titleEn}</div>
            </div>
          </div>
          <div class="cover-overlay">
            <div style="color:white;">
              <p style="font-size:0.9rem;">${book.description.substring(0, 100)}...</p>
            </div>
          </div>
        </div>
        <div class="featured-book-info">
          <h3>${book.title}</h3>
          <p class="author">${book.author} · ${book.era}</p>
          <div class="rating">${'⭐'.repeat(Math.floor(book.rating))} ${book.rating}</div>
          <p style="font-size:0.85rem;color:var(--color-ink-light);margin-top:0.5rem;">${book.description.substring(0, 120)}...</p>
          <div style="margin-top:0.5rem;">${book.tags.map(t => `<span class="tag tag-gold">${t}</span>`).join(' ')}</div>
        </div>
      </div>
    `;
  }

  // ==================== Random Quote Generator ====================
  const FAMOUS_QUOTES = [
    { text: '满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味？', author: '曹雪芹', source: '《红楼梦》' },
    { text: '滚滚长江东逝水，浪花淘尽英雄。', author: '杨慎', source: '《临江仙·滚滚长江东逝水》' },
    { text: 'To be, or not to be, that is the question.', author: 'William Shakespeare', source: '《哈姆雷特》' },
    { text: '所有幸福的家庭都是相似的，每个不幸福的家庭各有各的不幸。', author: '列夫·托尔斯泰', source: '《安娜·卡列尼娜》' },
    { text: '多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。', author: '加西亚·马尔克斯', source: '《百年孤独》' },
    { text: '人并不是因为美丽才可爱，而是因为可爱才美丽。', author: '列夫·托尔斯泰', source: '《战争与和平》' },
    { text: '世间好物不坚牢，彩云易散琉璃脆。', author: '白居易', source: '《简简吟》' },
    { text: '生存还是毁灭，这是一个值得考虑的问题。', author: '威廉·莎士比亚', source: '《哈姆雷特》' },
    { text: '我们每个人都生活在各自的过去中，人们会用一分钟的时间去认识一个人，用一小时的时间去喜欢一个人，再用一天的时间去爱上一个人，到最后呢，却要用一辈子的时间去忘记一个人。', author: '玛格丽特·米切尔', source: '《飘》' },
    { text: '世界上最宽阔的是海洋，比海洋更宽阔的是天空，比天空更宽阔的是人的胸怀。', author: '维克多·雨果', source: '《悲惨世界》' },
    { text: '人生而自由，却无往不在枷锁之中。', author: '卢梭', source: '《社会契约论》' },
    { text: '这是一个最好的时代，也是一个最坏的时代。', author: '查尔斯·狄更斯', source: '《双城记》' },
    { text: '万物皆有裂痕，那是光照进来的地方。', author: '莱昂纳德·科恩', source: '《颂歌》' },
    { text: '生活不止眼前的苟且，还有诗和远方。', author: '高晓松', source: '（现代名句）' },
  ];

  function getRandomQuote() {
    const quote = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
    return quote;
  }

  function displayRandomQuote() {
    const container = document.querySelector('.random-quote-container');
    if (!container) return;

    const quote = getRandomQuote();
    container.innerHTML = `
      <div class="quote-block fade-in">
        <p class="quote-text">${quote.text}</p>
        <p class="quote-author">—— ${quote.author}</p>
        <p class="quote-source">${quote.source}</p>
      </div>
      <div style="text-align:center;margin-top:0.5rem;">
        <button class="btn btn-outline btn-sm" onclick="LiteratureArchive.displayRandomQuote()">🔄 换一句</button>
      </div>
    `;
  }

  // ==================== Utility Functions ====================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  function logWelcomeMessage() {
    console.log(`
    ╔══════════════════════════════════════════════╗
    ║   📚  世界文学名著档案馆  📚                 ║
    ║  World Literature Masterpieces Archive      ║
    ║                                            ║
    ║  "读书使人充实，讨论使人机智，              ║
    ║   笔记使人准确，读史使人明智，              ║
    ║   读诗使人灵秀，数学使人周密，              ║
    ║   科学使人深刻，伦理学使人庄重，            ║
    ║   逻辑修辞之学使人善辩。"                   ║
    ║                   —— 弗朗西斯·培根         ║
    ║                                            ║
    ║  藏书: ${BOOK_DATABASE.length} 部世界文学经典  ║
    ║  涵盖: 中国 · 西方 · 俄国 · 日本文学       ║
    ╚══════════════════════════════════════════════╝
    `);
  }

  // ==================== Filter System ====================
  function filterBooks(criteria) {
    let filtered = [...BOOK_DATABASE];

    if (criteria.region && criteria.region !== 'all') {
      filtered = filtered.filter(b => b.region === criteria.region);
    }
    if (criteria.genre && criteria.genre !== 'all') {
      filtered = filtered.filter(b => b.genre.includes(criteria.genre));
    }
    if (criteria.era && criteria.era !== 'all') {
      filtered = filtered.filter(b => b.era.includes(criteria.era));
    }
    if (criteria.rating) {
      filtered = filtered.filter(b => b.rating >= criteria.rating);
    }
    if (criteria.search) {
      const q = criteria.search.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.includes(q) || b.titleEn.toLowerCase().includes(q) ||
        b.author.includes(q) || b.description.includes(q)
      );
    }

    return filtered;
  }

  // ==================== Sorting ====================
  function sortBooks(books, sortBy) {
    switch (sortBy) {
      case 'rating': return [...books].sort((a, b) => b.rating - a.rating);
      case 'title': return [...books].sort((a, b) => a.title.localeCompare(b.title, 'zh'));
      case 'year': return [...books].sort((a, b) => parseInt(a.year) - parseInt(b.year));
      case 'pages': return [...books].sort((a, b) => b.pages - a.pages);
      default: return books;
    }
  }

  // ==================== Share Functionality ====================
  function shareBook(bookId) {
    const book = BOOK_DATABASE.find(b => b.id === bookId);
    if (!book) return;

    const shareText = `📚 推荐名著：《${book.title}》(${book.titleEn}) - ${book.author}\n${book.description}\n\n——来自「世界文学名著档案馆」`;

    if (navigator.share) {
      navigator.share({
        title: `《${book.title}》— 世界文学名著档案馆`,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        showNotification('分享文本已复制到剪贴板 📋');
      }).catch(() => {
        showNotification('分享失败，请手动复制');
      });
    }
  }

  // ==================== Estimated Reading Time ====================
  function calculateReadingTime(text) {
    const charCount = text.length;
    const wordsEstimate = charCount / 1.5; // Rough English equivalent
    const minutes = Math.ceil(wordsEstimate / CONFIG.readingSpeedWPM);
    return minutes;
  }

  // ==================== Public API ====================
  return {
    init: init,
    BOOK_DATABASE: BOOK_DATABASE,
    search: performSearch,
    filterBooks: filterBooks,
    sortBooks: sortBooks,
    shareBook: shareBook,
    removeFromList: removeFromReadingList,
    toggleDarkMode: toggleDarkMode,
    displayRandomQuote: displayRandomQuote,
    displayBookOfTheDay: displayBookOfTheDay,
    getRandomQuote: getRandomQuote,
    showNotification: showNotification,
    openModal: openModal,
    setupTabs: setupTabs,
    setupAccordions: setupAccordions,
    setupReadingRoom: setupReadingRoom,
  };

})();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  LiteratureArchive.init();
  LiteratureArchive.displayBookOfTheDay();
  LiteratureArchive.displayRandomQuote();
  LiteratureArchive.setupTabs();
  LiteratureArchive.setupAccordions();
  LiteratureArchive.setupReadingRoom();
});

// Export for global access
window.LiteratureArchive = LiteratureArchive;
