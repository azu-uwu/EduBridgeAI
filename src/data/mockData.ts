import { PresetLesson, VocabularyEntry } from '../types/learning';

export const VOCABULARY_DICTIONARY: VocabularyEntry[] = [
  {
    word: 'Công nghệ',
    meaning:
      'Là các ứng dụng khoa học để tạo ra công cụ, thiết bị hoặc giải pháp giúp cuộc sống tốt hơn.',
    example: 'Điện thoại thông minh là một sản phẩm của công nghệ.',
    visualTheme: 'tech',
    imageUrl: '/images/concept-tech.jpg',
  },
  {
    word: 'Bản sắc văn hóa',
    meaning:
      'Là những nét đẹp riêng biệt của một dân tộc như trang phục, tiếng nói, lễ hội và phong tục được truyền qua nhiều đời.',
    example:
      'Trang phục thổ cẩm rực rỡ và tiếng khèn là bản sắc văn hóa đáng tự hào của người Mông.',
    visualTheme: 'culture',
  },
  {
    word: 'Quang hợp',
    meaning:
      'Là cách cây xanh dùng ánh sáng mặt trời, nước và khí trong không khí để tự tạo ra thức ăn nuôi cây và nhả ra khí oxy giúp con người thở.',
    example:
      'Nhờ có ánh nắng buổi sáng, cây rừng trên núi thực hiện quang hợp để lớn nhanh và giữ không khí trong lành.',
    visualTheme: 'photosynthesis',
  },
  {
    word: 'Hệ sinh thái',
    meaning:
      'Là một môi trường tự nhiên nơi cây cối, con vật, đất, nước và ánh sáng cùng sống chung và giúp đỡ lẫn nhau.',
    example:
      'Rừng đầu nguồn là một hệ sinh thái quan trọng giúp giữ nước cho bản làng vào mùa khô.',
    visualTheme: 'ecosystem',
  },
  {
    word: 'Di sản',
    meaning:
      'Là những giá trị quý báu từ thời ông cha để lại, có thể là ngôi nhà cổ, lễ hội, bài hát dân ca hoặc cảnh đẹp thiên nhiên.',
    example:
      'Ruộng bậc thang Mù Cang Chải là một di sản tuyệt đẹp mà người dân vùng cao đã tạo dựng qua nhiều thế hệ.',
    visualTheme: 'heritage',
  },
  {
    word: 'Đoàn kết',
    meaning:
      'Là sự gắn bó, yêu thương và cùng nhau chung sức làm việc để vượt qua khó khăn.',
    example:
      'Nhờ tinh thần đoàn kết, cả bản đã cùng nhau sửa xong con đường đến trường trước ngày khai giảng.',
    visualTheme: 'solidarity',
  },
  {
    word: 'Bảo tồn',
    meaning:
      'Là việc giữ gìn, chăm sóc và bảo vệ những gì quý giá để không bị mất đi theo thời gian.',
    example:
      'Chúng em tham gia câu lạc bộ dệt vải để bảo tồn nghề truyền thống của quê hương.',
    visualTheme: 'culture',
  },
  {
    word: 'Thích nghi',
    meaning:
      'Là khả năng tự điều chỉnh để quen dần và sống tốt trong một hoàn cảnh hoặc môi trường mới.',
    example:
      'Cây thông trên núi cao có lá kim nhỏ để thích nghi với thời tiết lạnh giá mùa đông.',
    visualTheme: 'nature',
  },
  {
    word: 'Năng lượng tái tạo',
    meaning:
      'Là nguồn năng lượng sạch đến từ thiên nhiên như ánh nắng mặt trời, sức gió, dòng nước chảy và không bao giờ cạn kiệt.',
    example:
      'Nhiều điểm trường vùng cao đã lắp tấm pin mặt trời để dùng năng lượng tái tạo thắp sáng lớp học.',
    visualTheme: 'tech',
  },
  {
    word: 'Truyền thống',
    meaning:
      'Là những thói quen tốt đẹp, phong tục, nghề thủ công hoặc tinh thần quý báu được truyền từ đời ông bà cha mẹ sang con cháu.',
    example:
      'Uống nước nhớ nguồn và yêu thương giúp đỡ hàng xóm là truyền thống tốt đẹp của người Việt Nam.',
    visualTheme: 'culture',
  },
  {
    word: 'Tri thức',
    meaning:
      'Là những hiểu biết, kiến thức đúng đắn mà con người học được từ sách vở, thầy cô và cuộc sống.',
    example:
      'Đọc sách mỗi ngày giúp chúng em mở mang tri thức về thiên nhiên và thế giới xung quanh.',
    visualTheme: 'tech',
  },
  {
    word: 'Khí hậu',
    meaning:
      'Là tình hình thời tiết quen thuộc của một vùng qua nhiều năm, như mùa nóng, mùa mưa, mùa lạnh.',
    example:
      'Vùng núi cao có khí hậu mát mẻ vào mùa hè và có sương mù vào sáng sớm mùa đông.',
    visualTheme: 'nature',
  },
  {
    word: 'Tài nguyên',
    meaning:
      'Là những của cải có sẵn trong tự nhiên như đất, nước, rừng cây, ánh nắng mà con người dùng để sống và làm việc.',
    example:
      'Chúng ta cần tiết kiệm nước sạch và trồng thêm cây để bảo vệ tài nguyên thiên nhiên.',
    visualTheme: 'ecosystem',
  },
];

export const QUICK_WORD_PRESETS: string[] = [
  'Công nghệ',
  'Bản sắc văn hóa',
  'Quang hợp',
  'Di sản',
  'Đoàn kết',
];

export const PRESET_LESSONS: PresetLesson[] = [
  {
    id: 'history',
    label: 'Bài học Lịch sử',
    category: 'Lịch sử',
    text:
      'Chiến thắng Điện Biên Phủ năm 1954 là một mốc son chói lọi trong lịch sử đấu tranh dựng nước và giữ nước của dân tộc Việt Nam. Dưới sự lãnh đạo sáng suốt của Đảng và Chủ tịch Hồ Chí Minh, quân và dân ta đã phát huy tinh thần đoàn kết, vượt qua địa hình hiểm trở của núi rừng Tây Bắc, vận chuyển lương thực và vũ khí bằng những đoàn xe đạp thồ thô sơ để làm nên chiến thắng "lừng lẫy năm châu, chấn động địa cầu", chấm dứt ách thống trị của thực dân Pháp và mở ra kỷ nguyên độc lập, tự do.',
    simplifyResults: {
      'nang-cao':
        'Năm 1954, nhân dân ta đoàn kết dùng xe đạp thồ chở lương thực, đánh thắng giặc ở Điện Biên Phủ và giành lại độc lập.',
      'co-ban':
        'Năm 1954, quân và dân ta đã giành thắng lợi lớn tại Điện Biên Phủ.\n\nDù đường núi Tây Bắc gập ghềnh khó đi, mọi người vẫn đoàn kết giúp nhau chở đồ tiếp tế bằng xe đạp thồ để bảo vệ đất nước.',
      'de-hieu':
        'Chiến thắng Điện Biên Phủ năm 1954 là mốc son lịch sử vô cùng vẻ vang của dân tộc ta.\n\nDưới sự lãnh đạo của Bác Hồ, quân dân ta đã đoàn kết vượt qua núi đèo Tây Bắc khó đi, dùng những đoàn xe đạp thồ chở gạo và đồ dùng để đánh thắng quân xâm lược, mang lại cuộc sống tự do cho mọi người.',
    },
    extractedWords: [
      VOCABULARY_DICTIONARY[5], // Đoàn kết
      VOCABULARY_DICTIONARY[4], // Di sản
    ],
    summaryPoints: [
      'Chiến thắng Điện Biên Phủ diễn ra vào năm 1954 tại vùng núi Tây Bắc.',
      'Quân và dân ta đã đoàn kết, vượt qua địa hình núi non hiểm trở bằng xe đạp thồ tiếp tế lương thực.',
      'Chiến thắng này chấm dứt ách thống trị của thực dân Pháp, mang lại độc lập và tự do cho đất nước.',
    ],
  },
  {
    id: 'science',
    label: 'Đoạn văn Khoa học',
    category: 'Khoa học tự nhiên',
    text:
      'Quang hợp là quá trình sinh hóa đặc biệt quan trọng diễn ra chủ yếu ở lá cây xanh dưới tác động của năng lượng ánh sáng mặt trời. Trong quá trình này, chất diệp lục hấp thụ quang năng để chuyển hóa nước từ rễ và khí cacbonic từ khí quyển thành chất hữu cơ nuôi sống thực vật, đồng thời giải phóng khí oxy. Nhờ đó, hệ sinh thái rừng không chỉ duy trì sự sống cho muôn loài mà còn góp phần điều hòa khí hậu và bảo vệ nguồn nước ngọt.',
    simplifyResults: {
      'nang-cao':
        'Quang hợp là cách lá cây đón ánh nắng mặt trời và nước để tự tạo thức ăn, rồi nhả ra khí oxy sạch cho chúng ta thở.',
      'co-ban':
        'Quang hợp là quá trình cây xanh dùng ánh nắng mặt trời và nước để nuôi cây lớn lên.\n\nĐồng thời, cây nhả ra khí oxy rất cần thiết cho con người và giúp rừng luôn mát mẻ.',
      'de-hieu':
        'Quang hợp là quá trình tự nhiên rất quan trọng diễn ra ở lá cây xanh nhờ ánh sáng mặt trời.\n\nTrong quá trình này, lá cây nhận ánh nắng để chuyển nước và khí trong không khí thành chất dinh dưỡng nuôi cây, cùng lúc đó tạo ra khí oxy sạch giúp hệ sinh thái rừng điều hòa thời tiết và duy trì sự sống cho muôn loài.',
    },
    extractedWords: [
      VOCABULARY_DICTIONARY[2], // Quang hợp
      VOCABULARY_DICTIONARY[3], // Hệ sinh thái
    ],
    summaryPoints: [
      'Quang hợp diễn ra ở lá cây xanh nhờ có ánh sáng mặt trời và chất diệp lục.',
      'Cây xanh dùng nước và khí cacbonic để tạo thành chất dinh dưỡng nuôi cây.',
      'Quá trình này tạo ra khí oxy cho sự sống, giúp điều hòa khí hậu và bảo vệ nguồn nước.',
    ],
  },
  {
    id: 'highland',
    label: 'Văn hóa & Công nghệ vùng cao',
    category: 'Xã hội & Đời sống',
    text:
      'Trong thời đại chuyển đổi số hiện nay, việc ứng dụng công nghệ thông tin và năng lượng tái tạo vào giảng dạy tại các điểm trường vùng cao đang mở ra nhiều cơ hội tiếp cận tri thức mới cho học sinh dân tộc thiểu số. Song song với việc làm quen các thiết bị học tập hiện đại, thế hệ trẻ vẫn luôn được khuyến khích giữ gìn và bảo tồn bản sắc văn hóa truyền thống thông qua tiếng nói, trang phục thổ cẩm và các làn điệu dân ca đặc trưng của quê hương mình.',
    simplifyResults: {
      'nang-cao':
        'Công nghệ và điện mặt trời giúp học sinh vùng cao học tập thuận lợi, đồng thời các em luôn giữ gìn tiếng nói và áo thổ cẩm của dân tộc mình.',
      'co-ban':
        'Ngày nay, máy tính và năng lượng sạch giúp các trường vùng cao có thêm nhiều bài học hay.\n\nBên cạnh việc dùng thiết bị hiện đại, các bạn nhỏ vẫn luôn yêu quý và giữ gìn nét đẹp văn hóa quê hương mình.',
      'de-hieu':
        'Trong thời đại ngày nay, việc dùng máy tính, mạng internet và điện mặt trời vào dạy học ở vùng cao đang mở ra nhiều cơ hội học kiến thức mới cho các bạn nhỏ.\n\nCùng với việc làm quen các thiết bị hiện đại, các bạn vẫn luôn được động viên giữ gìn và bảo vệ bản sắc văn hóa qua tiếng nói, trang phục thổ cẩm và các bài dân ca của dân tộc mình.',
    },
    extractedWords: [
      VOCABULARY_DICTIONARY[0], // Công nghệ
      VOCABULARY_DICTIONARY[1], // Bản sắc văn hóa
      VOCABULARY_DICTIONARY[6], // Bảo tồn
    ],
    summaryPoints: [
      'Công nghệ và năng lượng tái tạo giúp học sinh vùng cao học tập và tiếp cận tri thức thuận lợi hơn.',
      'Bên cạnh học tập hiện đại, học sinh vẫn luôn giữ gìn và bảo tồn bản sắc văn hóa dân tộc.',
      'Tiếng nói, trang phục thổ cẩm và dân ca là những nét đẹp quý giá cần được truyền lại.',
    ],
  },
];

