// Dịch vụ mock thông minh cho EduBridge AI: Trả về kết quả chất lượng cao,
// đúng schema hợp đồng và gắn nhãn meta.mode=mock.

const VOCAB_DICTIONARY = {
  "công nghệ": {
    meaning: "Là các ứng dụng khoa học để tạo ra công cụ, máy tính, điện thoại hoặc giải pháp giúp con người học tập và làm việc nhanh hơn, tiện lợi hơn.",
    examples: [
      "Điện thoại thông minh và máy tính bảng là các sản phẩm công nghệ giúp học sinh vùng cao học trực tuyến.",
      "Ứng dụng công nghệ mới giúp bản làng dự báo thời tiết và chăm sóc mùa màng tốt hơn."
    ]
  },
  "bản sắc văn hóa": {
    meaning: "Là những nét đẹp riêng biệt, độc đáo của một dân tộc được lưu giữ qua nhiều thế hệ như trang phục, tiếng nói, lễ hội và phong tục.",
    examples: [
      "Trang phục thổ cẩm nhiều màu sắc và tiếng khèn mùa xuân là bản sắc văn hóa đặc trưng của đồng bào người Mông.",
      "Chúng em luôn tự hào và gìn giữ bản sắc văn hóa dân tộc mình trong các ngày hội trường."
    ]
  },
  "quang hợp": {
    meaning: "Là quá trình cây xanh dùng chất diệp lục ở lá để hấp thụ ánh sáng mặt trời, biến nước và khí cacbonic thành chất dinh dưỡng nuôi cây, đồng thời tạo ra khí oxy sạch cho muôn loài thở.",
    examples: [
      "Nhờ có ánh nắng buổi sớm, cây rừng thực hiện quang hợp để lớn nhanh và làm sạch không khí.",
      "Bảo vệ rừng cây chính là bảo vệ quá trình quang hợp tự nhiên giúp duy trì sự sống."
    ]
  },
  "hệ sinh thái": {
    meaning: "Là một cộng đồng tự nhiên nơi động vật, thực vật, đất, nước và khí hậu cùng sống hòa hợp, tương tác và giúp đỡ lẫn nhau cùng tồn tại.",
    examples: [
      "Rừng đầu nguồn là một hệ sinh thái vô cùng phong phú giúp giữ nguồn nước ngọt cho bà con bản làng.",
      "Khi một loài cây hoặc con vật bị mất đi, toàn bộ hệ sinh thái xung quanh đều có thể bị ảnh hưởng."
    ]
  },
  "di sản": {
    meaning: "Là những tài sản vô giá do ông cha để lại từ xưa, bao gồm các di tích lịch sử, cảnh quan thiên nhiên, làn điệu dân ca và nghề thủ công truyền thống.",
    examples: [
      "Ruộng bậc thang Mù Cang Chải là di sản văn hóa và thắng cảnh kỳ vĩ của đồng bào các dân tộc vùng cao.",
      "Thế hệ trẻ có trách nhiệm học hỏi, trân trọng và bảo tồn các di sản quý giá của quê hương."
    ]
  },
  "đoàn kết": {
    meaning: "Là sự gắn bó, đồng lòng, yêu thương và cùng nhau chung tay làm việc để tạo nên sức mạnh vượt qua khó khăn, thử thách.",
    examples: [
      "Nhờ tinh thần đoàn kết, bà con dân bản đã cùng nhau làm xong cây cầu treo đưa các em nhỏ tới trường.",
      "Đoàn kết là truyền thống quý báu giúp dân tộc Việt Nam vượt qua mọi cuộc kháng chiến giữ nước."
    ]
  },
  "truyền thống": {
    meaning: "Là những thói quen, phong tục, đạo lý tốt đẹp được truyền từ đời này sang đời khác và được mọi người tôn trọng làm theo.",
    examples: [
      "Tôn sư trọng đạo và hiếu thảo với cha mẹ là những truyền thống ngàn đời của người Việt.",
      "Lễ hội lồng tồng đầu năm là một nét đẹp truyền thống cầu mong mùa màng tốt tươi."
    ]
  },
  "tài nguyên": {
    meaning: "Là các của cải quý báu có sẵn trong tự nhiên như đất đai, nguồn nước, rừng cây, khoáng sản và ánh nắng mà con người có thể sử dụng.",
    examples: [
      "Nước sạch và rừng tự nhiên là nguồn tài nguyên vô giá mà mỗi chúng ta đều phải có ý thức bảo vệ.",
      "Sử dụng tiết kiệm tài nguyên giúp môi trường sống luôn xanh tươi và bền vững."
    ]
  },
  "khí hậu": {
    meaning: "Là quy luật thời tiết lặp đi lặp lại qua nhiều năm của một vùng đất, bao gồm nhiệt độ, lượng mưa, độ ẩm và các mùa trong năm.",
    examples: [
      "Vùng núi Tây Bắc có khí hậu mát mẻ về mùa hè nhưng mùa đông thường rét đậm và có sương mù.",
      "Trồng cây gây rừng giúp điều hòa khí hậu và hạn chế sạt lở đất trong mùa mưa bão."
    ]
  },
  "tri thức": {
    meaning: "Là toàn bộ những hiểu biết, kiến thức đúng đắn và kinh nghiệm mà con người tích lũy được qua quá trình học tập và quan sát cuộc sống.",
    examples: [
      "Đọc sách mỗi ngày là con đường tốt nhất để làm giàu tri thức cho bản thân.",
      "Tri thức khoa học giúp người nông dân áp dụng máy móc để tăng năng suất cây trồng."
    ]
  }
};

const COMPLEX_REPLACEMENTS = [
  [/chuyển đổi số/gi, "dùng máy tính và mạng internet"],
  [/ứng dụng/gi, "dùng"],
  [/tri thức/gi, "kiến thức"],
  [/đồng thời/gi, "cùng lúc đó"],
  [/song song với/gi, "cùng với"],
  [/hiểm trở/gi, "gập ghềnh, khó đi"],
  [/kỷ nguyên/gi, "thời kỳ mới"],
  [/ách thống trị/gi, "sự cai trị"],
  [/quang năng/gi, "ánh sáng mặt trời"],
  [/khí quyển/gi, "bầu không khí"],
  [/chất hữu cơ/gi, "chất dinh dưỡng"],
  [/sinh hóa/gi, "tự nhiên của cây"],
  [/khuyến khích/gi, "động viên, cổ vũ"],
  [/bảo tồn/gi, "giữ gìn"],
  [/thích nghi/gi, "làm quen, hòa nhập"]
];

function simplify(text, level = "basic") {
  const clean = text.trim();
  let simplified = clean;

  // Thay thế từ ngữ phức tạp bằng từ ngữ mộc mạc
  for (const [pattern, replacement] of COMPLEX_REPLACEMENTS) {
    simplified = simplified.replace(pattern, replacement);
  }

  const sentences = simplified
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let outputText = "";

  if (level === "advanced") {
    // ĐƠN GIẢN HÓA NÂNG CAO = RÚT GỌN TỐI ĐA, ÍT CHỮ NHẤT, SIÊU DỄ HIỂU
    // Chỉ giữ 1-2 câu cốt lõi ngắn nhất
    if (clean.includes("Điện Biên Phủ")) {
      outputText = "Năm 1954, nhân dân ta đoàn kết dùng xe đạp thồ chở lương thực, đánh thắng giặc ở Điện Biên Phủ và giành lại độc lập.";
    } else if (clean.includes("Quang hợp") || clean.includes("quang hợp")) {
      outputText = "Quang hợp là cách lá cây đón ánh nắng mặt trời và nước để tự tạo thức ăn, rồi nhả ra khí oxy sạch cho chúng ta thở.";
    } else {
      const coreParts = sentences.slice(0, Math.min(2, sentences.length)).map((s) => {
        const firstClause = s.split(",")[0].trim();
        return /[.!?]$/.test(firstClause) ? firstClause : firstClause + ".";
      });
      outputText = coreParts.join(" ");
    }
  } else if (level === "intermediate") {
    // ĐƠN GIẢN HÓA TRUNG BÌNH = CÂU VĂN VỪA PHẢI, CÂN ĐỐI
    if (clean.includes("Điện Biên Phủ")) {
      outputText = "Năm 1954, quân và dân ta đã giành thắng lợi lớn tại Điện Biên Phủ.\n\nDù đường núi Tây Bắc gập ghềnh khó đi, mọi người vẫn đoàn kết giúp nhau chở đồ tiếp tế bằng xe đạp thồ để bảo vệ đất nước.";
    } else if (clean.includes("Quang hợp") || clean.includes("quang hợp")) {
      outputText = "Quang hợp là quá trình cây xanh dùng ánh nắng mặt trời và nước để nuôi cây lớn lên.\n\nĐồng thời, cây nhả ra khí oxy rất cần thiết cho con người và giúp rừng luôn mát mẻ.";
    } else {
      const mediumParts = sentences.flatMap((s) => {
        if (s.length > 70 && s.includes(",")) {
          return s.split(",").map((p) => p.trim()).filter(Boolean).map((p) => (/[.!?]$/.test(p) ? p : p + "."));
        }
        return [s];
      });
      outputText = mediumParts.slice(0, Math.min(3, mediumParts.length)).join("\n\n");
    }
  } else {
    // ĐƠN GIẢN HÓA CƠ BẢN = GIỮ ĐẦY ĐỦ Ý VÀ NGỮ CẢNH (NHIỀU CHỮ HƠN)
    if (clean.includes("Điện Biên Phủ")) {
      outputText = "Chiến thắng Điện Biên Phủ năm 1954 là mốc son lịch sử vô cùng vẻ vang của dân tộc ta.\n\nDưới sự lãnh đạo của Đảng và Bác Hồ, quân dân ta đã phát huy tinh thần đoàn kết, vượt qua đường núi Tây Bắc gập ghềnh, vận chuyển lương thực bằng xe đạp thồ để làm nên chiến thắng lớn, chấm dứt sự cai trị của thực dân và mang lại cuộc sống tự do.";
    } else if (clean.includes("Quang hợp") || clean.includes("quang hợp")) {
      outputText = "Quang hợp là quá trình tự nhiên rất quan trọng diễn ra ở lá cây xanh nhờ ánh sáng mặt trời.\n\nTrong quá trình này, lá cây nhận ánh nắng để chuyển nước và khí trong không khí thành chất dinh dưỡng nuôi cây, cùng lúc đó tạo ra khí oxy sạch giúp hệ sinh thái rừng điều hòa thời tiết và duy trì sự sống cho muôn loài.";
    } else {
      outputText = sentences.join("\n\n");
    }
  }

  // Luôn gắn nhãn [level] để thỏa mãn các test contract của backend
  return {
    simplifiedText: `[${level}] ${outputText || clean}`,
    level,
  };
}

function explain(term, context) {
  const normalized = term.trim().toLowerCase();
  const matched = VOCAB_DICTIONARY[normalized];

  if (matched) {
    return {
      term: term.trim(),
      meaning: matched.meaning,
      examples: matched.examples,
    };
  }

  const cleanTerm = term.trim();
  const titleTerm = cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1);

  return {
    term: cleanTerm,
    meaning: context
      ? `Từ "${titleTerm}" trong câu này mang ý nghĩa: một hành động, sự vật hoặc khái niệm chỉ ${cleanTerm.toLowerCase()}, được thể hiện rõ qua nội dung bài học.`
      : `"${titleTerm}" là một từ ngữ quan trọng trong bài học, dùng để chỉ một sự vật, hiện tượng hoặc tính chất gần gũi trong đời sống học tập.`,
    examples: [
      `Em hãy chú ý cách cô giáo dùng từ "${cleanTerm}" trong bài giảng để hiểu sâu hơn.`,
      `Trong cuộc sống hằng ngày, chúng em thường nhắc tới "${cleanTerm}" khi cùng nhau học nhóm.`
    ],
  };
}

function summarize(text) {
  const clean = text.trim();
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  let summaryParagraph = "";
  let keyPoints = [];

  if (clean.includes("Điện Biên Phủ")) {
    summaryParagraph =
      "Chiến thắng Điện Biên Phủ năm 1954 là mốc son chói lọi trong lịch sử dân tộc. Dưới sự lãnh đạo của Đảng và Bác Hồ, quân dân ta đã đoàn kết vượt qua địa hình hiểm trở, dùng xe đạp thồ vận chuyển lương thực vũ khí để làm nên chiến thắng vẻ vang, mang lại độc lập cho đất nước.";
    keyPoints = [
      "Chiến dịch Điện Biên Phủ diễn ra năm 1954 tại vùng núi rừng Tây Bắc hiểm trở.",
      "Quân và dân ta đã đoàn kết một lòng, vận chuyển lương thực tiếp tế bằng phương tiện thô sơ như xe đạp thồ.",
      "Chiến thắng lịch sử đã chấm dứt ách thống trị thực dân, mở ra kỷ nguyên độc lập tự do cho Tổ quốc."
    ];
  } else if (clean.includes("Quang hợp") || clean.includes("quang hợp")) {
    summaryParagraph =
      "Quang hợp là quá trình quan trọng diễn ra ở lá cây xanh nhờ ánh sáng mặt trời. Cây xanh chuyển hóa nước và khí cacbonic thành chất dinh dưỡng để nuôi cây, đồng thời nhả ra khí oxy giúp duy trì sự sống cho con người và động vật.";
    keyPoints = [
      "Quang hợp diễn ra chủ yếu ở lá cây nhờ chất diệp lục và năng lượng ánh sáng mặt trời.",
      "Cây xanh hấp thụ nước qua rễ và khí cacbonic từ không khí để tạo chất dinh dưỡng.",
      "Quá trình này giải phóng khí oxy sạch, giúp điều hòa khí hậu và bảo vệ nguồn nước ngọt."
    ];
  } else if (sentences.length >= 2) {
    summaryParagraph = sentences.slice(0, 2).join(" ");
    keyPoints = sentences.slice(0, Math.min(sentences.length, 4)).map((s, idx) => `Ý ${idx + 1}: ${s}`);
  } else {
    summaryParagraph = clean;
    keyPoints = [`Ý chính trọng tâm: ${clean}`];
  }

  return {
    summary: summaryParagraph,
    keyPoints: keyPoints.slice(0, 5),
  };
}

function explainDifficultWords(text) {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const foundWords = [];

  for (const [key, val] of Object.entries(VOCAB_DICTIONARY)) {
    if (lower.includes(key)) {
      foundWords.push({
        word: key.charAt(0).toUpperCase() + key.slice(1),
        meaning: val.meaning,
        example: val.examples[0],
      });
    }
  }

  if (foundWords.length > 0) {
    return { words: foundWords.slice(0, 5) };
  }

  const wordsInText = clean.split(/\s+/).filter((w) => w.length >= 4);
  const sampleWord = wordsInText[0] || "Từ khóa chính";

  return {
    words: [
      {
        word: sampleWord,
        meaning: `Là từ khóa trọng tâm giúp em nắm bắt được ý chính trong đoạn văn vừa đọc.`,
        example: `Em hãy đọc kỹ câu văn có chứa từ "${sampleWord}" để hiểu bài nhanh hơn nhé.`,
      },
    ],
  };
}

module.exports = {
  simplify,
  explain,
  summarize,
  explainDifficultWords,
};
